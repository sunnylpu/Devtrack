const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../src/utils/jwt');

describe('JWT Utility Unit Tests', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test_access_secret_12345';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_12345';
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  });

  it('should sign and verify access token with user ID and role', () => {
    const userId = 'user123';
    const role = 'admin';

    const token = generateAccessToken(userId, role);
    expect(typeof token).toBe('string');

    const decoded = verifyAccessToken(token);
    expect(decoded.id).toBe(userId);
    expect(decoded.role).toBe(role);
  });

  it('should sign and verify refresh token with user ID', () => {
    const userId = 'user456';

    const token = generateRefreshToken(userId);
    expect(typeof token).toBe('string');

    const decoded = verifyRefreshToken(token);
    expect(decoded.id).toBe(userId);
  });

  it('should throw error when verifying invalid token', () => {
    expect(() => verifyAccessToken('malformed.token.string')).toThrow();
  });
});
