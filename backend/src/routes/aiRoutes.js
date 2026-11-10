const express = require('express');
const { verifyToken } = require('../../middlewares/authMiddleware');
const aiController = require('../controllers/aiController');

const router = express.Router();

router.post('/chat', verifyToken, aiController.chat);
router.post('/analyze', verifyToken, aiController.analyze);
router.post('/describe', verifyToken, aiController.describe);
router.post('/regenerate', verifyToken, aiController.regenerate);

module.exports = router;
