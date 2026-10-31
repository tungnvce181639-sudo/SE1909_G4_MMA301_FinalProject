# 🛒 SmartCampus Market - MMA301 Final Project

> **Ứng dụng Chợ Trao đổi Đồ cũ Sinh viên tích hợp Gemini AI & Firebase**  
> **Lớp:** SE1909 | **Nhóm:** G4 | **Môn học:** MMA301 - Multiplatform Mobile App Development

---

## 👥 Danh sách Thành viên & Phân công (Ownership Matrix)

| STT | Họ và tên | MSSV | Màn hình phụ trách chính | Công nghệ & Bằng chứng kỹ thuật |
| :---: | :--- | :---: | :--- | :--- |
| 1 | **Thành viên 1** (Leader) | SE181639 | `LoginScreen`, `UserProfileScreen` | Firebase Auth, ProfileContext, AsyncStorage, Git Setup |
| 2 | **Thành viên 2** | SE123457 | `HomeScreen`, `ProductDetailScreen` | React Navigation, FlatList Infinite Scroll, Search/Filter |
| 3 | **Thành viên 3** | SE123458 | `PostItemScreen`, `MyListingsScreen` | Firestore CRUD, Expo Image Picker, Expo Location/Map |
| 4 | **Thành viên 4** | SE123459 | `AIEstimatorScreen`, `AIChatbotScreen` | Gemini AI SDK, Prompt Engineering, Fallback UI |
| 5 | **Thành viên 5** | SE123460 | `OrderHistoryScreen`, `SettingsScreen` | ThemeContext (Dark Mode), Firebase FCM Notification, Release APK |

---

## 🛠️ Công nghệ Sử dụng (Tech Stack)

- **Frontend:** React Native (Expo SDK 57), React Navigation, Context API, AsyncStorage.
- **Backend:** Node.js, Express.js (Kiến trúc 5 tầng: Controller -> Route -> Service -> Repository -> Model).
- **Database & Cloud:** Firebase Firestore, Firebase Authentication, Firebase Cloud Messaging (FCM).
- **AI Integration:** `@google/generative-ai` (Gemini Flash Vision API).
- **Device Features:** `expo-image-picker`, `expo-location`, `react-native-maps`.

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy (Setup & Run)

### 1. Khởi động Backend (Node.js REST API)
```bash
cd backend
npm install
# Tạo file .env dựa trên thông số DB & Firebase Admin
npm start
```

### 2. Khởi động Frontend
```bash
cd frontend
npm install
npm start
```

### 3. Build ứng dụng Android

Ứng dụng có cấu hình EAS để tạo APK thử nghiệm và AAB phát hành. Cần đăng nhập Expo và liên kết project EAS trước lần build đầu:
```bash
cd frontend
npx eas-cli login
npx eas-cli init
npm run build:apk
# Hoặc tạo AAB cho phát hành:
npm run build:aab
```

Profile `preview` tạo APK cài trực tiếp; `production` tạo Android App Bundle (AAB). EAS thực hiện build trên dịch vụ của Expo.
Để nhận Push trên Android, cấu hình Firebase Cloud Messaging V1 credentials trong EAS và Firebase Admin service account cho backend; không commit các khóa này vào mã nguồn.