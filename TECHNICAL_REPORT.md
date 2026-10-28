# Technical Report - Authentication & Profile Management
**Milestone 1**  
**Thành viên:** Team Leader & Authentication  
**Ngày hoàn thành:** 28/10/2026  
**Branch:** `feature/login-profile`

---

## 1. Tổng quan

### 1.1 Mục tiêu
- Xây dựng hệ thống authentication đa phương thức (Email/Password + Firebase Auth)
- Quản lý hồ sơ người dùng với khả năng chỉnh sửa thông tin
- Đảm bảo bảo mật và lưu trữ session người dùng
- Cấu trúc code chuẩn để dễ maintain và mở rộng

### 1.2 Phạm vi công việc
- LoginScreen: Đăng nhập Email/Password
- RegisterScreen: Đăng ký tài khoản mới
- ForgotPasswordScreen: Quên mật khẩu với OTP
- UserProfileScreen: Xem hồ sơ người dùng
- EditProfileScreen: Chỉnh sửa thông tin cá nhân
- ProfileContext: Quản lý profile state toàn ứng dụng

---

## 2. Kiến trúc kỹ thuật

### 2.1 Frontend Architecture

```
frontend/
├── src/
│   ├── context/
│   │   ├── AuthContext.js          # Quản lý auth state
│   │   └── ProfileContext.js       # Quản lý profile state
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── ForgotPasswordScreen.js
│   │   │   ├── OTPVerificationScreen.js
│   │   │   └── CreateNewPasswordScreen.js
│   │   └── profile/
│   │       ├── UserProfileScreen.js
│   │       └── EditProfileScreen.js
│   ├── services/
│   │   ├── authService.js          # Auth logic
│   │   └── api/
│   │       ├── apiClient.js         # Axios client
│   │       ├── authApi.js           # Auth endpoints
│   │       └── profileApi.js       # Profile endpoints
│   ├── config/
│   │   └── firebaseConfig.js        # Firebase config
│   ├── components/common/
│   │   ├── AvatarPicker.js         # Component chọn avatar
│   │   ├── FormTextField.js        # Input field component
│   │   ├── ErrorBanner.js          # Error display
│   │   └── LoadingOverlay.js       # Loading indicator
│   └── utils/
│       └── validation.js           # Validation utilities
```

### 2.2 Backend Architecture

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js       # Auth endpoints handler
│   │   └── profileController.js    # Profile endpoints handler
│   ├── services/
│   │   ├── authService.js          # Auth business logic
│   │   ├── profileService.js       # Profile business logic
│   │   └── emailService.js         # Email service (EmailJS)
│   ├── repositories/
│   │   └── userRepository.js       # Database operations
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   └── PendingOTP.js          # OTP storage
│   ├── routes/
│   │   ├── authRoutes.js           # Auth routes
│   │   └── profileRoutes.js        # Profile routes
│   └── middlewares/
│       ├── authMiddleware.js       # JWT verification
│       └── errorMiddleware.js     # Error handling
└── config/
    ├── db.js                      # MongoDB connection
    └── firebaseAdmin.js           # Firebase Admin SDK
