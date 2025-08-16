
'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "jcr-radar",
  appId: "1:808852792035:web:f1f4caa30551eb51531bd6",
  storageBucket: "jcr-radar.appspot.com",
  apiKey: "AIzaSyAwY-vS9eyjPHxvcC3as_h5iMwicNRaBqg",
  authDomain: "jcr-radar.firebaseapp.com",
  messagingSenderId: "808852792035"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Set persistence right after auth is initialized
setPersistence(auth, browserSessionPersistence)
  .catch((error) => {
    // Handle errors here, such as when running in an environment that doesn't support it.
    console.error("Firebase persistence error:", error);
  });


export { app, db, storage, auth };
