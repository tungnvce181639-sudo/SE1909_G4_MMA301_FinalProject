# Backend API Testing Guide

## Prerequisites

1. **MongoDB** must be running locally or MongoDB Atlas connection configured
2. **Firebase Admin** service account key must be configured
3. **Node.js** and dependencies installed

## Frontend Setup for Network Connection

The frontend needs to connect to the backend API. Configure the API URL in the frontend:

1. Create `.env` file in the `frontend/` directory:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit `.env` and set the appropriate API URL based on your device:
   - **Android Emulator**: `EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api`
   - **iOS Simulator**: `EXPO_PUBLIC_API_URL=http://localhost:5000/api`
   - **Physical Device**: Use your computer's LAN IP (check with `ipconfig` or `ifconfig`):
     ```
     EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:5000/api
     # Example for Windows with IP 172.20.10.2:
     EXPO_PUBLIC_API_URL=http://172.20.10.2:5000/api
     ```

3. Restart the Expo development server after changing the `.env` file.

**Note:** The API client is also configured with a fallback to use `http://172.20.10.2:5000/api` for Android devices, which should work for both emulator and physical device. You can override this by setting `EXPO_PUBLIC_API_URL`.

## Backend Setup

1. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

Server should start on `http://localhost:5000`

## Testing with Postman

### 1. Test Google Sign-In (Firebase Login)

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/firebase-login`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "idToken": "your_firebase_id_token_from_client"
  }
  ```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "671...",
    "firebaseUid": "firebase_uid_here",
    "email": "user@example.com",
    "fullName": "User Name",
    "avatarUrl": "https://...",
    "phoneNumber": null,
    "walletPoints": 0,
    "role": "student",
    "status": "active",
    "createdAt": "2026-10-28T...",
    "updatedAt": "2026-10-28T..."
  }
}
```

**Save the token** for subsequent requests.

### 2. Test Get Profile

**Request:**
- Method: `GET`
- URL: `http://localhost:5000/api/profile/me`
- Headers:
  ```
  Authorization: Bearer <token_from_step_1>
  ```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "671...",
    "firebaseUid": "firebase_uid_here",
    "email": "user@example.com",
    "fullName": "User Name",
    "avatarUrl": "https://...",
    "phoneNumber": null,
    "walletPoints": 0,
    "role": "student",
    "status": "active",
    "createdAt": "2026-10-28T...",
    "updatedAt": "2026-10-28T..."
  }
}
```

### 3. Test Update Profile

**Request:**
- Method: `PUT`
- URL: `http://localhost:5000/api/profile/me`
- Headers:
  ```
  Authorization: Bearer <token_from_step_1>
  Content-Type: application/json
  ```
- Body (raw JSON):
  ```json
  {
    "fullName": "Updated Name",
    "phoneNumber": "+1234567890",
    "avatarUrl": "https://ui-avatars.com/api/?background=random&name=Updated"
  }
  ```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "671...",
    "firebaseUid": "firebase_uid_here",
    "email": "user@example.com",
    "fullName": "Updated Name",
    "avatarUrl": "https://ui-avatars.com/api/?background=random&name=Updated",
    "phoneNumber": "+1234567890",
    "walletPoints": 0,
    "role": "student",
    "status": "active",
    "createdAt": "2026-10-28T...",
    "updatedAt": "2026-10-28T..."
  },
  "message": "Profile updated successfully"
}
```

### 4. Test Local Registration

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "email": "localuser@example.com",
    "password": "password123",
    "fullName": "Local User",
    "phoneNumber": "+9876543210"
  }
  ```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "671...",
    "email": "localuser@example.com",
    "fullName": "Local User",
    "avatarUrl": "https://ui-avatars.com/api/?background=random&name=Local",
    "phoneNumber": "+9876543210",
    "walletPoints": 0,
    "role": "student",
    "status": "active",
    "createdAt": "2026-10-28T...",
    "updatedAt": "2026-10-28T..."
  }
}
```

### 5. Test Local Login

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "email": "localuser@example.com",
    "password": "password123"
  }
  ```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "671...",
    "email": "localuser@example.com",
    "fullName": "Local User",
    "avatarUrl": "https://ui-avatars.com/api/?background=random&name=Local",
    "phoneNumber": "+9876543210",
    "walletPoints": 0,
    "role": "student",
    "status": "active",
    "createdAt": "2026-10-28T...",
    "updatedAt": "2026-10-28T..."
  }
}
```

### 6. Test Forgot Password

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/forgot-password`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "email": "localuser@example.com"
  }
  ```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP has been generated and sent to your email"
}
```

