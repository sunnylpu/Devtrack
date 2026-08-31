const { getDashboard, getProductivityStats } = require('../src/controllers/analyticsController');
const Task = require('../src/models/Task');
const { sendSuccess } = require('../src/utils/response');

jest.mock('../src/models/Task');
jest.mock('../src/models/User');
jest.mock('../src/utils/response', () => ({
  sendSuccess: jest.fn(),
  sendError: jest.fn(),
}));

describe('Analytics Controller Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { _id: 'mockUserId', streak: { current: 4, longest: 10 } },
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should aggregate task metrics and compute productivity score', async () => {
      Task.countDocuments
        .mockResolvedValueOnce(10) // totalTasks
        .mockResolvedValueOnce(8)  // completedTasks
        .mockResolvedValueOnce(4)  // completedThisWeek
        .mockResolvedValueOnce(8)  // completedThisMonth
        .mockResolvedValueOnce(2)  // inProgressTasks
        .mockResolvedValueOnce(1); // overdueTasks

      const tasksByPriority = [{ _id: 'high', count: 3 }];
      const tasksByStatus = [{ _id: 'completed', count: 8 }];
      const completionTrend = [{ _id: '2026-08-30', count: 2 }];

      Task.aggregate
        .mockResolvedValueOnce(tasksByPriority)
        .mockResolvedValueOnce(tasksByStatus)
        .mockResolvedValueOnce(completionTrend);

      await getDashboard(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          overview: {
            totalTasks: 10,
            completedTasks: 8,
            completedThisWeek: 4,
            completedThisMonth: 8,
            inProgressTasks: 2,
            overdueTasks: 1,
            productivityScore: 80,
          },
          charts: {
            tasksByPriority,
            tasksByStatus,
            completionTrend,
          },
          streak: { current: 4, longest: 10 },
        })
      );
    });

    it('should set productivity score to 0 when there are no tasks', async () => {
      Task.countDocuments.mockResolvedValue(0);
      Task.aggregate.mockResolvedValue([]);

      await getDashboard(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          overview: expect.objectContaining({
            productivityScore: 0,
            totalTasks: 0,
          }),
        })
      );
    });

    it('should call next on error', async () => {
      const error = new Error('Aggregation failed');
      Task.countDocuments.mockRejectedValue(error);

      await getDashboard(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getProductivityStats', () => {
    it('should return productivity trend for specified days', async () => {
      req.query = { days: '14' };
      const trendData = [{ _id: '2026-08-25', count: 3, tasks: [{ title: 'Fix bug', priority: 'high' }] }];
      Task.aggregate.mockResolvedValue(trendData);

      await getProductivityStats(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(res, { trend: trendData, days: 14 });
    });
  });
});
