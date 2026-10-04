const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

// Single Fixed Demo Admin Account Credentials
const DEMO_USER = {
  id: 'usr_admin_fixed_001',
  name: 'Contract Analyzer Admin',
  email: 'admin@contractanalyzer.com',
  password: 'Admin@123',
  role: 'ADMIN',
  organization_id: 'org_main_001'
};

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required.', 400);
    }

    const inputEmail = email.toLowerCase().trim();

    // Validate single fixed demo account or standard admin email
    if (
      (inputEmail === 'admin@contractanalyzer.com' && password === 'Admin@123') ||
      (inputEmail === 'admin@acme.com' && password === 'Password123!')
    ) {
      const user = {
        id: DEMO_USER.id,
        name: DEMO_USER.name,
        email: inputEmail,
        role: 'ADMIN',
        organization_id: DEMO_USER.organization_id
      };

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          organization_id: user.organization_id,
          name: user.name
        },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      return successResponse(res, { user, token }, 'Login successful.');
    }

    return errorResponse(res, 'Invalid email or password. Please use admin@contractanalyzer.com / Admin@123', 401);
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = {
      id: req.user.id || DEMO_USER.id,
      name: req.user.name || DEMO_USER.name,
      email: req.user.email || DEMO_USER.email,
      role: 'ADMIN',
      organization_id: DEMO_USER.organization_id
    };
    return successResponse(res, { user }, 'User profile retrieved.');
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    return successResponse(res, null, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  getMe,
  logout
};
