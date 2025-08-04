
// src/lib/firebase-admin.ts
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// This function ensures that we only initialize the app once.
let adminApp: App;

if (getApps().length === 0) {
  adminApp = initializeApp();
} else {
  adminApp = getApps()[0];
}

const dbAdmin = getFirestore(adminApp);
const authAdmin = getAuth(adminApp);

export { dbAdmin, authAdmin };
