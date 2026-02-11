import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';

// Use environment variables with fallbacks for runtime access
const firebaseConfig = {
  apiKey: typeof window !== 'undefined' ? 
    (window as any).__FIREBASE_API_KEY__ || process.env.NEXT_PUBLIC_FIREBASE_API_KEY : 
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: typeof window !== 'undefined' ? 
    (window as any).__FIREBASE_AUTH_DOMAIN__ || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN : 
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: typeof window !== 'undefined' ? 
    (window as any).__FIREBASE_PROJECT_ID__ || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID : 
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: typeof window !== 'undefined' ? 
    (window as any).__FIREBASE_STORAGE_BUCKET__ || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET : 
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: typeof window !== 'undefined' ? 
    (window as any).__FIREBASE_MESSAGING_SENDER_ID__ || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID : 
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: typeof window !== 'undefined' ? 
    (window as any).__FIREBASE_APP_ID__ || process.env.NEXT_PUBLIC_FIREBASE_APP_ID : 
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate config
const isValidConfig = Object.values(firebaseConfig).every(val => val && val !== '');

let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isValidConfig) {
  try {
    // Initialize Firebase - check if already initialized
    let app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Set auth persistence
    if (typeof window !== 'undefined') {
      // Configure auth settings for better error handling
      auth.useDeviceLanguage();
    }
    
    console.log('✅ Firebase initialized successfully for project:', firebaseConfig.projectId);
  } catch (error: any) {
    console.error('❌ Firebase initialization error:', error?.message || error);
  }
}

if (!auth) {
  console.warn('⚠️ Firebase not initialized. Check your environment variables.');
  console.warn('Config:', {
    apiKey: firebaseConfig.apiKey ? '***' : 'missing',
    authDomain: firebaseConfig.authDomain || 'missing',
    projectId: firebaseConfig.projectId || 'missing',
    storageBucket: firebaseConfig.storageBucket || 'missing',
  });
}

export { auth, db, storage };
export type { Auth, Firestore, FirebaseStorage };
