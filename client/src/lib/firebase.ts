import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAXt_VH-9i1Ucbu2es5tWDeXkh_UHztl0g",
  authDomain: "contract-chill.firebaseapp.com",
  projectId: "contract-chill",
  storageBucket: "contract-chill.firebasestorage.app",
  messagingSenderId: "884974546946",
  appId: "1:884974546946:web:d2d4b9a70436f3e672f71b",
  measurementId: "G-9P02H9151J"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
