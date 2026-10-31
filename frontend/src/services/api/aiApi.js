import { GoogleGenerativeAI } from '@google/generative-ai';

// Khởi tạo Gemini AI client
const getGeminiClient = () => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[aiApi] GEMINI_API_KEY not found in environment variables');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Phân tích ảnh sản phẩm bằng Gemini Vision API
 * @param {string} imageUri - URI của ảnh sản phẩm (base64 hoặc file URI)
 * @returns {Promise<Object>} - Kết quả phân tích: { condition, estimatedPrice, title, description }
 */
export const analyzeProductImage = async (imageUri) => {
  try {
    const genAI = getGeminiClient();
    if (!genAI) {
      throw new Error('Không tìm thấy API Key Gemini. Vui lòng cấu hình EXPO_PUBLIC_GEMINI_API_KEY.');
    }

    // Sử dụng model Gemini Pro Vision
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Chuyển đổi URI ảnh sang base64 nếu cần
    let imageData;
    if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
      // Nếu là file URI, cần đọc và chuyển sang base64
      const fs = require('expo-file-system');
      const base64 = await fs.readAsStringAsync(imageUri, {
        encoding: fs.EncodingType.Base64,
      });
      imageData = {
        inlineData: {
          data: base64,
          mimeType: 'image/jpeg',
        },
      };
    } else if (imageUri.startsWith('data:image')) {
      // Nếu đã là base64 data URI
      const base64Data = imageUri.split(',')[1];
      imageData = {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      };
    } else {
      throw new Error('Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh từ thư viện hoặc chụp ảnh mới.');
    }

    // Prompt engineering để phân tích sản phẩm
    const prompt = `Bạn là chuyên gia thẩm định đồ cũ cho sinh viên FPT University. Hãy phân tích ảnh sản phẩm này và trả về kết quả dưới dạng JSON với cấu trúc sau:

{
  "condition": số nguyên từ 0-100 (độ mới của sản phẩm),
  "estimatedPrice": "giá đề xuất (định dạng VND, ví dụ: 95.000đ)",
  "title": "tiêu đề bài đăng hấp dẫn, ngắn gọn (tối đa 80 ký tự)",
  "description": "mô tả chi tiết sản phẩm với văn phong sinh viên, bao gồm: tình trạng, đặc điểm nổi bật, quà tặng kèm (nếu có), nơi giao dịch, giá cả"
}

Yêu cầu:
- Phân tích kỹ lưỡng: độ mới, tình trạng bề mặt, mép giấy/gáy sách, vết xước, hư hại
- Định giá hợp lý dựa trên tình trạng thực tế và giá thị trường đồ cũ
- Viết mô tả thu hút với văn phong sinh viên FPT, thân thiện, thực tế
- Ưu tiên các sản phẩm phổ biến: sách giáo trình, đồ điện tử, nội thất phòng trọ
- Nếu không nhận diện được sản phẩm, hãy trả về condition: 0 và estimatedPrice: "Không xác định"`;

    // Gọi Gemini API
    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();

    // Parse JSON từ response
    let parsedResult;
    try {
      // Lấy phần JSON từ response (có thể có thêm text quanh đó)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        parsedResult = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('[aiApi] Error parsing Gemini response:', parseError);
      throw new Error('Không thể phân tích kết quả từ AI. Vui lòng thử lại.');
    }

    // Validate kết quả
    if (!parsedResult || typeof parsedResult !== 'object') {
      throw new Error('Kết quả từ AI không hợp lệ.');
    }

    // Đảm bảo các trường bắt buộc tồn tại
    return {
      condition: parsedResult.condition || 50,
      estimatedPrice: parsedResult.estimatedPrice || 'Không xác định',
      title: parsedResult.title || 'Sản phẩm chưa đặt tên',
      description: parsedResult.description || 'Chưa có mô tả',
    };
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
    const genAI = getGeminiClient();
    if (!genAI) {
      throw new Error('Không tìm thấy API Key Gemini.');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const toneInstructions = {
      casual: 'văn phong sinh viên, thân thiện, dùng từ ngữ trẻ trung',
      formal: 'văn phong trang trọng, chuyên nghiệp, chi tiết',
      urgent: 'văn phong gấp gáp, nhấn mạnh cần bán nhanh, kêu gọi hành động',
    };

    const prompt = `Dựa trên thông tin sản phẩm sau, hãy viết lại mô tả với ${toneInstructions[tone] || toneInstructions.casual}:

Sản phẩm: ${currentResult.title}
Giá: ${currentResult.estimatedPrice}
Tình trạng: ${currentResult.condition}%
Mô tả hiện tại: ${currentResult.description}

Trả về kết quả dưới dạng JSON:
{
  "title": "tiêu đề mới hấp dẫn (tối đa 80 ký tự)",
  "description": "mô tả mới với phong cách yêu cầu"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let parsedResult;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        parsedResult = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('[aiApi] Error parsing regeneration response:', parseError);
      throw new Error('Không thể phân tích kết quả từ AI.');
    }

    return {
      ...currentResult,
      title: parsedResult.title || currentResult.title,
      description: parsedResult.description || currentResult.description,
    };
  } catch (error) {
    console.error('[aiApi] Error regenerating description:', error);
    throw error;
  }
};

export default {
  analyzeProductImage,
  regenerateDescription,
};
