import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔐 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC_ezKwBVXhI6YAvxbbxV03DSrs9EzBJ9g",
  authDomain: "dev-mobile-2a538.firebaseapp.com",
  projectId: "dev-mobile-2a538",
  storageBucket: "dev-mobile-2a538.appspot.com",
  messagingSenderId: "434118427268",
  appId: "1:434118427268:web:295a0dd5e8d929a50838d1",
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth WITH persistence (🔥 FIX MOBILE)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
