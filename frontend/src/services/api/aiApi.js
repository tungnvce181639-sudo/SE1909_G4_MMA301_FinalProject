import apiClient from './apiClient';

// AI requests có thể mất nhiều thời gian hơn request thường (LLM inference)
const AI_TIMEOUT = 60000;

const getImageBase64 = async (imageUri) => {
  if (imageUri.startsWith('data:image')) {
    return imageUri.split(',')[1];
  }

  if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
    const fs = require('expo-file-system');
    return fs.readAsStringAsync(imageUri, {
      encoding: fs.EncodingType.Base64,
    });
  }

  throw new Error('Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh từ thư viện hoặc chụp ảnh mới.');
};

/**
 * Phân tích ảnh sản phẩm qua backend (Gemini Vision)
 * @param {string} imageUri - URI của ảnh sản phẩm (base64 data URI, file:// hoặc content://)
 * @returns {Promise<Object>} - { condition, estimatedPrice, title, description }
 */
export const analyzeProductImage = async (imageUri) => {
  try {
    const imageBase64 = await getImageBase64(imageUri);
    const response = await apiClient.post(
      '/ai/analyze',
      { imageBase64, mimeType: 'image/jpeg' },
      { timeout: AI_TIMEOUT }
    );
    return response.result;
  } catch (error) {
    console.error('[aiApi] Error analyzing product image:', error);
    throw error;
  }
};

/**
 * Tạo lại mô tả với phong cách khác
 * @param {Object} currentResult - Kết quả hiện tại
 * @param {string} tone - Phong cách mong muốn (formal, casual, urgent)
 * @returns {Promise<Object>} - Kết quả mới với mô tả đã thay đổi
 */
export const regenerateDescription = async (currentResult, tone = 'casual') => {
  try {
    const response = await apiClient.post(
      '/ai/regenerate',
      { currentResult, tone },
      { timeout: AI_TIMEOUT }
    );
    return response.result;
  } catch (error) {
    console.error('[aiApi] Error regenerating description:', error);
    throw error;
  }
};

/**
 * Tạo mô tả sản phẩm dựa trên thông tin chi tiết
 * @param {Object} productInfo - Thông tin sản phẩm { title, category, condition, price, images }
 * @returns {Promise<Object>} - { title, description }
 */
export const generateDescription = async (productInfo) => {
  try {
    const response = await apiClient.post(
      '/ai/describe',
      { productInfo },
      { timeout: AI_TIMEOUT }
    );
    return response.result;
  } catch (error) {
    console.error('[aiApi] Error generating description:', error);
    throw error;
  }
};

/**
 * Chat với trợ lý AI Campus
 * @param {string} message - Tin nhắn mới của người dùng
 * @param {Array} history - Lịch sử chat (tối đa 20 lượt gần nhất)
 * @returns {Promise<string>} - Câu trả lời của AI
 */
export const chatWithAssistant = async (message, history = [], imageUri = null) => {
  try {
    const payload = { message, history };
    if (imageUri) {
      payload.imageBase64 = await getImageBase64(imageUri);
      payload.mimeType = 'image/jpeg';
    }
    const response = await apiClient.post('/ai/chat', payload, { timeout: AI_TIMEOUT });
    return response.reply;
  } catch (error) {
    console.error('[aiApi] Error chatting with assistant:', error);
    throw error;
  }
};

export default {
  analyzeProductImage,
  regenerateDescription,
  generateDescription,
  chatWithAssistant,
};
