const { protect, authorize } = require('../src/middleware/auth');
const User = require('../src/models/User');
const { verifyAccessToken } = require('../src/utils/jwt');
const { sendError } = require('../src/utils/response');

jest.mock('../src/models/User');
jest.mock('../src/utils/jwt', () => ({
  verifyAccessToken: jest.fn(),
}));
jest.mock('../src/utils/response', () => ({
  sendError: jest.fn(),
}));

describe('Auth Middleware Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('protect', () => {
    it('should return 401 if no token is provided in headers or query', async () => {
      await protect(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Access denied. No token provided.', 401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should authenticate user with Bearer token in headers', async () => {
      req.headers.authorization = 'Bearer validAccessToken';
      verifyAccessToken.mockReturnValue({ id: 'userId123' });
      const mockUser = { _id: 'userId123', isActive: true, role: 'user' };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await protect(req, res, next);

      expect(verifyAccessToken).toHaveBeenCalledWith('validAccessToken');
      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should authenticate user with token in query params', async () => {
      req.query.token = 'queryAccessToken';
      verifyAccessToken.mockReturnValue({ id: 'userId123' });
      const mockUser = { _id: 'userId123', isActive: true, role: 'user' };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await protect(req, res, next);

      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if user no longer exists', async () => {
      req.headers.authorization = 'Bearer validToken';
      verifyAccessToken.mockReturnValue({ id: 'deletedUserId' });

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await protect(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'User no longer exists.', 401);
    });

    it('should return 401 if user account is deactivated', async () => {
      req.headers.authorization = 'Bearer validToken';
      verifyAccessToken.mockReturnValue({ id: 'inactiveUserId' });
      const inactiveUser = { _id: 'inactiveUserId', isActive: false };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(inactiveUser),
      });

      await protect(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Account is deactivated.', 401);
    });

    it('should return 401 on JsonWebTokenError', async () => {
      req.headers.authorization = 'Bearer malformedToken';
      const jwtError = new Error('invalid token');
      jwtError.name = 'JsonWebTokenError';
      verifyAccessToken.mockImplementation(() => {
        throw jwtError;
      });

      await protect(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Invalid token.', 401);
    });

    it('should return 401 on TokenExpiredError', async () => {
      req.headers.authorization = 'Bearer expiredToken';
      const expiredError = new Error('jwt expired');
      expiredError.name = 'TokenExpiredError';
      verifyAccessToken.mockImplementation(() => {
        throw expiredError;
      });

      await protect(req, res, next);

      expect(sendError).toHaveBeenCalledWith(res, 'Token expired. Please refresh.', 401);
    });
  });

  describe('authorize', () => {
    it('should call next if user role is in authorized roles', () => {
      req.user = { role: 'admin' };
      const middleware = authorize('admin', 'manager');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user role is not in authorized roles', () => {
      req.user = { role: 'user' };
      const middleware = authorize('admin');

      middleware(req, res, next);

      expect(sendError).toHaveBeenCalledWith(
        res,
        "Role 'user' is not authorized to access this route.",
        403
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});
