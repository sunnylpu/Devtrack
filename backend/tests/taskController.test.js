const {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addSubtask,
  updateSubtask,
  reorderTasks,
} = require('../src/controllers/taskController');
const Task = require('../src/models/Task');
const { sendSuccess, sendError, sendPaginated } = require('../src/utils/response');

jest.mock('../src/models/Task');
jest.mock('../src/utils/response', () => ({
  sendSuccess: jest.fn(),
  sendError: jest.fn(),
  sendPaginated: jest.fn(),
}));

describe('Task Controller Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { _id: 'mockUserId' },
      query: {},
      params: {},
      body: {},
      io: {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should return paginated tasks with search and filters', async () => {
      req.query = { status: 'todo', priority: 'high', tag: 'frontend', search: 'Login', page: '2', limit: '10' };
      const mockTasks = [{ _id: 'task1', title: 'Login Page' }];

      Task.countDocuments.mockResolvedValue(15);
      const populateMock = jest.fn().mockResolvedValue(mockTasks);
      const limitMock = jest.fn().mockReturnValue({ populate: populateMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      Task.find.mockReturnValue({ sort: sortMock });

      await getTasks(req, res, next);

      expect(Task.countDocuments).toHaveBeenCalledWith({
        owner: 'mockUserId',
        status: 'todo',
        priority: 'high',
        tags: 'frontend',
        title: { $regex: 'Login', $options: 'i' },
      });
      expect(sendPaginated).toHaveBeenCalledWith(
        res,
        mockTasks,
        { total: 15, page: 2, limit: 10, pages: 2 }
      );
    });

    it('should return grouped tasks for kanban board view', async () => {
      req.query = { board: 'kanban' };
      Task.countDocuments.mockResolvedValue(4);

      const mockPopulate = jest.fn().mockImplementation(() => Promise.resolve([{ _id: 'task1' }]));
      const mockSort = jest.fn().mockReturnValue({ populate: mockPopulate });
      Task.find.mockReturnValue({ sort: mockSort });

      await getTasks(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          board: expect.objectContaining({
            todo: expect.any(Array),
            'in-progress': expect.any(Array),
            review: expect.any(Array),
            completed: expect.any(Array),
          }),
          total: 4,
        }),
        'Kanban board fetched'
      );
    });
  });

  describe('createTask', () => {
    it('should successfully create a task and emit socket event', async () => {
      req.body = { title: 'Implement E2E tests', priority: 'high', status: 'todo' };
      const mockTask = { ...req.body, _id: 'newTaskId', owner: 'mockUserId' };
      Task.create.mockResolvedValue(mockTask);

      await createTask(req, res, next);

      expect(Task.create).toHaveBeenCalledWith({
        ...req.body,
        owner: 'mockUserId',
      });
      expect(req.io.to).toHaveBeenCalledWith('mockUserId');
      expect(req.io.emit).toHaveBeenCalledWith('task:created', mockTask);
      expect(sendSuccess).toHaveBeenCalledWith(res, { task: mockTask }, 'Task created', 201);
    });
  });

  describe('getTask', () => {
    it('should return 404 if task is not found', async () => {
      req.params.id = 'missingId';
      Task.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await getTask(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Task not found', 404);
    });

    it('should return task if found', async () => {
      req.params.id = 'task123';
      const mockTask = { _id: 'task123', title: 'Found Task' };
      Task.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTask),
      });

      await getTask(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(res, { task: mockTask });
    });
  });

  describe('updateTask', () => {
    it('should return 404 if task to update does not exist', async () => {
      req.params.id = 'missingId';
      req.body = { title: 'New Title' };
      Task.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await updateTask(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Task not found', 404);
    });

    it('should update task and emit task:updated socket event', async () => {
      req.params.id = 'task123';
      req.body = { title: 'Updated Title' };
      const updatedTask = { _id: 'task123', title: 'Updated Title' };
      Task.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(updatedTask),
      });

      await updateTask(req, res, next);

      expect(req.io.emit).toHaveBeenCalledWith('task:updated', updatedTask);
      expect(sendSuccess).toHaveBeenCalledWith(res, { task: updatedTask }, 'Task updated');
    });
  });

  describe('deleteTask', () => {
    it('should return 404 if task to delete does not exist', async () => {
      req.params.id = 'missingId';
      Task.findOneAndDelete.mockResolvedValue(null);

      await deleteTask(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Task not found', 404);
    });

    it('should delete task and emit task:deleted socket event', async () => {
      req.params.id = 'task123';
      Task.findOneAndDelete.mockResolvedValue({ _id: 'task123' });

      await deleteTask(req, res, next);

      expect(req.io.to).toHaveBeenCalledWith('mockUserId');
      expect(req.io.emit).toHaveBeenCalledWith('task:deleted', { id: 'task123' });
      expect(sendSuccess).toHaveBeenCalledWith(res, {}, 'Task deleted');
    });
  });

  describe('updateTaskStatus', () => {
    it('should return 400 for invalid status value', async () => {
      req.params.id = 'task123';
      req.body = { status: 'invalid-status' };

      await updateTaskStatus(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Invalid status', 400);
    });

    it('should return 404 if task to update status is not found', async () => {
      req.params.id = 'missingId';
      req.body = { status: 'in-progress' };
      Task.findOneAndUpdate.mockResolvedValue(null);

      await updateTaskStatus(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Task not found', 404);
    });

    it('should update status and emit socket event for valid status', async () => {
      req.params.id = 'task123';
      req.body = { status: 'completed' };
      const updatedTask = { _id: 'task123', status: 'completed' };
      Task.findOneAndUpdate.mockResolvedValue(updatedTask);

      await updateTaskStatus(req, res, next);

      expect(req.io.emit).toHaveBeenCalledWith('task:updated', updatedTask);
      expect(sendSuccess).toHaveBeenCalledWith(res, { task: updatedTask }, 'Status updated');
    });
  });

  describe('addSubtask & updateSubtask', () => {
    it('should return 400 when subtask title is missing', async () => {
      req.params.id = 'task123';
      req.body = {};

      await addSubtask(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Subtask title required', 400);
    });

    it('should add subtask to existing task', async () => {
      req.params.id = 'task123';
      req.body = { title: 'Write tests' };
      const updatedTask = { _id: 'task123', subtasks: [{ title: 'Write tests' }] };
      Task.findOneAndUpdate.mockResolvedValue(updatedTask);

      await addSubtask(req, res, next);

      expect(Task.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'task123', owner: 'mockUserId' },
        { $push: { subtasks: { title: 'Write tests' } } },
        { new: true }
      );
      expect(sendSuccess).toHaveBeenCalledWith(res, { task: updatedTask }, 'Subtask added');
    });

    it('should update subtask completion status', async () => {
      req.params = { id: 'task123', subtaskId: 'sub123' };
      req.body = { completed: true };
      const updatedTask = { _id: 'task123', subtasks: [{ _id: 'sub123', completed: true }] };
      Task.findOneAndUpdate.mockResolvedValue(updatedTask);

      await updateSubtask(req, res, next);

      expect(sendSuccess).toHaveBeenCalledWith(res, { task: updatedTask }, 'Subtask updated');
    });
  });

  describe('reorderTasks', () => {
    it('should perform bulkWrite and return success', async () => {
      req.body = {
        tasks: [
          { id: 'task1', status: 'todo', order: 0 },
          { id: 'task2', status: 'in-progress', order: 1 },
        ],
      };
      Task.bulkWrite.mockResolvedValue({ ok: 1 });

      await reorderTasks(req, res, next);

      expect(Task.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { _id: 'task1', owner: 'mockUserId' },
            update: { $set: { status: 'todo', order: 0 } },
          },
        },
        {
          updateOne: {
            filter: { _id: 'task2', owner: 'mockUserId' },
            update: { $set: { status: 'in-progress', order: 1 } },
          },
        },
      ]);
      expect(sendSuccess).toHaveBeenCalledWith(res, {}, 'Tasks reordered');
    });
  });
});
