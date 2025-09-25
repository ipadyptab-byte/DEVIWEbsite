import { getApps, initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

/**
 * Initialize Firebase app safely if config is provided.
 * Returns a Storage instance or null if initialization/config is missing.
 */
export function safeGetStorage() {
  try {
    if (!getApps().length) {
      const config = {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID,
      };

      // Ensure required fields exist before initializing
      if (
        !config.apiKey ||
        !config.projectId ||
        !config.storageBucket ||
        !config.appId
      ) {
        return null;
      }

      initializeApp(config);
    }

    return getStorage();
  } catch {
    return null;
  }
}