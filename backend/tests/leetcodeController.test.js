const {
  getProfile,
  getCalendar,
  getRecentSubmissions,
  connectLeetCode,
  disconnectLeetCode,
} = require('../src/controllers/leetcodeController');
const User = require('../src/models/User');
const { sendSuccess, sendError } = require('../src/utils/response');
const axios = require('axios');

jest.mock('../src/models/User');
jest.mock('axios');
jest.mock('../src/utils/response', () => ({
  sendSuccess: jest.fn(),
  sendError: jest.fn(),
}));

describe('LeetCode Controller Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { _id: 'mockUserId' },
      query: {},
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return 400 when username is not provided', async () => {
      req.params = {};

      await getProfile(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'LeetCode username is required', 400);
    });

    it('should return 404 when matchedUser is null on LeetCode', async () => {
      req.params = { username: 'nonexistent_user' };
      axios.post.mockResolvedValue({
        data: { data: { matchedUser: null } },
      });

      await getProfile(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'LeetCode user not found', 404);
    });

    it('should return profile and parsed stats when user exists', async () => {
      req.params = { username: 'sunnytyagi' };
      axios.post.mockResolvedValue({
        data: {
          data: {
            matchedUser: {
              username: 'sunnytyagi',
              profile: { realName: 'Sunny', ranking: 15000 },
              submitStatsGlobal: {
                acSubmissionNum: [
                  { difficulty: 'All', count: 350 },
                  { difficulty: 'Easy', count: 150 },
                  { difficulty: 'Medium', count: 170 },
                  { difficulty: 'Hard', count: 30 },
                ],
              },
              badges: [{ name: '50 Days 2026' }],
            },
          },
        },
      });

      await getProfile(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          username: 'sunnytyagi',
          ranking: 15000,
          solved: {
            all: 350,
            easy: 150,
            medium: 170,
            hard: 30,
          },
        })
      );
    });
  });

  describe('getCalendar', () => {
    it('should parse submission calendar JSON string into entries array', async () => {
      req.params = { username: 'sunnytyagi' };
      const timestamp = '1725062400'; // Unix timestamp
      const mockCalendarStr = JSON.stringify({ [timestamp]: 3 });

      axios.post.mockResolvedValue({
        data: {
          data: {
            matchedUser: {
              submissionCalendar: mockCalendarStr,
            },
          },
        },
      });

      await getCalendar(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          username: 'sunnytyagi',
          totalActiveDays: 1,
          calendar: expect.arrayContaining([
            expect.objectContaining({ count: 3 }),
          ]),
        })
      );
    });
  });

  describe('getRecentSubmissions', () => {
    it('should fetch and format recent accepted submissions', async () => {
      req.params = { username: 'sunnytyagi' };
      axios.post.mockResolvedValue({
        data: {
          data: {
            recentAcSubmissionList: [
              {
                title: 'Two Sum',
                titleSlug: 'two-sum',
                timestamp: '1725062400',
                lang: 'cpp',
                statusDisplay: 'Accepted',
              },
            ],
          },
        },
      });

      await getRecentSubmissions(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          username: 'sunnytyagi',
          submissions: expect.arrayContaining([
            expect.objectContaining({
              title: 'Two Sum',
              slug: 'two-sum',
              url: 'https://leetcode.com/problems/two-sum/',
            }),
          ]),
        })
      );
    });
  });

  describe('connectLeetCode & disconnectLeetCode', () => {
    it('should verify username with LeetCode and connect profile', async () => {
      req.body = { username: 'sunnytyagi' };
      axios.post.mockResolvedValue({
        data: { data: { matchedUser: { username: 'sunnytyagi' } } },
      });
      User.findByIdAndUpdate.mockResolvedValue({});

      await connectLeetCode(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('mockUserId', {
        'leetcode.username': 'sunnytyagi',
      });
      expect(sendSuccess).toHaveBeenCalledWith(res, { username: 'sunnytyagi' }, 'LeetCode connected');
    });

    it('should return 404 when connecting non-existent LeetCode username', async () => {
      req.body = { username: 'invalid_user_999' };
      axios.post.mockResolvedValue({
        data: { data: { matchedUser: null } },
      });

      await connectLeetCode(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'LeetCode user not found', 404);
    });

    it('should disconnect LeetCode profile', async () => {
      User.findByIdAndUpdate.mockResolvedValue({});

      await disconnectLeetCode(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('mockUserId', {
        $unset: { leetcode: 1 },
      });
      expect(sendSuccess).toHaveBeenCalledWith(res, {}, 'LeetCode disconnected');
    });
  });
});
