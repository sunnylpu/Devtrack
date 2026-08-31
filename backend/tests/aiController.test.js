const {
  getTaskSuggestions,
  breakdownTask,
  getWeeklySummary,
  getProductivityTips,
} = require('../src/controllers/aiController');
const Task = require('../src/models/Task');
const { sendSuccess, sendError } = require('../src/utils/response');
const axios = require('axios');

jest.mock('../src/models/Task');
jest.mock('axios');
jest.mock('../src/utils/response', () => ({
  sendSuccess: jest.fn(),
  sendError: jest.fn(),
}));

describe('AI Controller Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { _id: 'mockUserId' },
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    delete process.env.OPENAI_API_KEY;
    jest.clearAllMocks();
  });

  describe('getTaskSuggestions', () => {
    it('should return mock suggestions when OPENAI_API_KEY is not set', async () => {
      Task.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue([
              { title: 'Setup DB', status: 'completed' },
            ]),
          }),
        }),
      });

      await getTaskSuggestions(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          aiPowered: false,
          suggestions: expect.arrayContaining([
            expect.objectContaining({ title: expect.any(String), priority: expect.any(String) }),
          ]),
        })
      );
    });

    it('should call OpenAI API and parse suggestions when OPENAI_API_KEY is configured', async () => {
      process.env.OPENAI_API_KEY = 'valid-test-key';
      Task.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const aiJson = JSON.stringify([
        { title: 'Write tests', priority: 'high', reason: 'Coverage' },
      ]);
      axios.post.mockResolvedValue({
        data: { choices: [{ message: { content: aiJson } }] },
      });

      await getTaskSuggestions(req, res, next);

      expect(axios.post).toHaveBeenCalled();
      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          aiPowered: true,
          suggestions: [{ title: 'Write tests', priority: 'high', reason: 'Coverage' }],
        })
      );
    });
  });

  describe('breakdownTask', () => {
    it('should return 400 if task title is missing', async () => {
      req.body = {};

      await breakdownTask(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Task title required', 400);
    });

    it('should return mock subtasks when OPENAI_API_KEY is not set', async () => {
      req.body = { title: 'Build CI/CD Pipeline' };

      await breakdownTask(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          aiPowered: false,
          subtasks: expect.arrayContaining([
            expect.objectContaining({ title: expect.any(String) }),
          ]),
        })
      );
    });

    it('should parse OpenAI response when API key is provided', async () => {
      process.env.OPENAI_API_KEY = 'test-key';
      req.body = { title: 'Implement Auth', description: 'JWT auth' };

      const mockSubtasks = [{ title: 'Design user schema' }, { title: 'Create JWT util' }];
      axios.post.mockResolvedValue({
        data: { choices: [{ message: { content: JSON.stringify(mockSubtasks) } }] },
      });

      await breakdownTask(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          aiPowered: true,
          subtasks: mockSubtasks,
        })
      );
    });
  });

  describe('getWeeklySummary', () => {
    it('should calculate productivity stats and generate fallback weekly summary', async () => {
      Task.countDocuments
        .mockResolvedValueOnce(5) // completed
        .mockResolvedValueOnce(8) // created
        .mockResolvedValueOnce(1); // overdue

      await getWeeklySummary(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          stats: {
            completed: 5,
            created: 8,
            overdue: 1,
            productivityRate: 63,
          },
          summary: expect.stringContaining('You completed 5 tasks out of 8'),
        })
      );
    });
  });

  describe('getProductivityTips', () => {
    it('should return a randomized list of 4 tips', async () => {
      await getProductivityTips(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          tips: expect.any(Array),
        })
      );
    });
  });
});