**Note:** In development, the OTP is returned in the response for testing purposes. In production, it should be sent via email.

### 7. Test Verify OTP

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/verify-otp`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "email": "localuser@example.com",
    "otp": "123456"
  }
  ```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "OTP verified successfully"
}
```

### 8. Test Reset Password

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/reset-password`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "email": "localuser@example.com",
    "newPassword": "newpassword123"
  }
  ```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

## Testing with cURL

### Firebase Login
```bash
curl -X POST http://localhost:5000/api/auth/firebase-login \
  -H "Content-Type: application/json" \
  -d '{"idToken":"your_firebase_id_token"}'
```

### Get Profile
```bash
curl -X GET http://localhost:5000/api/profile/me \
  -H "Authorization: Bearer <your_jwt_token>"
```

### Update Profile
```bash
curl -X PUT http://localhost:5000/api/profile/me \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Updated Name","phoneNumber":"+1234567890"}'
```

## Error Scenarios to Test

### 1. Invalid Token
```bash
curl -X GET http://localhost:5000/api/profile/me \
  -H "Authorization: Bearer invalid_token"
```
**Expected:** 403 Forbidden - "Invalid or expired token."

### 2. Missing Token
```bash
curl -X GET http://localhost:5000/api/profile/me
```
**Expected:** 401 Unauthorized - "Access denied. No token provided."

### 3. Invalid Email Format
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"password123","fullName":"Test"}'
```
**Expected:** 400 Bad Request - Validation error

### 4. Duplicate Email
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"existing@example.com","password":"password123","fullName":"Test"}'
```
**Expected:** 409 Conflict - "Email is already registered"

### 5. Invalid Credentials
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"wrongpassword"}'
```
**Expected:** 401 Unauthorized - "Invalid email or password"

## Database Verification

After testing, verify data in MongoDB:

```bash
# Connect to MongoDB
mongosh

# Switch to smartcampus database
use smartcampus

# List all users
db.users.find()

# Find user by email
db.users.findOne({email: "user@example.com"})

# Check indexes
db.users.getIndexes()
```

## Common Issues & Solutions

### 1. MongoDB Connection Failed
**Error:** `Error connecting to MongoDB`
**Solution:** 
- Ensure MongoDB is running locally
- Check MONGODB_URI in .env file
- For MongoDB Atlas, ensure IP whitelist includes your IP

### 2. Firebase Admin Not Initialized
**Error:** `Failed to initialize Firebase Admin SDK`
**Solution:**
- Place `serviceAccountKey.json` in `backend/config/` directory
- OR set FIREBASE_SERVICE_ACCOUNT environment variable

### 3. JWT Verification Failed
**Error:** `Invalid or expired token`
**Solution:**
- Ensure JWT_SECRET is set in .env
- Check token is not expired (default 7 days)
- Verify token format: `Bearer <token>`

### 4. User Not Found
**Error:** `User not found`
**Solution:**
- Check if user exists in database
- Verify email is correct
- For Firebase login, ensure token is valid

## Next Steps

After successful testing:
1. Integrate with frontend application
2. Add rate limiting middleware
3. Implement email service for OTP
4. Add input validation middleware
5. Write unit and integration tests
6. Set up CI/CD pipeline

## Notes

- All passwords are hashed using bcrypt (10 salt rounds)
- Sensitive fields (password, resetOtp, otpExpiresAt) are never returned in API responses
- JWT tokens expire after 7 days (configurable)
- OTP expires after 5 minutes
- Reset tokens expire after 10 minutes
- User model has indexes on email, firebaseUid, status, role, and createdAt
