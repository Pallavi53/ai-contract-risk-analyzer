const express = require('express');
const router = express.Router();
const orgController = require('../controllers/orgController');
const { verifyToken } = require('../middleware/auth');

router.get('/metrics', verifyToken, orgController.getOrgMetrics);

module.exports = router;
