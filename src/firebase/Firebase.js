import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Prefer env vars; if missing, we won't initialize Firebase to avoid runtime crashes.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || null,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || null,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || null,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || null,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || null,
  appId: process.env.REACT_APP_FIREBASE_APP_ID || null,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || null,
};

let app = null;
let db = null;
let storage = null;

try {
  // Only initialize if we have the minimum required fields
  if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
  } else {
    // eslint-disable-next-line no-console
    console.warn("Firebase not configured: missing credentials. Features depending on Firebase will be disabled.");
  }
} catch (err) {
  // eslint-disable-next-line no-console
  console.error("Failed to initialize Firebase:", err);
  app = null;
  db = null;
  storage = null;
}

export { db, storage };
