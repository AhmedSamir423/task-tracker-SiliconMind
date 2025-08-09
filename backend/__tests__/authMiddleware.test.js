const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    // Mock logger to prevent console output during tests
    jest.spyOn(require('../logger').logger, 'error').mockImplementation(() => {});
    process.env.JWT_SECRET = 'ITSGONALWAYSBEMYFAULT'; // Ensure consistent secret
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should return 401 if no token is provided', () => {
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 403 if token is invalid', () => {
    req.headers.authorization = 'Bearer invalidtoken';
    jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'), null);
    });
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should call next if token is valid', () => {
    const user = { userId: 1 };
    const token = jwt.sign(user, process.env.JWT_SECRET);
    req.headers.authorization = `Bearer ${token}`;
    authenticateToken(req, res, next);
    // Expect only userId to match, ignoring iat
    expect(req.user.userId).toBe(user.userId);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
