
import { initializeApp, getApps, getApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// This is a mock service account object.
// In a real production environment, this should be loaded from a secure environment variable.
const mockServiceAccount: ServiceAccount = {
  projectId: 'jcr-radar',
  clientEmail: 'mock-client-email@example.com',
  privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC3\n-----END PRIVATE KEY-----\n',
};


const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

let serviceAccount: ServiceAccount;

if (serviceAccountJson) {
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON. Using mock credentials.', error);
    serviceAccount = mockServiceAccount;
  }
} else {
  // console.warn('FIREBASE_SERVICE_ACCOUNT environment variable not set. Using mock credentials for development.');
  serviceAccount = mockServiceAccount;
}


const adminApp = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
      storageBucket: "jcr-radar.firebasestorage.app",
    })
  : getApp();

const auth = getAuth(adminApp);
const db = getFirestore(adminApp);
const storage = getStorage(adminApp);

export { adminApp, auth, db, storage };
