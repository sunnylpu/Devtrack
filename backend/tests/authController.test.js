const {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateProfile,
  changePassword,
} = require('../src/controllers/authController');
const User = require('../src/models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../src/utils/jwt');
const { sendSuccess, sendError } = require('../src/utils/response');

jest.mock('../src/models/User');
jest.mock('../src/utils/jwt', () => ({
  generateAccessToken: jest.fn(() => 'mockAccessToken'),
  generateRefreshToken: jest.fn(() => 'mockRefreshToken'),
  verifyRefreshToken: jest.fn(),
}));
jest.mock('../src/utils/response', () => ({
  sendSuccess: jest.fn(),
  sendError: jest.fn(),
}));
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Auth Controller Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      user: { _id: 'mockUserId', role: 'user', preferences: { theme: 'dark' } },
      cookies: {},
      secure: false,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return 409 if user email already exists', async () => {
      req.body = { name: 'Test User', email: 'existing@example.com', password: 'password123' };
      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await register(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
      expect(sendError).toHaveBeenCalledWith(res, 'Email already registered', 409);
    });

    it('should successfully register a new user and return tokens', async () => {
      req.body = { name: 'New User', email: 'new@example.com', password: 'password123' };
      const mockUser = {
        _id: 'newUserId',
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
        refreshTokens: [],
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);

      await register(req, res, next);

      expect(User.create).toHaveBeenCalledWith({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'user',
      });
      expect(mockUser.save).toHaveBeenCalledWith({ validateBeforeSave: false });
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'mockRefreshToken', expect.any(Object));
      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        { user: mockUser, accessToken: 'mockAccessToken' },
        'Registration successful',
        201
      );
    });

    it('should call next(error) if registration throws an exception', async () => {
      const error = new Error('Database connection failed');
      User.findOne.mockRejectedValue(error);

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should return 401 if user does not exist or has no password', async () => {
      req.body = { email: 'notfound@example.com', password: 'password123' };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await login(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Invalid email or password', 401);
    });

    it('should return 401 if password does not match', async () => {
      req.body = { email: 'user@example.com', password: 'wrongPassword' };
      const mockUser = {
        _id: 'userId123',
        password: 'hashedPassword',
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await login(req, res, next);

      expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongPassword');
      expect(sendError).toHaveBeenCalledWith(res, 'Invalid email or password', 401);
    });

    it('should return 401 if user account is deactivated', async () => {
      req.body = { email: 'user@example.com', password: 'password123' };
      const mockUser = {
        _id: 'userId123',
        password: 'hashedPassword',
        isActive: false,
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await login(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Account is deactivated', 401);
    });

    it('should successfully log in and rotate refresh token list if size >= 5', async () => {
      req.body = { email: 'user@example.com', password: 'correctPassword' };
      const mockUser = {
        _id: 'userId123',
        password: 'hashedPassword',
        isActive: true,
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      const mockUserWithTokens = {
        ...mockUser,
        refreshTokens: [
          { token: 't1' },
          { token: 't2' },
          { token: 't3' },
          { token: 't4' },
          { token: 't5' },
        ],
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUserWithTokens),
      });

      await login(req, res, next);

      expect(mockUserWithTokens.refreshTokens.length).toBe(5);
      expect(mockUserWithTokens.refreshTokens[4].token).toBe('mockRefreshToken');
      expect(mockUserWithTokens.save).toHaveBeenCalled();
      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        { user: mockUser, accessToken: 'mockAccessToken' },
        'Login successful'
      );
    });
  });

  describe('refresh', () => {
    it('should return 401 if refresh token is missing', async () => {
      req.cookies = {};
      req.body = {};

      await refresh(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Refresh token not found', 401);
    });

    it('should return 401 if refresh token is invalid or expired', async () => {
      req.cookies = { refreshToken: 'invalidToken' };
      verifyRefreshToken.mockImplementation(() => {
        throw new Error('TokenExpired');
      });

      await refresh(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Invalid or expired refresh token', 401);
    });

    it('should return 401 if user is not found', async () => {
      req.cookies = { refreshToken: 'validToken' };
      verifyRefreshToken.mockReturnValue({ id: 'userId123' });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await refresh(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'User not found', 401);
    });

    it('should return 401 if refresh token was revoked / not in user list', async () => {
      req.cookies = { refreshToken: 'oldToken' };
      verifyRefreshToken.mockReturnValue({ id: 'userId123' });
      const mockUser = {
        _id: 'userId123',
        refreshTokens: [{ token: 'differentToken' }],
      };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await refresh(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Refresh token revoked', 401);
    });

    it('should successfully refresh access token and rotate refresh token', async () => {
      req.cookies = { refreshToken: 'validToken' };
      verifyRefreshToken.mockReturnValue({ id: 'userId123' });
      const mockUser = {
        _id: 'userId123',
        role: 'user',
        refreshTokens: [{ token: 'validToken' }],
        save: jest.fn().mockResolvedValue(true),
      };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await refresh(req, res, next);

      expect(mockUser.save).toHaveBeenCalled();
      expect(sendSuccess).toHaveBeenCalledWith(res, { accessToken: 'mockAccessToken' }, 'Token refreshed');
    });
  });

  describe('logout', () => {
    it('should remove refresh token from user and clear cookie', async () => {
      req.cookies = { refreshToken: 'activeToken' };
      const mockUser = {
        _id: 'mockUserId',
        refreshTokens: [{ token: 'activeToken' }, { token: 'otherToken' }],
        save: jest.fn().mockResolvedValue(true),
      };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await logout(req, res, next);

      expect(mockUser.refreshTokens).toEqual([{ token: 'otherToken' }]);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
      expect(sendSuccess).toHaveBeenCalledWith(res, {}, 'Logged out successfully');
    });
  });

  describe('getMe', () => {
    it('should return current user data', async () => {
      const mockUser = { _id: 'mockUserId', name: 'Test User', email: 'test@example.com' };
      User.findById.mockResolvedValue(mockUser);

      await getMe(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('mockUserId');
      expect(sendSuccess).toHaveBeenCalledWith(res, { user: mockUser });
    });
  });

  describe('updateProfile', () => {
    it('should update user name and preferences', async () => {
      req.body = { name: 'Updated Name', preferences: { theme: 'light' } };
      const updatedUser = { _id: 'mockUserId', name: 'Updated Name', preferences: { theme: 'light' } };
      User.findByIdAndUpdate.mockResolvedValue(updatedUser);

      await updateProfile(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockUserId',
        { $set: { name: 'Updated Name', preferences: { theme: 'light' } } },
        { new: true, runValidators: true }
      );
      expect(sendSuccess).toHaveBeenCalledWith(res, { user: updatedUser }, 'Profile updated');
    });
  });

  describe('changePassword', () => {
    it('should return 400 if user has no password (OAuth user)', async () => {
      req.body = { currentPassword: 'pass', newPassword: 'newPass' };
      const mockUser = { _id: 'mockUserId', password: null };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await changePassword(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'No password set (OAuth account)', 400);
    });

    it('should return 400 if current password is incorrect', async () => {
      req.body = { currentPassword: 'wrongPass', newPassword: 'newPass' };
      const mockUser = {
        _id: 'mockUserId',
        password: 'hashedPassword',
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await changePassword(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Current password is incorrect', 400);
    });

    it('should update password when current password is verified', async () => {
      req.body = { currentPassword: 'correctPass', newPassword: 'newSecurePassword' };
      const mockUser = {
        _id: 'mockUserId',
        password: 'hashedPassword',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await changePassword(req, res, next);

      expect(mockUser.password).toBe('newSecurePassword');
      expect(mockUser.save).toHaveBeenCalled();
      expect(sendSuccess).toHaveBeenCalledWith(res, {}, 'Password changed successfully');
    });
  });
});
