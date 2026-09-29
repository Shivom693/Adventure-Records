import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAG7PPZn7Dj4ANWfgaqvYnSLAXp0cBUnBc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'music-b2696.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'music-b2696',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'music-b2696.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '234429527949',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:234429527949:web:af6f66fd3b1b53e171afc4'
};

// Check if Firebase variables are filled
const isConfigured = Boolean(firebaseConfig.apiKey);

let app;
let auth;
let googleProvider;
let db;
let storage;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    console.log("🔥 Firebase Auth, Firestore & Storage initialized successfully!");
  } catch (error) {
    console.error("❌ Firebase client initialization failed:", error);
  }
} else {
  console.log("⚠️ Firebase client running in local configuration mode.");
}

export { auth, googleProvider, db, storage, isConfigured };
export default auth;
