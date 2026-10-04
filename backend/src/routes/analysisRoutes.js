const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const { verifyToken } = require('../middleware/auth');

router.get('/:id', verifyToken, analysisController.getContractAnalysis);

module.exports = router;
