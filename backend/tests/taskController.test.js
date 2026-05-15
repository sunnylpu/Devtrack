const { getTasks, createTask } = require('../src/controllers/taskController');
const Task = require('../src/models/Task');
const { sendSuccess, sendError } = require('../src/utils/response');

// Mock dependencies
jest.mock('../src/models/Task');
jest.mock('../src/utils/response', () => ({
  sendSuccess: jest.fn(),
  sendError: jest.fn(),
  sendPaginated: jest.fn(),
}));

describe('Task Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { _id: 'mockUserId' },
      query: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should successfully create a task and return 201', async () => {
      // Setup mock request body
      req.body = {
        title: 'Test Task',
        status: 'todo',
        priority: 'high',
      };

      // Mock Task.create to return a saved task
      const mockSavedTask = { ...req.body, _id: 'mockTaskId', owner: 'mockUserId' };
      Task.create.mockResolvedValue(mockSavedTask);

      // Call the controller
      await createTask(req, res, next);

      // Assertions
      expect(Task.create).toHaveBeenCalledWith({
        ...req.body,
        owner: 'mockUserId',
      });
      expect(sendSuccess).toHaveBeenCalledWith(res, { task: mockSavedTask }, 'Task created', 201);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if creation fails', async () => {
      // Setup mock to throw error
      const mockError = new Error('Database Error');
      Task.create.mockRejectedValue(mockError);

      // Call the controller
      await createTask(req, res, next);

      // Assertions
      expect(Task.create).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(mockError);
      expect(sendSuccess).not.toHaveBeenCalled();
    });
  });
});
