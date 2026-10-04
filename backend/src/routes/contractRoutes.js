const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', verifyToken, checkRole(['ADMIN', 'REVIEWER', 'USER']), upload.single('file'), contractController.uploadContract);
router.get('/', verifyToken, contractController.listContracts);
router.get('/:id', verifyToken, contractController.getContractById);
router.delete('/:id', verifyToken, checkRole(['ADMIN', 'REVIEWER']), contractController.deleteContract);

module.exports = router;
