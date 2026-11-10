const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getGeminiClient = () => {
  if (genAI) {
    return genAI;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured on the server.');
    error.statusCode = 500;
    throw error;
  }

  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
};

module.exports = { getGeminiClient };
