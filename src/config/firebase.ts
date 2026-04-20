import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// 🔥 SIMPLE & CLEAN CONFIG (NO COMPLEX LOGIC)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: "achivra-883bf.firebasestorage.app", // ✅ FIXED (IMPORTANT)
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// 🔥 INIT APP (SAFE INIT)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 🔥 SERVICES
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// 🔥 DEBUG (OPTIONAL)
console.log("✅ Firebase initialized:", firebaseConfig.projectId);

export { auth, db, storage };
export type { Auth, Firestore, FirebaseStorage };