const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth');

router.post('/:id', verifyToken, chatController.handleContractChat);

module.exports = router;
