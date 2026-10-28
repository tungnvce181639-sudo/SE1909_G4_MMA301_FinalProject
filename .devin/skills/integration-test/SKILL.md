# Integration Test Skill

**Agent:** Tester Agent
**Purpose:** Write integration tests for API endpoints and database operations

## When to Use This Skill

Use this skill when you need to:
- Test API endpoints with real database
- Test database operations
- Test service layer with dependencies
- Test authentication flows
- Test external service integrations

## Prerequisites

- Review backend API structure
- Check if Supertest or similar is configured
- Have test database setup
- Review API documentation

## Test Framework Setup

### Supertest for API Testing

**File:** `backend/package.json`

```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "mongodb-memory-server": "^8.0.0"
  }
}
```

### Test Database Setup

**File:** `backend/__tests__/setup.js`

```javascript
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

## Testing API Endpoints

### Basic Endpoint Test

```javascript
const request = require('supertest');
const app = require('../server');

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      })
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe('test@example.com');
  });

  it('should return 400 for missing email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        password: 'password123',
        fullName: 'Test User',
      })
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
  });
});
```

### Authentication Test

```javascript
describe('Authentication', () => {
  let authToken;

  beforeEach(async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = response.body.token;
  });

  describe('GET /api/profile/me', () => {
    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/profile/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('email');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/profile/me')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 403 with invalid token', async () => {
      const response = await request(app)
        .get('/api/profile/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
```

### CRUD Operations Test

```javascript
describe('Products API', () => {
  let authToken;
  let productId;

  beforeEach(async () => {
    // Login and get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    authToken = loginResponse.body.token;
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const productData = {
        title: 'Test Product',
        description: 'Test description',
        price: 100,
        category: 'electronics',
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('_id');
      productId = response.body.data._id;
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          title: 'Test Product',
          price: 100,
        })
        .expect(401);
    });
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=electronics')
        .expect(200);

      expect(response.body.data.every(p => p.category === 'electronics')).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return product by ID', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(response.body.data._id).toBe(productId);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
        })
        .expect(200);

      expect(response.body.data.title).toBe('Updated Title');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete product', async () => {
      await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const response = await request(app)
        .get(`/api/products/${productId}`)
        .expect(404);
    });
  });
});
```

## Testing Database Operations

### Repository Test

```javascript
const UserRepository = require('../repositories/user.repository');
const User = require('../models/user.model');

describe('UserRepository', () => {
  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword',
        fullName: 'Test User',
      };

      const user = await UserRepository.create(userData);

      expect(user).toHaveProperty('_id');
      expect(user.email).toBe(userData.email);
      expect(user.fullName).toBe(userData.fullName);
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      await UserRepository.create(userData);

      await expect(UserRepository.create(userData)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const user = await UserRepository.create({
        email: 'test@example.com',
        password: 'hashedPassword',
      });

      const found = await UserRepository.findById(user._id);

      expect(found).not.toBeNull();
      expect(found._id).toEqual(user._id);
    });

    it('should return null for non-existent user', async () => {
      const found = await UserRepository.findById('507f1f77bcf86cd799439011');
      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const email = 'test@example.com';
      await UserRepository.create({
        email,
        password: 'hashedPassword',
      });

      const found = await UserRepository.findByEmail(email);

      expect(found).not.toBeNull();
      expect(found.email).toBe(email);
    });
  });
});
```

## Testing Service Layer

### Service Test with Mocked Repository

```javascript
const UserService = require('../services/user.service');
const UserRepository = require('../repositories/user.repository');

jest.mock('../repositories/user.repository');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      };

      UserRepository.findByEmail.mockResolvedValue(null);
      UserRepository.create.mockResolvedValue({
        _id: '123',
        ...userData,
        password: 'hashedPassword',
      });

      const result = await UserService.register(userData);

      expect(UserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(UserRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('_id');
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      };

      UserRepository.findByEmail.mockResolvedValue({
        email: 'test@example.com',
      });

      await expect(UserService.register(userData)).rejects.toThrow(
        'Email already exists'
      );
    });
  });
});
```

## Testing External Services

### Firebase Integration Test

```javascript
const firebaseAdmin = require('firebase-admin');

