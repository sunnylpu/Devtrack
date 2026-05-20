const { sendSuccess } = require('../utils/response');
const axios = require('axios');

/**
 * @route   GET /api/github/connect
 * @access  Protected
 * Redirect to GitHub OAuth
 */
const connectGitHub = (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: 'read:user user:email repo',
    state: req.user._id.toString(),
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};

/**
 * @route   GET /api/github/callback
 * @access  Public (GitHub redirects here)
 */
const githubCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    const User = require('../models/User');

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      },
      { headers: { Accept: 'application/json' } }
    );

    const { access_token } = tokenResponse.data;

    // Fetch GitHub user profile
    const profileResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile = profileResponse.data;

    // Save to user
    await User.findByIdAndUpdate(state, {
      'github.id': profile.id.toString(),
      'github.username': profile.login,
      'github.accessToken': access_token,
      'github.profileUrl': profile.html_url,
      'github.avatarUrl': profile.avatar_url,
    });

    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/github?connected=true`);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/github/activity
 * @access  Protected
 */
const getActivity = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id).select('+github.accessToken');

    if (!user.github || !user.github.accessToken) {
      return res.status(200).json({
        success: true,
        message: 'GitHub not connected',
        data: { connected: false },
      });
    }

    const headers = { Authorization: `Bearer ${user.github.accessToken}` };

    const [reposRes, eventsRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${user.github.username}/repos?sort=updated&per_page=10`, { headers }),
      axios.get(`https://api.github.com/users/${user.github.username}/events?per_page=30`, { headers }),
    ]);

    const repos = reposRes.data.map((r) => ({
      name: r.name,
      url: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
      updatedAt: r.updated_at,
    }));

    // Extract push events / commit activity
    const pushEvents = eventsRes.data.filter((e) => e.type === 'PushEvent');
    const recentCommits = pushEvents.flatMap((e) =>
      e.payload.commits.map((c) => ({
        message: c.message,
        repo: e.repo.name,
        date: e.created_at,
      }))
    ).slice(0, 20);

    // Language distribution from repos
    const langMap = {};
    reposRes.data.forEach((r) => {
      if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
    });
    const languages = Object.entries(langMap)
      .sort((a, b) => b[1] - a[1])
      .map(([lang, count]) => ({ lang, count }));

    return sendSuccess(res, {
      connected: true,
      username: user.github.username,
      profileUrl: user.github.profileUrl,
      avatarUrl: user.github.avatarUrl,
      repos,
      recentCommits,
      languages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/github/heatmap
 * @access  Protected
 * Returns contribution heatmap data for the past year
 */
const getHeatmap = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id).select('+github.accessToken');

    if (!user.github || !user.github.accessToken) {
      return sendSuccess(res, { connected: false, heatmap: [] });
    }

    // Use GitHub GraphQL API for contribution data
    const query = `
      query {
        user(login: "${user.github.username}") {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  color
                }
              }
            }
          }
        }
      }
    `;

    const response = await axios.post(
      'https://api.github.com/graphql',
      { query },
      { headers: { Authorization: `Bearer ${user.github.accessToken}` } }
    );

    const calendar =
      response.data?.data?.user?.contributionsCollection?.contributionCalendar;

    return sendSuccess(res, {
      connected: true,
      totalContributions: calendar?.totalContributions || 0,
      weeks: calendar?.weeks || [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/github/disconnect
 * @access  Protected
 */
const disconnectGitHub = async (req, res, next) => {
  try {
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { github: 1 },
    });
    return sendSuccess(res, {}, 'GitHub disconnected');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/github/profile/:username
 * @access  Protected
 * Fetch public GitHub profile by username
 */
const getPublicProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ success: false, message: 'GitHub username is required' });

    const headers = {};
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const response = await axios.get(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers });
    const u = response.data;
    if (!u) return res.status(404).json({ success: false, message: 'GitHub user not found' });

    return sendSuccess(res, {
      username: u.login,
      name: u.name || '',
      avatarUrl: u.avatar_url,
      profileUrl: u.html_url,
      bio: u.bio || '',
      company: u.company || '',
      blog: u.blog || '',
      location: u.location || '',
      publicRepos: u.public_repos || 0,
      followers: u.followers || 0,
      following: u.following || 0,
      createdAt: u.created_at,
    });
  } catch (error) {
    if (error.response?.status === 404) return res.status(404).json({ success: false, message: 'GitHub user not found' });
    next(error);
  }
};

/**
 * @route   GET /api/github/repos/:username
 * @access  Protected
 * Fetch public repos for a GitHub user
 */
const getPublicRepos = async (req, res, next) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page || '1', 10);
    if (!username) return res.status(400).json({ success: false, message: 'GitHub username is required' });

    const headers = {};
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const response = await axios.get(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}`,
      { headers }
    );

    const repos = (response.data || []).map((r) => ({
      name: r.name,
      url: r.html_url,
      description: r.description || '',
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      updatedAt: r.updated_at,
    }));

    return sendSuccess(res, { username, repos, page });
  } catch (error) {
    if (error.response?.status === 404) return res.status(404).json({ success: false, message: 'GitHub user not found' });
    next(error);
  }
};

/**
 * @route   GET /api/github/recent/:username
 * @access  Protected
 * Fetch recent public events (commits/pushes) for a GitHub user
 */
const getPublicRecent = async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ success: false, message: 'GitHub username is required' });

    const headers = {};
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const eventsRes = await axios.get(`https://api.github.com/users/${encodeURIComponent(username)}/events?per_page=50`, { headers });

    const pushEvents = (eventsRes.data || []).filter((e) => e.type === 'PushEvent');

    const recentCommits = pushEvents.flatMap((e) =>
      (e.payload?.commits || []).map((c) => ({
        message: c.message,
        repo: e.repo?.name,
        date: e.created_at,
        url: c.url ? c.url.replace('api.github.com/repos', 'github.com').replace('/commits/', '/commit/') : undefined,
      }))
    ).slice(0, 50);

    return sendSuccess(res, { username, recentCommits });
  } catch (error) {
    if (error.response?.status === 404) return res.status(404).json({ success: false, message: 'GitHub user not found' });
    next(error);
  }
};

module.exports = { connectGitHub, githubCallback, getActivity, getHeatmap, disconnectGitHub, getPublicProfile, getPublicRepos, getPublicRecent };
