# Firebase Client Integration Skill

**Agent:** Frontend Agent
**Purpose:** Integrate Firebase Client SDK with React Native frontend

## When to Use This Skill

Use this skill when you need to:
- Configure Firebase in the frontend
- Use Firebase Authentication
- Access Firestore from client
- Use Firebase Cloud Messaging
- Use Firebase Storage
- Handle Firebase real-time updates

## Prerequisites

- Review `frontend/src/config/firebaseConfig.js` for existing Firebase setup
- Check Firebase project console for credentials
- Review existing Firebase usage in codebase

## Firebase Configuration

### Setup

**File:** `frontend/src/config/firebaseConfig.js`

```javascript
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  GoogleAuthProvider,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
export default app;
```

### Environment Variables

**File:** `.env`

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Authentication

### Email/Password Authentication

```javascript
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

// Sign in
const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Register
const registerWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Sign out
const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Listen to auth state changes
const unsubscribe = onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user.uid);
  } else {
    console.log('User is signed out');
  }
});
```

### Google Sign-In

```javascript
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import * as GoogleSignIn from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
GoogleSignIn.configure({
  webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
});

const signInWithGoogle = async () => {
  try {
    await GoogleSignIn.hasPlayServices();
    const result = await GoogleSignIn.signIn();
    const googleIdToken = result.data?.idToken;

    const credential = GoogleAuthProvider.credential(googleIdToken);
    const userCredential = await signInWithCredential(auth, credential);

    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};
```

### Update User Profile

```javascript
import { updateProfile } from 'firebase/auth';

const updateUserProfile = async (displayName, photoURL) => {
  try {
    await updateProfile(auth.currentUser, {
      displayName,
      photoURL,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};
```

## Firestore

### Add Document

```javascript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw new Error(error.message);
  }
};
```

### Get Document

```javascript
import { doc, getDoc } from 'firebase/firestore';

const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    throw new Error(error.message);
  }
};
```

### Update Document

```javascript
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};
```

### Delete Document

```javascript
import { doc, deleteDoc } from 'firebase/firestore';

const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};
```

### Query Documents

```javascript
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';

const queryDocuments = async (collectionName, filters = {}) => {
  try {
    let q = collection(db, collectionName);

    // Apply filters
    const conditions = [];
    if (filters.userId) {
      conditions.push(where('userId', '==', filters.userId));
    }
    if (filters.status) {
      conditions.push(where('status', '==', filters.status));
    }
    if (filters.orderBy) {
      conditions.push(orderBy(filters.orderBy, filters.order || 'desc'));
    }
    if (filters.limit) {
      conditions.push(limit(filters.limit));
    }

    if (conditions.length > 0) {
      q = query(q, ...conditions);
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(error.message);
  }
};
```

### Real-time Updates

```javascript
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
} from 'firebase/firestore';

// Listen to single document
const listenToDocument = (collectionName, docId, callback) => {
  const docRef = doc(db, collectionName, docId);
  const unsubscribe = onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });

  return unsubscribe;
};

// Listen to query
const listenToQuery = (collectionName, filters, callback) => {
  const q = query(collection(db, collectionName), where('userId', '==', filters.userId));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });

  return unsubscribe;
};

// Usage in component
useEffect(() => {
  const unsubscribe = listenToDocument('users', userId, (data) => {
    setUser(data);
  });

  return () => unsubscribe();
}, [userId]);
```

### Batch Operations

```javascript
import { writeBatch, getDocs, collection } from 'firebase/firestore';

const batchUpdate = async (updates) => {
  try {
    const batch = writeBatch(db);

    updates.forEach(({ collectionName, docId, data }) => {
      const docRef = doc(db, collectionName, docId);
      batch.update(docRef, data);
    });

    await batch.commit();
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};
```

## Cloud Messaging

### Request Permission

```javascript
import { messaging, requestPermission } from 'firebase/messaging';

const requestNotificationPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    }
  } catch (error) {
    console.error('Permission error:', error);
  }
};
```

### Listen to Messages

```javascript
import { messaging } from 'firebase/messaging';

useEffect(() => {
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    Alert.alert('New Message', remoteMessage.notification.body);
  });

  return unsubscribe;
}, []);
```

## Storage

### Upload File

```javascript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebaseConfig';

const uploadFile = async (uri, path) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    throw new Error(error.message);
  }
};
```

### Delete File

```javascript
import { ref, deleteObject } from 'firebase/storage';

const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};
```

## Integration with Context

### Auth Context

```javascript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

## Best Practices

### 1. Always Handle Errors
```javascript
try {
  await firebaseOperation();
} catch (error) {
  console.error('[Firebase] Error:', error);
  Alert.alert('Error', error.message);
}
```

### 2. Use Server Timestamps
```javascript
import { serverTimestamp } from 'firebase/firestore';

createdAt: serverTimestamp()
```

### 3. Clean Up Listeners
```javascript
useEffect(() => {
  const unsubscribe = onSnapshot(...);
  return () => unsubscribe();
}, []);
```

### 4. Optimize Queries
```javascript
// Use indexes for complex queries
// Limit results
// Select only needed fields
```

## Example

### Task: Implement User Profile with Firestore

**Implementation:**

```javascript
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Get user profile
const getUserProfile = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update user profile
const updateUserProfile = async (uid, data) => {
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Listen to profile changes
const listenToProfile = (uid, callback) => {
  const docRef = doc(db, 'users', uid);
  const unsubscribe = onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });

  return unsubscribe;
};
```

## After Integration

1. Test Firebase operations
2. Handle offline scenarios
3. Test error cases
4. Update documentation
5. Notify Tester Agent for testing
