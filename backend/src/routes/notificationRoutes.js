const express = require('express');
const { verifyToken } = require('../../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.post('/device-token', verifyToken, notificationController.registerDeviceToken);
router.delete('/device-token', verifyToken, notificationController.unregisterDeviceToken);
router.put('/preferences', verifyToken, notificationController.updatePreferences);
router.post('/order-event', verifyToken, notificationController.notifyOrderEvent);

module.exports = router;