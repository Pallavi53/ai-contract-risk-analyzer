const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { errorResponse } = require('../utils/responseFormatter');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return errorResponse(res, 'Access denied. Authorization token required.', 401);
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (err) {
    return errorResponse(res, 'Invalid or expired token.', 401);
  }
}

function checkRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'User context missing.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, `Forbidden. Requires one of roles: ${allowedRoles.join(', ')}`, 403);
    }

    next();
  };
}

module.exports = {
  verifyToken,
  checkRole
};
