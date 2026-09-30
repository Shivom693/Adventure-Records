import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase variables are configured
const isConfigured = Boolean(firebaseConfig.apiKey) && 
  firebaseConfig.apiKey !== 'your_firebase_api_key_here' && 
  !firebaseConfig.apiKey.startsWith('your_');

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
