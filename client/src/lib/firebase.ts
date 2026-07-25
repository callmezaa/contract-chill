import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAXt_VH-9i1Ucbu2es5tWDeXkh_UHztl0g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "contract-chill.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "contract-chill",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "contract-chill.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "884974546946",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:884974546946:web:d2d4b9a70436f3e672f71b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9P02H9151J"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
