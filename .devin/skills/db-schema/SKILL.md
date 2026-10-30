# Database Schema Skill

**Agent:** Backend Agent
**Purpose:** Design and implement database schemas

## When to Use This Skill

Use this skill when you need to:
- Design a new database schema
- Modify existing schema
- Add indexes for performance
- Define relationships between collections
- Set up validation rules

## Prerequisites

- Review existing models in `backend/src/models/`
- Check `backend/config/db.js` for database connection
- Understand MongoDB schema design patterns
- Review Firebase data structure if using Firestore

## MongoDB Schema Design

### Basic Schema Structure

```javascript
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  // Field definitions
  field1: { type: String, required: true },
  field2: { type: Number, default: 0 },
  field3: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CollectionName', schema);
```

### Field Types

```javascript
{
  // String
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },

  // Number
  age: { type: Number, min: 0, max: 120 },
  price: { type: Number, default: 0 },

  // Boolean
  isActive: { type: Boolean, default: true },

  // Date
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // Array
  tags: [String],
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],

  // Object
  metadata: {
    type: Map,
    of: String
  },

  // ObjectId (foreign key)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Enum
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' }
}
```

### Indexes

```javascript
// Single field index
schema.index({ email: 1 });

// Compound index
schema.index({ userId: 1, createdAt: -1 });

// Unique index
schema.index({ email: 1 }, { unique: true });

// Text index for search
schema.index({ name: 'text', description: 'text' });
```

### Virtual Fields

```javascript
schema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});
```

### Pre/Post Hooks

```javascript
// Before save
schema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// After save
schema.post('save', function(doc) {
  console.log('Document saved:', doc._id);
});
```

## Firebase Firestore Schema Design

### Collection Structure

```javascript
// Collection: users
{
  uid: string (primary key),
  email: string,
  fullName: string,
  studentId: string,
  major: string,
  avatarUrl: string,
  walletPoints: number,
  createdAt: timestamp,
  updatedAt: timestamp
}

// Collection: products
{
  id: string (auto-generated),
  userId: string (reference to users),
  title: string,
  description: string,
  price: number,
  category: string,
  condition: string,
  images: array<string>,
  location: {
    latitude: number,
    longitude: number,
    address: string
  },
  status: string (active, sold, pending),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Subcollections

```javascript
// Collection: users/{userId}/orders
{
  id: string,
  productId: string,
  sellerId: string,
  buyerId: string,
  status: string,
  totalPrice: number,
  createdAt: timestamp
}
```

## Schema Design Best Practices

### 1. Normalize vs Denormalize

**Normalize** (for data integrity):
- Use references for one-to-many relationships
- Avoid data duplication
- Better for data that changes frequently

**Denormalize** (for read performance):
- Embed data for one-to-few relationships
- Duplicate data for faster reads
- Better for read-heavy applications

### 2. Indexing Strategy

- Index all fields used in queries
- Create compound indexes for multi-field queries
- Use unique indexes for unique constraints
- Consider write performance vs read performance

### 3. Validation

```javascript
// Custom validation
schema.path('email').validate(function(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}, 'Invalid email format');

// Async validation
schema.path('email').validate(async function(email) {
  const user = await mongoose.model('User').findOne({ email });
  return !user;
}, 'Email already exists');
```

### 4. Timestamps

Always include createdAt and updatedAt:
```javascript
{
  createdAt: { type: Date, default: Date.now, immutable: true },
  updatedAt: { type: Date, default: Date.now }
}

schema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
```

## Output Format

After designing schema, provide:

### 1. Schema Definition
```javascript
// Full schema code
```

### 2. Field Documentation
```markdown
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| name | String | Yes | - | User's full name |
| email | String | Yes | - | User's email address |
```

### 3. Relationships
```markdown
- User → Products (one-to-many)
- Product → Orders (one-to-many)
- User → Orders (one-to-many)
```

### 4. Indexes
```markdown
- Index on email (unique)
- Compound index on userId + createdAt
```

### 5. Validation Rules
```markdown
- Email must be valid format
- Password must be at least 6 characters
- Age must be between 0-120
```

## Example

### Task: Design Product Schema

**Requirements:**
- Products belong to users
- Products have category, price, condition
- Products can have multiple images
- Products have location data
- Products have status (active, sold, pending)

**Schema:**

```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'books', 'clothing', 'furniture', 'other']
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'like-new', 'good', 'fair', 'poor']
  },
  images: [{
    type: String,
    trim: true
  }],
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'pending', 'removed'],
    default: 'active',
    index: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
productSchema.index({ userId: 1, createdAt: -1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ location: '2dsphere' });

// Pre-save hook
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
```

## After Schema Design

1. Save schema file in `backend/src/models/`
2. Document schema in `backend/SCHEMA_DOCUMENTATION.md`
3. Create migration script if needed
4. Notify Backend Agent to implement repository layer
