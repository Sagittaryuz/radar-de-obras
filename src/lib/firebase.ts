
'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, browserSessionPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "jcr-radar",
  appId: "1:808852792035:web:f1f4caa30551eb51531bd6",
  storageBucket: "jcr-radar.firebasestorage.app",
  apiKey: "AIzaSyAwY-vS9eyjPHxvcC3as_h5iMwicNRaBqg",
  authDomain: "jcr-radar.firebaseapp.com",
  messagingSenderId: "808852792035"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

// Get Auth instance and set persistence
const auth = getAuth(app);
// This makes sure the user has to log in every time.
setPersistence(auth, browserSessionPersistence);


export { app, db, storage, auth };
