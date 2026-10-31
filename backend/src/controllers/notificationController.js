const { asyncHandler } = require('../../middlewares/errorMiddleware');
const notificationService = require('../services/notificationService');

class NotificationController {
  registerDeviceToken = asyncHandler(async (req, res) => {
    const { token, sound } = req.body;
    if (typeof token !== 'string' || token.length > 256 || !notificationService.validExpoToken.test(token)) {
      const error = new Error('A valid Expo Push Token is required.');
      error.statusCode = 400;
      throw error;
    }
    if (sound !== undefined && typeof sound !== 'boolean') {
      const error = new Error('Sound preference must be a boolean.');
      error.statusCode = 400;
      throw error;
    }

    await notificationService.saveDeviceToken(req.userId, token, sound);
    res.status(200).json({ success: true });
  });

  unregisterDeviceToken = asyncHandler(async (req, res) => {
    await notificationService.saveDeviceToken(req.userId, null);
    res.status(200).json({ success: true });
  });

  updatePreferences = asyncHandler(async (req, res) => {
    const { sound } = req.body;
    if (typeof sound !== 'boolean') {
      const error = new Error('Sound preference must be a boolean.');
      error.statusCode = 400;
      throw error;
    }

    await notificationService.saveDeviceToken(req.userId, undefined, sound);
    res.status(200).json({ success: true });
  });

  notifyOrderEvent = asyncHandler(async (req, res) => {
    const { orderId, event } = req.body;
    if (typeof orderId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(orderId)) {
      const error = new Error('A valid Firestore order ID is required.');
      error.statusCode = 400;
      throw error;
    }

    const result = await notificationService.notifyOrderEvent({
      orderId: orderId.trim(),
      event,
      actorIds: [String(req.userId), req.user?.firebaseUid].filter(Boolean),
    });
    res.status(200).json({ success: true, ...result });
  });
}

module.exports = new NotificationController();