# Firebase Integration Skill

**Agent:** Backend Agent
**Purpose:** Integrate Firebase Admin SDK with Node.js backend

## When to Use This Skill

Use this skill when you need to:
- Authenticate users with Firebase tokens
- Access Firestore from backend
- Send Firebase Cloud Messages (FCM)
- Use Firebase Storage
- Verify Firebase ID tokens

## Prerequisites

- Review `backend/config/firebaseAdmin.js` for existing Firebase setup
- Check `backend/.env` for Firebase credentials
- Have Firebase project credentials ready

## Firebase Admin Setup

### Initialization

**File:** `backend/config/firebaseAdmin.js`

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

const auth = admin.auth();
const db = admin.firestore();
const storage = admin.storage();

module.exports = { admin, auth, db, storage };
```

### Environment Variables

**File:** `backend/.env`

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

## Authentication Integration

### Verify Firebase ID Token

```javascript
const { auth } = require('../config/firebaseAdmin');

async function verifyFirebaseToken(idToken) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    throw new Error('Invalid Firebase token');
  }
}
```

### Get User by UID

```javascript
async function getUserByUID(uid) {
  try {
    const userRecord = await auth.getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}
```

### Create User in Firebase Auth

```javascript
async function createFirebaseUser(email, password, displayName) {
  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName
    });
    return userRecord;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
```

## Firestore Integration

### Add Document

```javascript
const { db } = require('../config/firebaseAdmin');

async function addDocument(collection, data) {
  try {
    const docRef = await db.collection(collection).add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}
```

### Get Document

```javascript
async function getDocument(collection, docId) {
  try {
    const doc = await db.collection(collection).doc(docId).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}
```

### Update Document

```javascript
async function updateDocument(collection, docId, data) {
  try {
    await db.collection(collection).doc(docId).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}
```

### Query Documents

```javascript
async function queryDocuments(collection, filters = {}) {
  try {
    let query = db.collection(collection);

    // Apply filters
    if (filters.userId) {
      query = query.where('userId', '==', filters.userId);
    }
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.orderBy) {
      query = query.orderBy(filters.orderBy, filters.order || 'desc');
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error querying documents:', error);
    throw error;
  }
}
```

### Delete Document

```javascript
async function deleteDocument(collection, docId) {
  try {
    await db.collection(collection).doc(docId).delete();
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}
```

## Cloud Messaging (FCM)

### Send Notification to Device

```javascript
const { admin } = require('../config/firebaseAdmin');

async function sendNotification(deviceToken, notification, data = {}) {
  try {
    const message = {
      token: deviceToken,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: data
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
```

### Send Multicast Notification

```javascript
async function sendMulticastNotification(deviceTokens, notification, data = {}) {
  try {
    const message = {
      tokens: deviceTokens,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: data
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log('Multicast notification sent:', response);
    return response;
  } catch (error) {
    console.error('Error sending multicast notification:', error);
    throw error;
  }
}
```

### Subscribe to Topic

```javascript
async function subscribeToTopic(deviceTokens, topic) {
  try {
    const response = await admin.messaging().subscribeToTopic(deviceTokens, topic);
    console.log('Subscribed to topic:', response);
    return response;
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    throw error;
  }
}
```

## Storage Integration

### Upload File

```javascript
const { storage } = require('../config/firebaseAdmin');
const path = require('path');

async function uploadFile(bucketName, filePath, destination) {
  try {
    const bucket = storage.bucket(bucketName);
    await bucket.upload(filePath, {
      destination: destination,
      metadata: {
        contentType: 'image/jpeg'
      }
    });

    const file = bucket.file(destination);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500'
    });

    return url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}
```

### Delete File

```javascript
async function deleteFile(bucketName, filePath) {
  try {
    const bucket = storage.bucket(bucketName);
    await bucket.file(filePath).delete();
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}
```

## Best Practices

### 1. Error Handling
Always wrap Firebase operations in try-catch:
```javascript
try {
  // Firebase operation
} catch (error) {
  console.error('[Firebase] Error:', error);
  throw new Error('Operation failed');
}
```

### 2. Timestamps
Use server timestamps for consistency:
```javascript
createdAt: admin.firestore.FieldValue.serverTimestamp()
```

### 3. Batch Operations
For multiple writes, use batch:
```javascript
const batch = db.batch();
batch.set(docRef1, data1);
batch.set(docRef2, data2);
await batch.commit();
```

### 4. Transactions
For atomic operations, use transactions:
```javascript
const transaction = db.runTransaction(async (t) => {
  const doc = await t.get(docRef);
  // Modify and update
  t.update(docRef, newData);
});
```

## Example

### Task: Firebase Auth Login Endpoint

**Implementation:**

```javascript
const { auth } = require('../config/firebaseAdmin');

exports.firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required'
      });
    }

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get user from Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    let userData;

    if (userDoc.exists) {
      userData = { id: userDoc.id, ...userDoc.data() };
    } else {
      // Create new user document
      userData = {
        uid,
        email: decodedToken.email,
        fullName: decodedToken.name || 'User',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await db.collection('users').doc(uid).set(userData);
    }

    // Generate JWT for backend
    const token = jwt.sign(
      { uid: userData.uid, email: userData.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    console.error('[Auth] Firebase login error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};
```

## After Integration

1. Test Firebase operations thoroughly
2. Document Firebase endpoints in `backend/API_DOCUMENTATION.md`
3. Add error handling for Firebase-specific errors
4. Notify Frontend Agent about Firebase endpoints available
