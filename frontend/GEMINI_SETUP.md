# Hướng dẫn cấu hình Gemini AI API Key

## Bước 1: Lấy API Key từ Google AI Studio

1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập bằng tài khoản Google của bạn
3. Nhấn vào nút "Create API Key" hoặc "Tạo API Key"
4. Copy API key được tạo (có dạng: `AIzaSy...`)

## Bước 2: Cấu hình trong dự án

### Phương án 1: Tạo file .env (khuyên dùng cho phát triển)

1. Tạo file `.env` trong thư mục `frontend/`
2. Thêm nội dung sau:
```
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
```
Thay `your_api_key_here` bằng API key bạn đã copy ở Bước 1.

3. Đảm bảo file `.env` đã được thêm vào `.gitignore` (để không commit API key lên GitHub)

### Phương án 2: Sử dụng biến môi trường hệ thống

Đối với Windows (PowerShell):
```powershell
$env:EXPO_PUBLIC_GEMINI_API_KEY="your_api_key_here"
```

Đối với Windows (CMD):
```cmd
set EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

Đối với macOS/Linux:
```bash
export EXPO_PUBLIC_GEMINI_API_KEY="your_api_key_here"
```

## Bước 3: Khởi động lại ứng dụng

Sau khi cấu hình API key, bạn cần khởi động lại ứng dụng Expo:

```bash
cd frontend
expo start --go
```

## Kiểm tra hoạt động

1. Mở màn hình "AI Thẩm Định" trong ứng dụng
2. Chọn một ảnh sản phẩm từ thư viện
3. Chờ AI phân tích (khoảng 2-5 giây tùy tốc độ mạng)
4. Xem kết quả: độ mới, giá đề xuất, tiêu đề và mô tả

## Lưu ý quan trọng

- **KHÔNG BAO GIỜ** commit file `.env` chứa API key thật lên GitHub
- API key miễn phí có giới hạn: 15 requests/phút cho model gemini-1.5-flash
- Nếu gặp lỗi "API key not found", kiểm tra lại biến môi trường `EXPO_PUBLIC_GEMINI_API_KEY`
- Nếu gặp lỗi quota exceeded, bạn có thể cần nâng cấp lên Google AI Studio paid tier

## Xử lý lỗi thường gặp

### Lỗi: "GEMINI_API_KEY not found"
- Kiểm tra xem file `.env` có tồn tại trong thư mục `frontend/` không
- Đảm bảo tên biến đúng: `EXPO_PUBLIC_GEMINI_API_KEY` (chữ hoa, có prefix EXPO_PUBLIC_)
- Khởi động lại Expo sau khi thêm file .env

### Lỗi: "API key invalid"
- Kiểm tra lại API key có bị copy sai không
- Đảm bảo API key được lấy từ https://makersuite.google.com/app/apikey

### Lỗi: "Quota exceeded"
- Chờ 1 phút trước khi thử lại (giới hạn 15 requests/phút)
- Hoặc nâng cấp lên paid tier trên Google AI Studio
