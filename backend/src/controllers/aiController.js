const { asyncHandler } = require('../../middlewares/errorMiddleware');
const geminiAIService = require('../services/geminiAIService');

class AIController {
  chat = asyncHandler(async (req, res) => {
    const { message, history } = req.body;
    if (typeof message !== 'string' || !message.trim()) {
      const error = new Error('Message is required.');
      error.statusCode = 400;
      throw error;
    }
    if (history !== undefined && !Array.isArray(history)) {
      const error = new Error('History must be an array.');
      error.statusCode = 400;
      throw error;
    }

    const reply = await geminiAIService.chatWithAssistant(message.trim(), history || []);
    res.status(200).json({ success: true, reply });
  });

  analyze = asyncHandler(async (req, res) => {
    const { imageBase64, mimeType } = req.body;
    if (typeof imageBase64 !== 'string' || !imageBase64) {
      const error = new Error('imageBase64 is required.');
      error.statusCode = 400;
      throw error;
    }
    if (mimeType !== undefined && typeof mimeType !== 'string') {
      const error = new Error('mimeType must be a string.');
      error.statusCode = 400;
      throw error;
    }

    const result = await geminiAIService.analyzeProductImage({ imageBase64, mimeType });
    res.status(200).json({ success: true, result });
  });

  describe = asyncHandler(async (req, res) => {
    const productInfo = req.body?.productInfo || req.body;
    if (!productInfo || typeof productInfo !== 'object') {
      const error = new Error('productInfo is required.');
      error.statusCode = 400;
      throw error;
    }

    const result = await geminiAIService.generateDescription(productInfo);
    res.status(200).json({ success: true, result });
  });

  regenerate = asyncHandler(async (req, res) => {
    const { currentResult, tone } = req.body;
    if (!currentResult || typeof currentResult !== 'object') {
      const error = new Error('currentResult is required.');
      error.statusCode = 400;
      throw error;
    }
    if (tone !== undefined && typeof tone !== 'string') {
      const error = new Error('tone must be a string.');
      error.statusCode = 400;
      throw error;
    }

    const result = await geminiAIService.regenerateDescription(currentResult, tone);
    res.status(200).json({ success: true, result });
  });
}

module.exports = new AIController();
