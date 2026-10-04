const express = require('express');
const router = express.Router();
const compareController = require('../controllers/compareController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, compareController.compareVersions);

module.exports = router;
