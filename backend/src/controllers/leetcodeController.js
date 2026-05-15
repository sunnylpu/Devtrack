const { sendSuccess, sendError } = require('../utils/response');
const axios = require('axios');

/**
 * LeetCode Controller
 * Uses LeetCode's public GraphQL API (no auth needed) to fetch a user's profile & stats.
 */

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

/**
 * @route   GET /api/leetcode/profile/:username
 * @access  Protected
 * Fetch a LeetCode user's public profile + solve stats
 */
const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username) return sendError(res, 'LeetCode username is required', 400);

    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
            aboutMe
            userAvatar
            reputation
            ranking
            starRating
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          badges {
            name
            icon
          }
        }
      }
    `;

    const response = await axios.post(
      LEETCODE_GRAPHQL,
      { query, variables: { username } },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const user = response.data?.data?.matchedUser;
    if (!user) return sendError(res, 'LeetCode user not found', 404);

    // Parse submission stats
    const stats = {};
    (user.submitStatsGlobal?.acSubmissionNum || []).forEach(s => {
      stats[s.difficulty.toLowerCase()] = s.count;
    });

    return sendSuccess(res, {
      username: user.username,
      realName: user.profile?.realName || '',
      avatar: user.profile?.userAvatar || '',
      ranking: user.profile?.ranking || 0,
      reputation: user.profile?.reputation || 0,
      starRating: user.profile?.starRating || 0,
      solved: {
        all: (stats.all || 0),
        easy: (stats.easy || 0),
        medium: (stats.medium || 0),
        hard: (stats.hard || 0),
      },
      badges: (user.badges || []).slice(0, 10),
    });
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 404) {
      return sendError(res, 'LeetCode user not found', 404);
    }
    next(error);
  }
};

/**
 * @route   GET /api/leetcode/calendar/:username
 * @access  Protected
 * Fetch submission calendar (heatmap data) for a LeetCode user
 */
const getCalendar = async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username) return sendError(res, 'LeetCode username is required', 400);

    const query = `
      query getUserCalendar($username: String!) {
        matchedUser(username: $username) {
          submissionCalendar
        }
      }
    `;

    const response = await axios.post(
      LEETCODE_GRAPHQL,
      { query, variables: { username } },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const user = response.data?.data?.matchedUser;
    if (!user) return sendError(res, 'LeetCode user not found', 404);

    // submissionCalendar is a JSON string: { "timestamp": count, ... }
    let calendar = {};
    try {
      calendar = JSON.parse(user.submissionCalendar || '{}');
    } catch {
      calendar = {};
    }

    // Convert to array format
    const entries = Object.entries(calendar).map(([ts, count]) => ({
      date: new Date(parseInt(ts) * 1000).toISOString().split('T')[0],
      count,
    }));

    return sendSuccess(res, {
      username,
      totalActiveDays: entries.filter(e => e.count > 0).length,
      calendar: entries,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/leetcode/recent/:username
 * @access  Protected
 * Fetch recent accepted submissions
 */
const getRecentSubmissions = async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username) return sendError(res, 'LeetCode username is required', 400);

    const query = `
      query getRecentSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          title
          titleSlug
          timestamp
          lang
          statusDisplay
        }
      }
    `;

    const response = await axios.post(
      LEETCODE_GRAPHQL,
      { query, variables: { username, limit: 15 } },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const submissions = response.data?.data?.recentAcSubmissionList || [];

    return sendSuccess(res, {
      username,
      submissions: submissions.map(s => ({
        title: s.title,
        slug: s.titleSlug,
        url: `https://leetcode.com/problems/${s.titleSlug}/`,
        timestamp: new Date(parseInt(s.timestamp) * 1000).toISOString(),
        language: s.lang,
        status: s.statusDisplay,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/leetcode/connect
 * @access  Protected
 * Save LeetCode username to user profile
 */
const connectLeetCode = async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username) return sendError(res, 'Username is required', 400);

    // Verify the username exists on LeetCode
    const query = `
      query { matchedUser(username: "${username}") { username } }
    `;
    const check = await axios.post(LEETCODE_GRAPHQL, { query }, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!check.data?.data?.matchedUser) {
      return sendError(res, 'LeetCode user not found', 404);
    }

    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      'leetcode.username': username,
    });

    return sendSuccess(res, { username }, 'LeetCode connected');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/leetcode/disconnect
 * @access  Protected
 */
const disconnectLeetCode = async (req, res, next) => {
  try {
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { leetcode: 1 },
    });
    return sendSuccess(res, {}, 'LeetCode disconnected');
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, getCalendar, getRecentSubmissions, connectLeetCode, disconnectLeetCode };
