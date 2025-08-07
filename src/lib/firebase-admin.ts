
import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// IMPORTANT: Path to your service account key file
// You can download this from your Firebase project settings.
// DO NOT expose this file publicly.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : {
      "type": "service_account",
      "project_id": process.env.PROJECT_ID || "jcr-radar",
      "private_key_id": process.env.PRIVATE_KEY_ID,
      "private_key": (process.env.PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      "client_email": process.env.CLIENT_EMAIL,
      "client_id": process.env.CLIENT_ID,
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL,
      "universe_domain": "googleapis.com"
    };

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
