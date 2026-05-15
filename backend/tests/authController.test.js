const { register, login, getMe } = require('../src/controllers/authController');
const User = require('../src/models/User');
const { sendSuccess, sendError } = require('../src/utils/response');

jest.mock('../src/models/User');
jest.mock('../src/utils/response', () => ({
  sendSuccess: jest.fn(),
  sendError: jest.fn(),
}));
jest.mock('../src/services/queueService', () => ({
  sendWelcomeEmail: jest.fn(),
}));

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, user: { _id: 'mockUserId' }, cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return error if user already exists', async () => {
      req.body = { name: 'Test', email: 'existing@test.com', password: 'test123' };
      User.findOne.mockResolvedValue({ email: 'existing@test.com' });

      await register(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'existing@test.com' });
      expect(sendError).toHaveBeenCalledWith(res, 'Email already registered', 409);
    });

    it('should create a new user when email does not exist', async () => {
      req.body = { name: 'New User', email: 'new@test.com', password: 'test123456' };
      
      const mockUser = {
        _id: 'newUserId',
        name: 'New User',
        email: 'new@test.com',
        role: 'user',
        toJSON: () => ({
          _id: 'newUserId',
          name: 'New User',
          email: 'new@test.com',
          role: 'user',
        }),
        refreshTokens: [],
        save: jest.fn(),
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);

      await register(req, res, next);

      expect(User.create).toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('should return the current user', async () => {
      const mockUser = { _id: 'mockUserId', name: 'Test', email: 'test@test.com' };
      User.findById.mockResolvedValue(mockUser);

      await getMe(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('mockUserId');
      expect(sendSuccess).toHaveBeenCalledWith(res, { user: mockUser });
    });
  });
});
