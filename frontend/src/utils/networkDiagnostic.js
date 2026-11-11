import { Platform } from 'react-native';

/**
 * Diagnostic tool to identify the exact cause of Network Error in React Native / Expo
 */
export async function diagnoseBackendConnection(customUrl = null) {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  let defaultUrl = 'http://localhost:5000/api';
  if (Platform.OS === 'android') {
    defaultUrl = 'http://10.0.2.2:5000/api';
  }

  const targetApiUrl = customUrl || envUrl || defaultUrl;
  
  // Extract base server origin (e.g., http://10.0.2.2:5000 or http://172.20.10.2:5000)
  let origin = targetApiUrl;
  try {
    const urlObj = new URL(targetApiUrl);
    origin = `${urlObj.protocol}//${urlObj.host}`;
  } catch (e) {
    // Fallback regex if URL parsing fails
    const match = targetApiUrl.match(/^(https?:\/\/[^\/]+)/);
    if (match) origin = match[1];
  }

  const result = {
    platform: Platform.OS,
    configuredEnv: envUrl || '(chưa cấu hình EXPO_PUBLIC_API_URL)',
    targetApiUrl,
    testOrigin: origin,
    reachable: false,
    statusCode: null,
    errorDetail: null,
    diagnosis: '',
    solution: '',
  };

  const startTime = Date.now();
  try {
    // Attempt a lightweight fetch with a 4-second timeout to the server root
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${origin}/`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    result.reachable = true;
    result.statusCode = response.status;
    const responseText = await response.text();
    result.diagnosis = `Kết nối thành công tới server (${origin}). Phản hồi: "${responseText.substring(0, 100)}"`;
    result.solution = 'Backend đang chạy bình thường. Nếu API cụ thể lỗi, hãy kiểm tra route hoặc dữ liệu gửi lên.';
  } catch (err) {
    result.errorDetail = err?.message || String(err);
    const duration = Date.now() - startTime;

    if (err.name === 'AbortError' || duration >= 4000) {
      result.diagnosis = `Hết thời gian chờ kết nối (Timeout > 4s) tới ${origin}.`;
      if (targetApiUrl.includes('10.0.2.2')) {
        result.solution = 'Bạn đang dùng IP 10.0.2.2. Nếu đang test trên ĐIỆN THOẠI THẬT, điện thoại không thể vào 10.0.2.2. Hãy tạo file frontend/.env và đặt EXPO_PUBLIC_API_URL=http://<IP_MÁY_TÍNH>:5000/api';
      } else {
        result.solution = 'Kiểm tra xem máy tính và điện thoại có chung mạng Wi-Fi không, hoặc Windows Firewall có đang chặn cổng 5000 không.';
      }
    } else {
      result.diagnosis = `Không thể kết nối (Connection Refused / Network Unreachable): ${err.message}`;
      if (targetApiUrl.includes('10.0.2.2')) {
        result.solution = 'LƯU Ý: IP 10.0.2.2 chỉ hoạt động trên Máy ảo Android Studio. Nếu chạy điện thoại thật qua Expo Go, vui lòng đổi sang IP LAN của máy tính.';
      } else if (targetApiUrl.includes('localhost')) {
        result.solution = 'App mobile không thể gọi trực tiếp "localhost" của máy tính. Hãy đổi thành IP LAN máy tính.';
      } else {
        result.solution = '1. Đảm bảo backend đã chạy (cd backend && npm run dev).\n2. Kiểm tra cổng 5000.\n3. Đảm bảo điện thoại và máy tính kết nối cùng 1 Wi-Fi.';
      }
    }
  }

  // In log chi tiết ra console
  console.log('\n================== [NETWORK DIAGNOSTIC REPORT] ==================');
  console.log(`📱 Platform:            ${result.platform}`);
  console.log(`⚙️  EXPO_PUBLIC_API_URL: ${result.configuredEnv}`);
  console.log(`🌐 Target API:          ${result.targetApiUrl}`);
  console.log(`📡 Server Root:         ${result.testOrigin}`);
  console.log(`🔌 Kết nối được:        ${result.reachable ? '✅ CÓ' : '❌ KHÔNG'}`);
  if (result.statusCode) {
    console.log(`📊 HTTP Status:         ${result.statusCode}`);
  }
  if (result.errorDetail) {
    console.log(`⚠️  Chi tiết lỗi:       ${result.errorDetail}`);
  }
  console.log(`🔍 Chẩn đoán:           ${result.diagnosis}`);
  console.log(`💡 Cách khắc phục:      \n${result.solution}`);
  console.log('=================================================================\n');

  return result;
}

export default diagnoseBackendConnection;