```

### 2.3 Database Schema

**User Collection (MongoDB):**
```javascript
{
  firebaseUid: String (unique, sparse),
  email: String (required, unique),
  password: String (hashed),
  fullName: String (required),
  avatarUrl: String,
  phoneNumber: String,
  walletPoints: Number (default: 0),
  role: String (enum: ['student', 'admin'], default: 'student'),
  status: String (enum: ['active', 'banned'], default: 'active'),
  resetOtp: String,
  otpExpiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**PendingOTP Collection (MongoDB):**
```javascript
{
  email: String (required, unique),
  otp: String (required),
  expiresAt: Date (required),
  createdAt: Date
}
```

---

## 3. Chi tiết implementation

### 3.1 Authentication Flow

#### 3.1.1 Đăng ký (Register)
```
User Input → Validation → Firebase Auth (create user) 
→ MongoDB (create user) → Generate JWT Token 
→ Store to AsyncStorage → Navigate to Home
```

**Key Functions:**
- `authService.registerLocal()` - Tạo user trong MongoDB + Firebase
- `authService.registerWithOTP()` - Đăng ký với OTP verification
- `AuthContext.register()` - Wrapper trong context

#### 3.1.2 Đăng nhập (Login)
```
User Input → Validation → MongoDB (check credentials)
→ Compare password (bcrypt) → Generate JWT Token
→ Store to AsyncStorage → Update AuthContext
```

**Key Functions:**
- `authService.loginLocal()` - Login với email/password
- `AuthContext.login()` - Wrapper trong context
- `apiClient.interceptor` - Tự động attach token vào requests

#### 3.1.3 Quên mật khẩu (Forgot Password)
```
User Input Email → Backend generate OTP 
→ EmailJS send OTP → User verify OTP 
→ Backend verify OTP → Create new password 
→ Update MongoDB + Firebase Auth
```

**Key Functions:**
- `authService.requestPasswordReset()` - Tạo và gửi OTP
- `authService.verifyResetOtp()` - Verify OTP
- `authService.updateNewPassword()` - Update password
- `emailService.sendPasswordResetOtp()` - Gửi email qua EmailJS

### 3.2 Profile Management

#### 3.2.1 Xem hồ sơ (UserProfile)
```
Load from AsyncStorage → Display user info
→ Show wallet points → Display avatar
```

**Key Functions:**
- `ProfileContext` - Quản lý profile state
- `profileApi.getProfile()` - Fetch profile từ backend
- `useAuth()` - Lấy user từ AuthContext

#### 3.2.2 Chỉnh sửa hồ sơ (EditProfile)
```
Edit fields → expo-image-picker pick image
→ Upload image (future) → Update backend
→ Update MongoDB → Update ProfileContext
```

**Key Functions:**
- `ProfileContext.updateProfile()` - Update profile
- `AvatarPicker` - Component chọn ảnh
- `expo-image-picker` - Library pick image
- `profileApi.updateProfile()` - API call

### 3.3 Session Management

**Storage Strategy:**
- `TOKEN_STORAGE_KEY`: 'userToken' - JWT token
- `USER_DATA_KEY`: 'userData' - User object
- AsyncStorage persists giữa sessions
- Token được attach vào mọi authenticated request via axios interceptor

**Auth State:**
- `AuthContext` quản lý auth state toàn ứng dụng
- `loading` state khi đang check session
- Auto-restore session khi mở app
- Auto-clear session khi token expire (401)

---

## 4. Công nghệ sử dụng

### 4.1 Frontend
- **Framework:** React Native + Expo 57
- **Navigation:** React Navigation v7
- **State Management:** Context API (AuthContext, ProfileContext)
- **HTTP Client:** Axios
- **Storage:** AsyncStorage
- **Firebase:** Firebase SDK v13
- **Image Picker:** expo-image-picker
- **UI:** Expo Vector Icons

### 4.2 Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** Firebase Admin SDK + JWT
- **Email:** EmailJS
- **Password Hashing:** bcryptjs
- **Validation:** Custom validators

### 4.3 Security
- **Password Hashing:** bcrypt (10 salt rounds)
- **JWT:** 7-day expiration
- **OTP:** 5-minute expiration
- **Firebase Admin:** Service account key (stored locally, not in git)
- **Environment Variables:** .env files (not in git)

---

## 5. Các vấn đề đã gặp và giải pháp

### 5.1 Google Sign-In với Expo Go
**Vấn đề:** 
- `@react-native-google-signin/google-signin` là native module
- Không hoạt động với Expo Go (cần development build)
- Lỗi: "RNGoogleSignin could not be found"

**Giải pháp:**
- Xóa Google Sign-In tạm thời
- Dùng chỉ Email/Password authentication
- Nếu cần Google Sign-In: Cài Android Studio và build development client

### 5.2 Firebase Auth Persistence Warning
**Vấn đề:**
- Warning: "Auth state will default to memory persistence"
- Lỗi: "Failed to determine project ID" khi metadata.google.internal không available

**Giải pháp:**
- Cấu hình `initializeAuth` với `getReactNativePersistence(AsyncStorage)`
- Disable Firebase Auth state listener (dùng local auth thay vì Firebase)
- Sử dụng hybrid authentication (MongoDB + Firebase sync)

### 5.3 OTP Verification Flow
**Vấn đề:**
- Backend tự tạo OTP nhưng không gửi email thật
- Frontend cần OTP để verify

**Giải pháp:**
- Tạo `emailService.js` sử dụng EmailJS API
- Backend generate OTP, lưu DB, và gửi email
- Frontend nhận OTP từ response để verify
- Unified flow: Backend quản lý tất cả logic OTP

### 5.4 Firebase + MongoDB Sync
**Vấn đề:**
- User có trong Firebase nhưng không có trong MongoDB
- Forgot Password báo "User not found"

**Giải pháp:**
- Tạo script sync: `sync-firebase-user.js`
- Register đồng thời tạo trong Firebase và MongoDB
- Reset password sync cả Firebase và MongoDB
- Hybrid authentication với firebaseUid mapping

---

## 6. Testing

### 6.1 Manual Testing

**Authentication:**
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập với email/password
- ✅ Quên mật khẩu → OTP verification → Reset password
- ✅ Session persistence (close app, reopen vẫn logged in)
- ✅ Logout và clear session

**Profile:**
- ✅ Xem hồ sơ người dùng
- ✅ Chỉnh sửa thông tin cơ bản
- ✅ Chọn ảnh đại diện với expo-image-picker
- ✅ Update profile và lưu vào AsyncStorage

**Security:**
- ✅ Password hashing (bcrypt)
- ✅ JWT token validation
- ✅ Protected routes with auth middleware
- ✅ .gitignore chặn file nhạy cảm

### 6.2 Test Files
- `test-firebase-admin.js` - Test Firebase Admin SDK
- `create-test-user.js` - Tạo user test trong MongoDB
- `sync-firebase-user.js` - Sync Firebase user sang MongoDB
- `add-password-to-user.js` - Thêm password cho user

---

## 7. Tài liệu

### 7.1 API Documentation
- File: `backend/API_DOCUMENTATION.md`
- Nội dung: Auth endpoints, Profile endpoints, Request/Response formats

### 7.2 Test Guide
- File: `backend/TEST_GUIDE.md`
- Nội dung: Hướng dẫn test các flow, setup environment

### 7.3 Environment Variables
```bash
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/smartcampus-market
JWT_SECRET=your-secret-key
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Frontend (.env)
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=smartcampus-market
```

---

## 8. Kết quả và Milestone

### 8.1 Hoàn thành (100%)
- ✅ Authentication screens (Login, Register, Forgot Password)
- ✅ Profile screens (UserProfile, EditProfile)
- ✅ Firebase Auth integration (Email/Password)
- ✅ Session management với AsyncStorage
- ✅ ProfileContext toàn ứng dụng
- ✅ expo-image-picker cho avatar
- ✅ Email service cho OTP
- ✅ Firebase + MongoDB hybrid sync
- ✅ Security (.gitignore, hashing, JWT)
- ✅ Documentation (API docs, test guide)

### 8.2 Không hoàn thành (0%)
- ❌ Google Sign-In (cần Android Studio cho development build)

### 8.3 Thống kê code
- **Frontend:** ~3,000 dòng code
- **Backend:** ~2,000 dòng code
- **Files:** 100 files changed
- **Lines added:** 13,063
- **Lines removed:** 1,433

---

## 9. Hướng dẫn sử dụng

### 9.1 Cài đặt
```bash
# Backend
cd backend
npm install
cp .env.example .env  # Cấu hình environment variables
node server.js

# Frontend
cd frontend
npm install
npx expo start --go
```

### 9.2 Cấu hình Firebase
1. Download service account key từ Firebase Console
2. Đặt file ở `backend/config/serviceAccountKey.json`
3. Cấu hình Firebase config trong `frontend/src/config/firebaseConfig.js`

### 9.3 Test user
- Email: `tungnvce181639@fpt.edu.vn`
- Password: `123456`

---

## 10. Kế hoạch tiếp theo

### 10.1 Sprint 2
- Implement Google Sign-In (sau khi cài Android Studio)
- Add more profile features (address, bio)
- Implement wallet points system
- Add push notifications

### 10.2 Optimizations
- Error boundary implementation
- Loading state optimization
- Performance monitoring
- Unit tests với Jest

---

## 11. Kết luận

Milestone 1 đã hoàn thành thành công với tỷ lệ **90%** (Google Sign-In pending). Hệ thống authentication và profile management hoạt động ổn định với hybrid authentication (Firebase + MongoDB). Code đã được commit và push lên branch `feature/login-profile` sẵn sàng cho review và merge.

**Next Step:** Merge vào branch `develop` và cấp quyền cho các thành viên khác để bắt đầu các milestone tiếp theo.
