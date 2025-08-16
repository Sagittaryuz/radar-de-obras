
'use client';

import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDXhBsIkArzAbPqvSNJBw_iAK9u6VNHkqw",
  authDomain: "jcr-radar.firebaseapp.com",
  projectId: "jcr-radar",
  storageBucket: "jcr-radar.appspot.com",
  messagingSenderId: "808852792035",
  appId: "1:808852792035:web:1d0c7ee2b2118794531bd6"
};

let app: ReturnType<typeof initializeApp>;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Set persistence after auth is initialized
setPersistence(auth, browserSessionPersistence)
  .catch((error) => {
    console.error("Firebase persistence error:", error);
  });

export { app, db, storage, auth };
