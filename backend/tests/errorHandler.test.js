const { errorHandler, notFound } = require('../src/middleware/errorHandler');

jest.mock('../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

describe('Error Handler Middleware Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      originalUrl: '/api/test',
      method: 'GET',
      ip: '127.0.0.1',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should handle MongoDB duplicate key error (code 11000)', () => {
    const err = new Error('Duplicate key');
    err.code = 11000;
    err.keyValue = { email: 'test@example.com' };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Email already exists.',
      })
    );
  });

  it('should handle Mongoose ValidationError', () => {
    const err = new Error('Validation failed');
    err.name = 'ValidationError';
    err.errors = {
      email: { path: 'email', message: 'Email is required' },
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation failed',
      errors: [{ field: 'email', message: 'Email is required' }],
    });
  });

  it('should handle Mongoose CastError (invalid ObjectId)', () => {
    const err = new Error('Cast error');
    err.name = 'CastError';
    err.path = '_id';
    err.value = 'invalid-id';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid _id: invalid-id',
      })
    );
  });

  it('should handle JsonWebTokenError and TokenExpiredError', () => {
    const jwtErr = new Error('Invalid token');
    jwtErr.name = 'JsonWebTokenError';

    errorHandler(jwtErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid token',
      })
    );

    const expErr = new Error('Expired');
    expErr.name = 'TokenExpiredError';

    errorHandler(expErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Token has expired',
      })
    );
  });

  it('should handle notFound 404 handler', () => {
    notFound(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Route /api/test not found',
    });
  });
});
