const {
  getHabits,
  createHabit,
  checkIn,
  updateHabit,
  deleteHabit,
  getStats,
} = require('../src/controllers/habitController');
const Habit = require('../src/models/Habit');
const { sendSuccess, sendError } = require('../src/utils/response');

jest.mock('../src/models/Habit');
jest.mock('../src/utils/response', () => ({
  sendSuccess: jest.fn(),
  sendError: jest.fn(),
}));
jest.mock('../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

describe('Habit Controller Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: 'userId123' },
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getHabits', () => {
    it('should fetch active habits sorted by createdAt', async () => {
      const mockHabits = [{ _id: 'h1', name: 'Exercise daily' }];
      Habit.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockHabits),
      });

      await getHabits(req, res);

      expect(Habit.find).toHaveBeenCalledWith({ owner: 'userId123', isActive: true });
      expect(sendSuccess).toHaveBeenCalledWith(res, { habits: mockHabits }, 'Habits fetched');
    });

    it('should handle database errors in getHabits', async () => {
      Habit.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('DB failure')),
      });

      await getHabits(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 'DB failure', 500);
    });
  });

  describe('createHabit', () => {
    it('should create a new habit and return 201', async () => {
      req.body = {
        name: 'Meditate',
        icon: '🧘',
        color: '#8b5cf6',
        frequency: 'daily',
        targetDays: 7,
      };
      const mockCreated = { ...req.body, _id: 'h123', owner: 'userId123' };
      Habit.create.mockResolvedValue(mockCreated);

      await createHabit(req, res);

      expect(Habit.create).toHaveBeenCalledWith({
        owner: 'userId123',
        ...req.body,
      });
      expect(sendSuccess).toHaveBeenCalledWith(res, { habit: mockCreated }, 'Habit created', 201);
    });

    it('should handle error when creating habit fails', async () => {
      Habit.create.mockRejectedValue(new Error('Validation failed'));

      await createHabit(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 'Validation failed', 400);
    });
  });

  describe('checkIn', () => {
    it('should return 404 if habit not found', async () => {
      req.params.id = 'missingId';
      Habit.findOne.mockResolvedValue(null);

      await checkIn(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 'Habit not found', 404);
    });

    it('should execute habit.checkIn and save', async () => {
      req.params.id = 'habit123';
      req.body = { note: 'Done early morning' };
      const mockHabit = {
        _id: 'habit123',
        checkIn: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
      };
      Habit.findOne.mockResolvedValue(mockHabit);

      await checkIn(req, res);

      expect(mockHabit.checkIn).toHaveBeenCalledWith('Done early morning');
      expect(mockHabit.save).toHaveBeenCalled();
      expect(sendSuccess).toHaveBeenCalledWith(res, { habit: mockHabit }, 'Check-in recorded');
    });
  });

  describe('updateHabit', () => {
    it('should return 404 if habit to update is not found', async () => {
      req.params.id = 'missingId';
      req.body = { name: 'Updated name' };
      Habit.findOneAndUpdate.mockResolvedValue(null);

      await updateHabit(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 'Habit not found', 404);
    });

    it('should update habit successfully', async () => {
      req.params.id = 'habit123';
      req.body = { name: 'Updated name' };
      const updatedHabit = { _id: 'habit123', name: 'Updated name' };
      Habit.findOneAndUpdate.mockResolvedValue(updatedHabit);

      await updateHabit(req, res);

      expect(Habit.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'habit123', owner: 'userId123' },
        req.body,
        { new: true, runValidators: true }
      );
      expect(sendSuccess).toHaveBeenCalledWith(res, { habit: updatedHabit }, 'Habit updated');
    });
  });

  describe('deleteHabit', () => {
    it('should soft delete habit by setting isActive: false', async () => {
      req.params.id = 'habit123';
      Habit.findOneAndUpdate.mockResolvedValue({ _id: 'habit123', isActive: false });

      await deleteHabit(req, res);

      expect(Habit.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'habit123', owner: 'userId123' },
        { isActive: false },
        { new: true }
      );
      expect(sendSuccess).toHaveBeenCalledWith(res, {}, 'Habit deleted');
    });

    it('should return 404 if habit to delete does not exist', async () => {
      req.params.id = 'missingId';
      Habit.findOneAndUpdate.mockResolvedValue(null);

      await deleteHabit(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 'Habit not found', 404);
    });
  });

  describe('getStats', () => {
    it('should calculate habit stats accurately', async () => {
      const today = new Date();
      const mockHabits = [
        {
          _id: 'h1',
          name: 'Habit 1',
          streak: { longest: 5 },
          completionRate: 80,
          entries: [{ date: today, completed: true }],
        },
        {
          _id: 'h2',
          name: 'Habit 2',
          streak: { longest: 10 },
          completionRate: 60,
          entries: [{ date: today, completed: false }],
        },
      ];
      Habit.find.mockResolvedValue(mockHabits);

      await getStats(req, res);

      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          stats: {
            totalHabits: 2,
            totalCompletedToday: 1,
            longestStreak: 10,
            averageCompletionRate: 70,
          },
          habits: mockHabits,
        }),
        'Stats fetched'
      );
    });
  });
});
