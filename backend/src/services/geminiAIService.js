const { getGeminiClient } = require('../../config/gemini');

const MODEL_NAME = 'gemini-1.5-flash';

const CHATBOT_SYSTEM_INSTRUCTION = `Bạn là "Campus AI" - trợ lý AI của Chợ Sinh Viên FPT University, chuyên tư vấn mua bán đồ cũ trong khuôn viên trường.

Nhiệm vụ của bạn:
- Tư vấn quy định chợ sinh viên: giờ giấc hoạt động, khu vực giao dịch, quy trình đăng bài
- Hướng dẫn kiểm tra đồ cũ: laptop, điện thoại, sách giáo trình, đồ dùng KTX (pin, màn hình, gáy sách, độ mới)
- Cảnh báo và mẹo tránh lừa đảo: giao dịch ở nơi đông người, kiểm tra hàng trước khi chuyển khoản, không chia sẻ OTP, kiểm tra serial/warranty
- Gợi ý định giá hợp lý cho đồ cũ sinh viên

Phong cách trả lời:
- Tiếng Việt, thân thiện, xưng "mình" gọi "bạn", văn phong sinh viên trẻ trung
- Ngắn gọn, thực tế, có thể dùng gạch đầu dòng khi liệt kê bước kiểm tra
- Nếu câu hỏi không liên quan đến mua bán đồ cũ/chợ sinh viên, lịch sự từ chối và gợi ý chủ đề bạn hỗ trợ`;

const parseJsonResponse = (text) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (parseError) {
    console.error('[geminiAIService] Error parsing Gemini response:', parseError);
    const error = new Error('Không thể phân tích kết quả từ AI. Vui lòng thử lại.');
    error.statusCode = 502;
    throw error;
  }
};

const analyzeProductImage = async ({ imageBase64, mimeType = 'image/jpeg' }) => {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

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

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: imageBase64, mimeType } },
  ]);
  const text = (await result.response).text();
  const parsed = parseJsonResponse(text);

  if (!parsed || typeof parsed !== 'object') {
    const error = new Error('Kết quả từ AI không hợp lệ.');
    error.statusCode = 502;
    throw error;
  }

  return {
    condition: parsed.condition || 50,
    estimatedPrice: parsed.estimatedPrice || 'Không xác định',
    title: parsed.title || 'Sản phẩm chưa đặt tên',
    description: parsed.description || 'Chưa có mô tả',
  };
};

const regenerateDescription = async (currentResult, tone = 'casual') => {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

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
  const text = (await result.response).text();
  const parsed = parseJsonResponse(text);

  return {
    ...currentResult,
    title: parsed.title || currentResult.title,
    description: parsed.description || currentResult.description,
  };
};

const generateDescription = async (productInfo) => {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `Bạn là chuyên gia viết bài đăng bán đồ cũ cho sinh viên FPT University. Hãy viết một bài đăng hấp dẫn dựa trên thông tin sau:

Tiêu đề hiện tại: ${productInfo.title || 'Chưa có tiêu đề'}
Danh mục: ${productInfo.category || 'Chưa phân loại'}
Tình trạng: ${productInfo.condition || 'Chưa xác định'}
Giá bán: ${productInfo.price ? `${Number(productInfo.price).toLocaleString('vi-VN')}đ` : 'Chưa có giá'}
Số lượng ảnh: ${productInfo.images?.length || 0} ảnh

Yêu cầu:
- Viết tiêu đề ngắn gọn, hấp dẫn (tối đa 80 ký tự)
- Viết mô tả chi tiết với văn phong sinh viên FPT, thân thiện, thực tế
- Bao gồm: tình trạng chi tiết, đặc điểm nổi bật, lý do bán, quà tặng kèm (nếu có), nơi giao dịch
- Nhấn mạnh lợi ích cho người mua (giá rẻ, tiện lợi, kèm tài liệu...)
- Sử dụng định dạng bullet points để dễ đọc
- Kết thúc với lời kêu gọi hành động nhẹ nhàng

Trả về kết quả dưới dạng JSON:
{
  "title": "tiêu đề hấp dẫn (tối đa 80 ký tự)",
  "description": "mô tả chi tiết với văn phong sinh viên"
}`;

  const result = await model.generateContent(prompt);
  const text = (await result.response).text();
  const parsed = parseJsonResponse(text);

  return {
    title: parsed.title || productInfo.title || 'Sản phẩm chưa đặt tên',
    description: parsed.description || 'Chưa có mô tả',
  };
};

const chatWithAssistant = async (message, history = []) => {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: CHATBOT_SYSTEM_INSTRUCTION,
  });

  const chat = model.startChat({
    history: history.slice(-20),
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  const result = await chat.sendMessage(message);
  return (await result.response).text().trim();
};

module.exports = {
  analyzeProductImage,
  regenerateDescription,
  generateDescription,
  chatWithAssistant,
};
