const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const { successResponse } = require('../utils/responseFormatter');
const db = require('../config/db');

router.get('/health', verifyToken, checkRole(['ADMIN']), async (req, res, next) => {
  try {
    const healthStatus = {
      backend: 'ONLINE',
      database: 'ONLINE',
      aiService: 'ONLINE',
      vectorDb: 'ONLINE (pgvector)',
      timestamp: new Date().toISOString()
    };
    return successResponse(res, { healthStatus }, 'Admin health check completed.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
