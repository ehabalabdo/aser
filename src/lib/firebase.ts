
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const isConfigured = !!firebaseConfig.apiKey;

if (!isConfigured) {
    console.warn("Firebase config missing. App will likely crash at runtime if not configured.");
}

const app = (isConfigured && !getApps().length ? initializeApp(firebaseConfig) : (getApps().length ? getApp() : undefined)) as any;
const auth = (app ? getAuth(app) : undefined) as any;
const db = (app ? getFirestore(app) : undefined) as any;
const storage = (app ? getStorage(app) : undefined) as any;
const functions = (app ? getFunctions(app) : undefined) as any;

export { app, auth, db, storage, functions };
