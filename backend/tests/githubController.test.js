const {
  connectGitHub,
  githubCallback,
  getActivity,
  getHeatmap,
  disconnectGitHub,
  getPublicProfile,
  getPublicRepos,
  getPublicRecent,
  getRepoCommits,
} = require('../src/controllers/githubController');
const User = require('../src/models/User');
const { sendSuccess } = require('../src/utils/response');
const axios = require('axios');

jest.mock('../src/models/User');
jest.mock('axios');
jest.mock('../src/utils/response', () => ({
  sendSuccess: jest.fn(),
  sendError: jest.fn(),
}));

describe('GitHub Controller Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { _id: 'mockUserId' },
      query: {},
      params: {},
    };
    res = {
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.GITHUB_CLIENT_ID = 'mockClientId';
    process.env.GITHUB_CALLBACK_URL = 'http://localhost:5001/api/github/callback';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    jest.clearAllMocks();
  });

  describe('connectGitHub', () => {
    it('should redirect user to GitHub OAuth authorization URL', () => {
      connectGitHub(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('https://github.com/login/oauth/authorize?')
      );
    });
  });

  describe('githubCallback', () => {
    it('should exchange code for token and save profile in user model', async () => {
      req.query = { code: 'oauth_code', state: 'mockUserId' };
      axios.post.mockResolvedValue({ data: { access_token: 'gh_token_123' } });
      axios.get.mockResolvedValue({
        data: {
          id: 12345,
          login: 'sunnytyagi',
          html_url: 'https://github.com/sunnytyagi',
          avatar_url: 'https://avatar.url',
        },
      });
      User.findByIdAndUpdate.mockResolvedValue({});

      await githubCallback(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('mockUserId', {
        'github.id': '12345',
        'github.username': 'sunnytyagi',
        'github.accessToken': 'gh_token_123',
        'github.profileUrl': 'https://github.com/sunnytyagi',
        'github.avatarUrl': 'https://avatar.url',
      });
      expect(res.redirect).toHaveBeenCalledWith('http://localhost:5173/github?connected=true');
    });
  });

  describe('getActivity', () => {
    it('should return connected: false if user does not have GitHub connected', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ github: null }),
      });

      await getActivity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { connected: false },
        })
      );
    });

    it('should fetch and process repos, recent commits, and languages when connected', async () => {
      const mockUser = {
        _id: 'mockUserId',
        github: {
          username: 'sunnytyagi',
          accessToken: 'token123',
          profileUrl: 'https://github.com/sunnytyagi',
          avatarUrl: 'https://avatar.url',
        },
      };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const mockRepos = [
        { name: 'repo1', html_url: 'url1', language: 'JavaScript', stargazers_count: 5, updated_at: '2026-08-30' },
        { name: 'repo2', html_url: 'url2', language: 'JavaScript', stargazers_count: 2, updated_at: '2026-08-30' },
      ];
      const mockEvents = [
        {
          type: 'PushEvent',
          created_at: '2026-08-30',
          repo: { name: 'repo1' },
          payload: { commits: [{ message: 'Initial commit' }] },
        },
      ];

      axios.get.mockResolvedValueOnce({ data: mockRepos });
      axios.get.mockResolvedValueOnce({ data: mockEvents });

      await getActivity(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          connected: true,
          username: 'sunnytyagi',
          repos: expect.any(Array),
          recentCommits: expect.any(Array),
          languages: [{ lang: 'JavaScript', count: 2 }],
        })
      );
    });
  });

  describe('getHeatmap', () => {
    it('should return empty heatmap if not connected', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ github: {} }),
      });

      await getHeatmap(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(res, { connected: false, heatmap: [] });
    });

    it('should query GitHub GraphQL API for calendar data when connected', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          github: { username: 'sunny', accessToken: 'token' },
        }),
      });

      axios.post.mockResolvedValue({
        data: {
          data: {
            user: {
              contributionsCollection: {
                contributionCalendar: {
                  totalContributions: 150,
                  weeks: [],
                },
              },
            },
          },
        },
      });

      await getHeatmap(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(res, {
        connected: true,
        totalContributions: 150,
        weeks: [],
      });
    });
  });

  describe('disconnectGitHub', () => {
    it('should unset github field on user', async () => {
      User.findByIdAndUpdate.mockResolvedValue({});

      await disconnectGitHub(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('mockUserId', {
        $unset: { github: 1 },
      });
      expect(sendSuccess).toHaveBeenCalledWith(res, {}, 'GitHub disconnected');
    });
  });

  describe('getPublicProfile', () => {
    it('should fetch public GitHub profile by username', async () => {
      req.params = { username: 'sunnytyagi' };
      axios.get.mockResolvedValue({
        data: {
          login: 'sunnytyagi',
          name: 'Sunny Tyagi',
          public_repos: 12,
          followers: 45,
          following: 30,
        },
      });

      await getPublicProfile(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          username: 'sunnytyagi',
          name: 'Sunny Tyagi',
          publicRepos: 12,
        })
      );
    });

    it('should return 404 when user does not exist on GitHub', async () => {
      req.params = { username: 'unknown-user' };
      const err = new Error('Not found');
      err.response = { status: 404 };
      axios.get.mockRejectedValue(err);

      await getPublicProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'GitHub user not found' });
    });
  });

  describe('getPublicRepos & getRepoCommits', () => {
    it('should fetch public repos for user', async () => {
      req.params = { username: 'sunnytyagi' };
      req.query = { page: '1' };
      axios.get.mockResolvedValue({
        data: [
          { name: 'devtrack', html_url: 'url', description: 'desc', language: 'JS', stargazers_count: 10, forks_count: 2 },
        ],
      });

      await getPublicRepos(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          username: 'sunnytyagi',
          repos: expect.any(Array),
          page: 1,
        })
      );
    });

    it('should fetch commit history for a repo', async () => {
      req.params = { username: 'sunnytyagi', repo: 'devtrack' };
      axios.get
        .mockResolvedValueOnce({
          data: [
            {
              sha: 'abc1234567',
              commit: { message: 'Initial commit', author: { name: 'Sunny', date: '2026-08-30' } },
            },
          ],
        })
        .mockResolvedValueOnce({
          data: {
            name: 'devtrack',
            full_name: 'sunnytyagi/devtrack',
            stargazers_count: 5,
          },
        });

      await getRepoCommits(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          username: 'sunnytyagi',
          repo: 'devtrack',
          commits: expect.any(Array),
        })
      );
    });
  });
});
