import { initializeApp } from 'firebase/app';
import {
  getReactNativePersistence,
  GoogleAuthProvider,
  initializeAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDoMBd4FWfXK1E6yEHGHk0RO4WNmaVL8Ag",
  authDomain: "smartcampus-market.firebaseapp.com",
  projectId: "smartcampus-market",
  storageBucket: "smartcampus-market.firebasestorage.app",
  messagingSenderId: "225538325402",
  appId: "1:225538325402:web:999dcf1a8863b897eb9823",
  measurementId: "G-2KK5ZY0GJQ"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export const USERS_COLLECTION = 'users';

export const googleProvider = new GoogleAuthProvider();

export { app };
