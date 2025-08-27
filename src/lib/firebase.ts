
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "canteenpass",
  appId: "1:769895391061:web:25f8f40d0c9d0f3096d9dc",
  storageBucket: "canteenpass.firebasestorage.app",
  apiKey: "AIzaSyAQUxgCrQrg3h38jbRY0MpZlgFOChhEesg",
  authDomain: "canteenpass.firebaseapp.com",
  messagingSenderId: "769895391061",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