describe('Firebase Integration', () => {
  describe('verifyIdToken', () => {
    it('should verify valid Firebase token', async () => {
      const mockToken = 'valid-token';
      const mockDecoded = { uid: '123', email: 'test@example.com' };

      firebaseAdmin.auth().verifyIdToken.mockResolvedValue(mockDecoded);

      const result = await verifyFirebaseToken(mockToken);

      expect(result).toEqual(mockDecoded);
      expect(firebaseAdmin.auth().verifyIdToken).toHaveBeenCalledWith(mockToken);
    });

    it('should throw error for invalid token', async () => {
      const mockToken = 'invalid-token';

      firebaseAdmin.auth().verifyIdToken.mockRejectedValue(
        new Error('Invalid token')
      );

      await expect(verifyFirebaseToken(mockToken)).rejects.toThrow(
        'Invalid token'
      );
    });
  });
});
```

## Testing File Upload

### Multipart Form Data Test

```javascript
describe('File Upload', () => {
  it('should upload image successfully', async () => {
    const response = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('image', 'test/fixtures/test-image.jpg')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('url');
  });

  it('should reject non-image files', async () => {
    const response = await request(app)
      .post('/api/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('image', 'test/fixtures/test-file.txt')
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
  });
});
```

## Test Data Fixtures

### Create Test Data Helper

```javascript
// __tests__/helpers/createUser.js
const bcrypt = require('bcryptjs');
const UserRepository = require('../../repositories/user.repository');

const createTestUser = async (overrides = {}) => {
  const defaultData = {
    email: 'test@example.com',
    password: await bcrypt.hash('password123', 10),
    fullName: 'Test User',
  };

  return await UserRepository.create({ ...defaultData, ...overrides });
};

module.exports = { createTestUser };
```

### Use Fixtures in Tests

```javascript
const { createTestUser } = require('../helpers/createUser');

describe('User Tests', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  it('should work with test user', async () => {
    expect(testUser.email).toBe('test@example.com');
  });
});
```

## Best Practices

### 1. Isolate Tests
```javascript
beforeEach(async () => {
  // Clean database before each test
  await User.deleteMany({});
});
```

### 2. Use Descriptive Test Names
```javascript
it('should return 401 when token is expired');
it('should create product with valid data');
```

### 3. Test Edge Cases
```javascript
it('should handle empty input');
it('should handle very long strings');
it('should handle special characters');
```

### 4. Test Error Scenarios
```javascript
it('should return 500 when database fails');
it('should return 400 for invalid input');
```

### 5. Use Async/Await
```javascript
it('should work', async () => {
  const result = await someAsyncOperation();
  expect(result).toBe(expected);
});
```

## Running Tests

```bash
# Run all integration tests
npm test -- --testPathPattern=integration

# Run specific test file
npm test -- backend/__tests__/integration/auth.test.js

# Run with coverage
npm test -- --coverage --testPathPattern=integration
```

## After Writing Tests

1. Run all integration tests
2. Check coverage report
3. Fix any failing tests
4. Document test scenarios
5. Notify Backend Agent if tests reveal bugs

## Example

### Task: Write Integration Tests for Product API

**Implementation:**

```javascript
const request = require('supertest');
const app = require('../../server');
const { createTestUser } = require('../helpers/createUser');

describe('Product API Integration Tests', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    testUser = await createTestUser();

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.token;
  });

  describe('POST /api/products', () => {
    it('should create product with valid data', async () => {
      const productData = {
        title: 'iPhone 13',
        description: 'Like new condition',
        price: 15000000,
        category: 'electronics',
        condition: 'like-new',
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(productData.title);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({ title: 'Test' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/products', () => {
    it('should return paginated results', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
```
