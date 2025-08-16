
'use client';

import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// A function to get the Firebase config, trying the auto-loader first.
async function getFirebaseConfig(): Promise<FirebaseOptions> {
    try {
        const response = await fetch('/__/firebase/init.json');
        if (response.ok) {
            console.log("Firebase config loaded from auto-loader.");
            return await response.json();
        } else {
             console.log("Auto-loader not found, falling back to static config.");
        }
    } catch (error) {
         console.log("Error fetching auto-loader, falling back to static config.", error);
    }
    
    // Fallback static config (ensure this is correct for your project)
    return {
        projectId: "jcr-radar",
        appId: "1:808852792035:web:f1f4caa30551eb51531bd6",
        storageBucket: "jcr-radar.appspot.com",
        apiKey: "AIzaSyAwY-vS9eyjPHxvcC3as_h5iMwicNRaBqg",
        authDomain: "jcr-radar.firebaseapp.com",
        messagingSenderId: "808852792035"
    };
}


let app: ReturnType<typeof initializeApp>;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;
let storage: ReturnType<typeof getStorage>;

// Top-level await to initialize Firebase asynchronously
// This ensures that all Firebase services are ready before they are exported.
if (getApps().length === 0) {
    const firebaseConfig = await getFirebaseConfig();
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

// Set persistence after auth is initialized
setPersistence(auth, browserSessionPersistence)
  .catch((error) => {
    console.error("Firebase persistence error:", error);
  });

export { app, db, storage, auth };
