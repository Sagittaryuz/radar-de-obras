
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

let adminApp;

if (!getApps().length) {
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: "jcr-radar.firebasestorage.app",
      });
    } catch (error) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON or initialize app.', error);
      // Let the app continue without admin features, auth will fail gracefully.
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT environment variable not set. Server-side Firebase services will not be available.');
  }
} else {
  adminApp = getApp();
}

// Only export services if the app was initialized
const auth = adminApp ? getAuth(adminApp) : null;
const db = adminApp ? getFirestore(adminApp) : null;
const storage = adminApp ? getStorage(adminApp) : null;

// The null checks are important for consumer modules
export { adminApp, auth, db, storage };
