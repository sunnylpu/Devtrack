const { getHabits, createHabit, deleteHabit } = require('../src/controllers/habitController');
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

describe('Habit Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { user: { _id: 'userId' }, body: {}, params: {} };
    res = {};
    jest.clearAllMocks();
  });

  describe('getHabits', () => {
    it('should fetch active habits', async () => {
      const mockHabits = [{ _id: '1', name: 'Code daily' }];
      Habit.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockHabits) });

      await getHabits(req, res);

      expect(Habit.find).toHaveBeenCalledWith({ owner: 'userId', isActive: true });
      expect(sendSuccess).toHaveBeenCalledWith(res, { habits: mockHabits }, 'Habits fetched');
    });
  });

  describe('createHabit', () => {
    it('should create a habit', async () => {
      req.body = { name: 'Read books', icon: '📚', color: '#3b6dfb', frequency: 'daily' };
      const mockHabit = { ...req.body, _id: 'habitId', owner: 'userId' };
      Habit.create.mockResolvedValue(mockHabit);

      await createHabit(req, res);

      expect(Habit.create).toHaveBeenCalled();
      expect(sendSuccess).toHaveBeenCalledWith(res, { habit: mockHabit }, 'Habit created', 201);
    });
  });

  describe('deleteHabit', () => {
    it('should soft-delete by setting isActive to false', async () => {
      req.params.id = 'habitId';
      Habit.findOneAndUpdate.mockResolvedValue({ _id: 'habitId', isActive: false });

      await deleteHabit(req, res);

      expect(Habit.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'habitId', owner: 'userId' },
        { isActive: false },
        { new: true }
      );
      expect(sendSuccess).toHaveBeenCalledWith(res, {}, 'Habit deleted');
    });

    it('should return 404 for missing habit', async () => {
      req.params.id = 'missing';
      Habit.findOneAndUpdate.mockResolvedValue(null);

      await deleteHabit(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 'Habit not found', 404);
    });
  });
});
