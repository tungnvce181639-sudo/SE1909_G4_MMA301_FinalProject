const cloudinary = require('cloudinary').v2;
const https = require('https');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

function uploadToCloudinary({ imageData, folder, cloudName, apiKey, apiSecret }) {
  const [, mimeType, encodedImage] = imageData.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+=*)$/i);
  const imageBuffer = Buffer.from(encodedImage, 'base64');
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, apiSecret);
  const boundary = `----SmartCampus${Date.now().toString(16)}`;
  const fields = { api_key: apiKey, timestamp, folder, signature };
  const chunks = [];

  for (const [name, value] of Object.entries(fields)) {
    chunks.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
    ));
  }
  chunks.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="listing.${mimeType.split('/')[1]}"\r\nContent-Type: ${mimeType}\r\n\r\n`,
  ));
  chunks.push(imageBuffer);
  chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`));
  const body = Buffer.concat(chunks);
  const requestUrl = new URL(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`);

  return new Promise((resolve, reject) => {
    const request = https.request(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
      timeout: 120000,
    }, (response) => {
      const responseChunks = [];
      response.on('data', (chunk) => responseChunks.push(chunk));
      response.on('end', () => {
        let responseData;
        try {
          responseData = JSON.parse(Buffer.concat(responseChunks).toString('utf8'));
        } catch {
          reject(new Error(`Cloudinary returned an unreadable response (HTTP ${response.statusCode || 0}).`));
          return;
        }

        if (response.statusCode < 200 || response.statusCode >= 300 || !responseData.secure_url) {
          const error = new Error(responseData.error?.message || `Cloudinary returned HTTP ${response.statusCode || 0}.`);
          error.http_code = response.statusCode || 502;
          reject(error);
          return;
        }
        resolve(responseData);
      });
    });

    request.on('timeout', () => request.destroy(new Error('Cloudinary upload timed out.')));
    request.on('error', reject);
    request.end(body);
  });
}

class UploadController {
  uploadListingImage = asyncHandler(async (req, res) => {
    const { listingId, imageData } = req.body;
    if (typeof listingId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(listingId)) {
      return res.status(400).json({ success: false, message: 'Mã tin đăng không hợp lệ.' });
    }
    if (typeof imageData !== 'string' || !/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/i.test(imageData)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu ảnh không hợp lệ.' });
    }
    if (imageData.length > 11 * 1024 * 1024) {
      return res.status(413).json({ success: false, message: 'Ảnh vượt quá dung lượng cho phép (8 MB).' });
    }

    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return res.status(503).json({
        success: false,
        message: 'Máy chủ chưa được cấu hình Cloudinary. Hãy bổ sung thông tin Cloudinary vào backend/.env.',
      });
    }

    const folder = `smartcampus-market/users/${String(req.userId)}/listings/${listingId}`;
    console.info('[uploads] Image upload started.');
    let result;
    try {
      result = await uploadToCloudinary({
        imageData,
        folder,
        cloudName: CLOUDINARY_CLOUD_NAME,
        apiKey: CLOUDINARY_API_KEY,
        apiSecret: CLOUDINARY_API_SECRET,
      });
    } catch (error) {
      console.error('[uploads] Cloudinary rejected image upload:', {
        name: error.name || 'Error',
        httpCode: error.http_code || null,
        message: error.message || 'Unknown Cloudinary error',
      });
      const uploadError = new Error(`Cloudinary upload failed (HTTP ${error.http_code || 'unknown'}): ${error.message}`);
      uploadError.statusCode = 502;
      throw uploadError;
    }

    console.info('[uploads] Image upload completed.');
    res.status(200).json({ success: true, secureUrl: result.secure_url });
  });
}

module.exports = new UploadController();
