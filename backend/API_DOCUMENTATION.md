# SmartCampus Market - API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api`  
**Last Updated:** 2026-10-28

---

## Table of Contents

- [Authentication](#authentication)
- [Profile](#profile)
- [Error Responses](#error-responses)
- [Data Models](#data-models)

---

## Authentication

### POST /auth/firebase-login

Verify Firebase ID token and return user data with JWT session token.

**Endpoint:** `POST /api/auth/firebase-login`  
**Authentication:** Not required

**Request Body:**
```json
{
  "idToken": "string (Firebase ID token from client)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "string (JWT session token)",
  "user": {
    "_id": "string",
    "firebaseUid": "string",
    "email": "string",
    "fullName": "string",
    "avatarUrl": "string",
    "phoneNumber": "string or null",
    "walletPoints": "number",
    "role": "student",
    "status": "active",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid token or missing email
- `403 Forbidden`: Account is banned
- `500 Internal Server Error`: Firebase verification error

**Notes:**
- If user doesn't exist, creates a new user profile automatically
- Links Firebase UID to existing user if email matches
- Returns JWT token for subsequent authenticated requests

---

### POST /auth/google

Alias for Firebase login (Google Sign-in).

**Endpoint:** `POST /api/auth/google`  
**Authentication:** Not required

**Request Body:** Same as `/auth/firebase-login`

**Response:** Same as `/auth/firebase-login`

---

### POST /auth/register

Register a new user with email and password (local authentication).

**Endpoint:** `POST /api/auth/register`  
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required, min 6 characters)",
  "fullName": "string (required)",
  "phoneNumber": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "token": "string (JWT session token)",
  "user": {
    "_id": "string",
    "email": "string",
    "fullName": "string",
    "avatarUrl": "string",
    "phoneNumber": "string or null",
    "walletPoints": 0,
    "role": "student",
    "status": "active",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid email format
- `409 Conflict`: Email already registered

---

### POST /auth/login

Login with email and password (local authentication).

**Endpoint:** `POST /api/auth/login`  
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "string (JWT session token)",
  "user": {
    "_id": "string",
    "email": "string",
    "fullName": "string",
    "avatarUrl": "string",
    "phoneNumber": "string or null",
    "walletPoints": "number",
    "role": "student",
    "status": "active",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid email or password
- `403 Forbidden`: Account is banned or uses Google Sign-in

---

### POST /auth/forgot-password

Request OTP for password reset.

**Endpoint:** `POST /api/auth/forgot-password`  
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP has been generated and sent to your email"
}
```

**Error Responses:**
- `400 Bad Request`: Missing email
- `404 Not Found`: User not found

**Notes:**
- OTP is valid for 5 minutes
- In production, OTP should be sent via email service
- Currently returns OTP in response for testing purposes

---

### POST /auth/verify-otp

Verify password reset OTP and get reset token.

**Endpoint:** `POST /api/auth/verify-otp`  
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required)",
  "otp": "string (required, 6 digits)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "resetToken": "string (short-lived JWT token)",
  "message": "OTP verified successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Missing email or OTP
- `401 Unauthorized`: Invalid OTP
- `403 Forbidden`: OTP expired

**Notes:**
- Reset token is valid for 10 minutes
- Use reset token in `/auth/reset-password` endpoint

---

### POST /auth/reset-password

Reset password with new password.

**Endpoint:** `POST /api/auth/reset-password`  
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string (required)",
  "newPassword": "string (required, min 6 characters)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Missing email or password, or password too short
- `404 Not Found`: User not found

**Notes:**
- Updates password in MongoDB
- Synchronizes with Firebase Auth if user exists there

---

### GET /auth/me

Get current authenticated user (legacy endpoint, use `/profile/me` instead).

**Endpoint:** `GET /api/auth/me`  
**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <JWT token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "string",
    "email": "string",
    "fullName": "string",
    "avatarUrl": "string",
    "phoneNumber": "string or null",
    "walletPoints": "number",
    "role": "student",
    "status": "active",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: No token provided
- `403 Forbidden`: Invalid or expired token
- `404 Not Found`: User not found

---

## Profile

### GET /profile/me

Get current user profile.

**Endpoint:** `GET /api/profile/me`  
**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <JWT token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "string",
    "firebaseUid": "string or null",
    "email": "string",
    "fullName": "string",
    "avatarUrl": "string",
    "phoneNumber": "string or null",
    "walletPoints": "number",
    "role": "student",
    "status": "active",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: No token provided
- `403 Forbidden`: Invalid or expired token
- `404 Not Found`: User not found

---

### PUT /profile/me

Update current user profile.

**Endpoint:** `PUT /api/profile/me`  
**Authentication:** Required (Bearer token)

**Headers:**
```
Authorization: Bearer <JWT token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "string (optional)",
  "phoneNumber": "string (optional)",
  "avatarUrl": "string (optional)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "string",
    "firebaseUid": "string or null",
    "email": "string",
    "fullName": "string",
    "avatarUrl": "string",
    "phoneNumber": "string or null",
    "walletPoints": "number",
    "role": "student",
    "status": "active",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  },
  "message": "Profile updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`: No valid fields to update
- `401 Unauthorized`: No token provided
- `403 Forbidden`: Invalid or expired token
- `404 Not Found`: User not found

**Notes:**
- Only `fullName`, `phoneNumber`, and `avatarUrl` can be updated
- Email cannot be changed through this endpoint
- At least one field must be provided

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Error description"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Invalid or expired token."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Data Models

### User Model

```javascript
{
  _id: ObjectId,
  firebaseUid: String (optional, unique),
  email: String (required, unique),
  password: String (optional, hashed),
  fullName: String (required),
  avatarUrl: String (default: "https://ui-avatars.com/api/?background=random&name=User"),
  phoneNumber: String (optional),
  walletPoints: Number (default: 0, min: 0),
  role: String (enum: ["student", "admin"], default: "student"),
  status: String (enum: ["active", "banned"], default: "active"),
  resetOtp: String (optional),
  otpExpiresAt: Date (optional),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

**Indexes:**
- `email` (unique)
- `firebaseUid` (unique, sparse)
- `status`
- `role`
- `createdAt` (descending)

**Sensitive Fields (never returned in API responses):**
- `password`
- `resetOtp`
- `otpExpiresAt`
- `__v`

---

## Authentication Flow

### Google Sign-In Flow

1. Client authenticates with Firebase on the device
2. Client receives Firebase ID token
3. Client sends ID token to `POST /api/auth/firebase-login`
4. Backend verifies token with Firebase Admin SDK
5. Backend creates/updates user in MongoDB
6. Backend generates JWT session token
7. Client stores JWT token for subsequent requests
8. Client includes JWT token in `Authorization: Bearer <token>` header

### Local Authentication Flow

1. Client registers with `POST /api/auth/register`
2. Backend creates user with hashed password
3. Backend generates JWT session token
4. Client stores JWT token for subsequent requests
5. Client includes JWT token in `Authorization: Bearer <token>` header

### Password Reset Flow

1. Client requests OTP with `POST /api/auth/forgot-password`
2. Backend generates 6-digit OTP (valid for 5 minutes)
3. Backend sends OTP via email (production)
4. Client verifies OTP with `POST /api/auth/verify-otp`
5. Backend returns reset token (valid for 10 minutes)
6. Client resets password with `POST /api/auth/reset-password`
7. Backend updates password in MongoDB and Firebase Auth

---

## Testing with Postman

### Example: Google Sign-In

1. **Request:**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/firebase-login`
   - Body (raw JSON):
     ```json
     {
       "idToken": "your_firebase_id_token_here"
     }
     ```

2. **Response:**
   - Copy the `token` from response
   - Use it in Authorization header for protected routes

### Example: Get Profile

1. **Request:**
   - Method: GET
   - URL: `http://localhost:5000/api/profile/me`
   - Headers:
     ```
     Authorization: Bearer <your_jwt_token>
     ```

2. **Response:**
   - Returns current user profile data

### Example: Update Profile

1. **Request:**
   - Method: PUT
   - URL: `http://localhost:5000/api/profile/me`
   - Headers:
     ```
     Authorization: Bearer <your_jwt_token>
     Content-Type: application/json
     ```
   - Body (raw JSON):
     ```json
     {
       "fullName": "John Doe",
       "phoneNumber": "+1234567890"
     }
     ```

2. **Response:**
   - Returns updated user profile

---

## Environment Variables

Required environment variables in `.env` file:

```env
# Server
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/smartcampus

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
# OR place serviceAccountKey.json in config/ directory

# Firebase Client (for reference)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

---

## Rate Limiting & Security

- JWT tokens expire after 7 days (configurable via `JWT_EXPIRES_IN`)
- Password reset tokens expire after 10 minutes
- OTP expires after 5 minutes
- All passwords are hashed using bcrypt (10 salt rounds)
- Sensitive fields are automatically removed from user responses
- Banned users cannot access protected endpoints

---

## Future Endpoints

The following endpoints are planned for future milestones:

### Products (Milestone 2)
- `GET /products` - List all products with filters
- `POST /products` - Create new product
- `GET /products/:id` - Get product details
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `POST /products/:id/images` - Upload product images

### Orders (Milestone 3)
- `GET /orders` - List user's orders
- `POST /orders` - Create new order
- `GET /orders/:id` - Get order details
- `PUT /orders/:id/status` - Update order status
- `GET /orders/seller` - List seller's orders

### AI (Milestone 4)
- `POST /ai/estimate` - Get AI price estimation
- `POST /ai/chat` - Chat with AI assistant

### Notifications (Milestone 3)
- `GET /notifications` - List user notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `DELETE /notifications/:id` - Delete notification

#### Expo Push

These endpoints require a JWT bearer token:
- `POST /notifications/device-token` with `{ "token": "ExponentPushToken[...]" }` registers the signed-in user's Expo push token.
- `DELETE /notifications/device-token` removes the signed-in user's registered push token.
- `PUT /notifications/preferences` with `{ "sound": true|false }` updates the signed-in user's push sound preference.
- `POST /notifications/order-event` with `{ "orderId": "Firestore order document ID", "event": "created|approved|completed|cancelled" }` sends an update to the other order participant.

The backend verifies the caller's participation and the current order status in Firestore before sending. Configure Firebase Admin credentials on the backend, link the Expo app to an EAS project with `npx eas-cli init`, and install a development or release build on a physical device to enable remote push. Expo Go supports only the local notifications in this flow.

---

## Support

For issues or questions, please contact the development team or refer to the project documentation in `.devin/` directory.
