# Backend API Skill

**Agent:** Backend Agent
**Purpose:** Create REST API endpoints following 5-layer architecture

## When to Use This Skill

Use this skill when you need to:
- Create new API endpoints
- Modify existing endpoints
- Add authentication/authorization
- Implement error handling middleware
- Set up API documentation

## Architecture Overview

The backend follows a 5-layer architecture:

```
┌─────────────────┐
│   Routes Layer  │  ← Define endpoints, HTTP methods
├─────────────────┤
│ Controllers     │  ← Request handling, validation
├─────────────────┤
│ Services        │  ← Business logic
├─────────────────┤
│ Repositories    │  ← Data access (MongoDB/Firebase)
├─────────────────┤
│ Models          │  ← Data schemas, validation
└─────────────────┘
```

## Prerequisites

- Review existing code in `backend/src/`
- Check `backend/config/db.js` for database connection
- Review `backend/middlewares/authMiddleware.js` for auth patterns
- Check `backend/package.json` for available dependencies

## Implementation Steps

### 1. Define the API Endpoint

**Route File:** `backend/src/routes/<resource>.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controllers/<resource>.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.post('/login', controller.login);
router.post('/register', controller.register);

// Protected routes
router.get('/', authMiddleware, controller.getAll);
router.get('/:id', authMiddleware, controller.getById);
router.post('/', authMiddleware, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);

module.exports = router;
```

### 2. Create Controller

**Controller File:** `backend/src/controllers/<resource>.controller.js`

```javascript
const service = require('../services/<resource>.service');

exports.getAll = async (req, res) => {
  try {
    const data = await service.getAll(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await service.getById(id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ... other controller methods
```

### 3. Create Service

**Service File:** `backend/src/services/<resource>.service.js`

```javascript
const repository = require('../repositories/<resource>.repository');

exports.getAll = async (filters = {}) => {
  return await repository.findAll(filters);
};

exports.getById = async (id) => {
  return await repository.findById(id);
};

exports.create = async (data) => {
  // Business logic here
  return await repository.create(data);
};

// ... other service methods
```

### 4. Create Repository

**Repository File:** `backend/src/repositories/<resource>.repository.js`

```javascript
const Model = require('../models/<resource>.model');

exports.findAll = async (filters = {}) => {
  return await Model.find(filters);
};

exports.findById = async (id) => {
  return await Model.findById(id);
};

exports.create = async (data) => {
  const instance = new Model(data);
  return await instance.save();
};

// ... other repository methods
```

### 5. Create Model

**Model File:** `backend/src/models/<resource>.model.js`

```javascript
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  // Define fields
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('<Resource>', schema);
```

### 6. Register Route

**In:** `backend/server.js`

```javascript
const <resource>Routes = require('./src/routes/<resource>.routes');
app.use('/api/<resource>', <resource>Routes);
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info"
}
```

## Authentication Patterns

### Public Routes
No middleware required.

### Protected Routes
```javascript
router.get('/protected', authMiddleware, controller.method);
```

Access user data via `req.user`:
```javascript
exports.method = async (req, res) => {
  const userId = req.user.id;
  // ...
};
```

## Error Handling

Always wrap controller methods in try-catch:
```javascript
exports.method = async (req, res) => {
  try {
    // Logic
  } catch (error) {
    console.error('[Controller] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};
```

## Validation

Use validation in controllers before calling services:
```javascript
exports.create = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    const data = await service.create({ name, email });
    res.json({ success: true, data });
  } catch (error) {
    // ...
  }
};
```

## After Implementation

1. Test endpoints with Postman/curl
2. Document endpoints in `backend/API_DOCUMENTATION.md`
3. Update `backend/.env.example` if new env vars needed
4. Notify Frontend Agent that API is ready

## Example

### Task: Create User Profile API

**Steps:**
1. Create `backend/src/routes/profile.routes.js`
2. Create `backend/src/controllers/profile.controller.js`
3. Create `backend/src/services/profile.service.js`
4. Create `backend/src/repositories/profile.repository.js`
5. Create `backend/src/models/profile.model.js`
6. Register route in `backend/server.js`

**Endpoints:**
- GET /api/profile/me - Get current user profile
- PUT /api/profile/me - Update current user profile
- GET /api/profile/:userId - Get user profile by ID (public)
