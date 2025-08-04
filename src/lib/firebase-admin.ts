
// src/lib/firebase-admin.ts
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// This function ensures that we only initialize the app once.
function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // When running in a Google Cloud environment, the SDK automatically
  // finds the service account credentials. For local development,
  // you would set the GOOGLE_APPLICATION_CREDENTIALS environment variable.
  const app = initializeApp();
  return app;
}

const adminApp = getAdminApp();
const dbAdmin = getFirestore(adminApp);
const authAdmin = getAuth(adminApp);

export { dbAdmin, authAdmin };
