
'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
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

export { app, db, storage };
