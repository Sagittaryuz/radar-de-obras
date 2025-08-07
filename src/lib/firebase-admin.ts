
import { initializeApp, getApps, getApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

let adminApp;

if (serviceAccountJson) {
  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    adminApp = !getApps().length
      ? initializeApp({
          credential: cert(serviceAccount),
          storageBucket: "jcr-radar.firebasestorage.app",
        })
      : getApp();
  } catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON or initialize app.', error);
    // In a real app, you might want to throw an error here to stop the server from starting
    // without proper configuration. For this environment, we will let it proceed but auth will fail.
  }
} else {
  console.warn('FIREBASE_SERVICE_ACCOUNT environment variable not set. Server-side Firebase services will not be available.');
}


const auth = getAuth(adminApp);
const db = getFirestore(adminApp);
const storage = getStorage(adminApp);

export { adminApp, auth, db, storage };
