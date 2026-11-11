import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  GoogleAuthProvider,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration from environment variables or project defaults
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDoMBd4FWfXK1E6yEHGHk0RO4WNmaVL8Ag',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'smartcampus-market.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'smartcampus-market',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'smartcampus-market.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '225538325402',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:225538325402:web:999dcf1a8863b897eb9823',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-2KK5ZY0GJQ',
};

// Prevent duplicate initialization on fast reload / hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with React Native AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // If initializeAuth was already called, retrieve existing instance
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Provider and collection constants
export const googleProvider = new GoogleAuthProvider();
export const USERS_COLLECTION = 'users';

export { app, auth, db };
export default app;

