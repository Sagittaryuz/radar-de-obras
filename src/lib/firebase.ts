import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
  projectId: "jcr-radar",
  appId: "1:808852792035:web:f1f4caa30551eb51531bd6",
  storageBucket: "jcr-radar.firebasestorage.app",
  apiKey: "AIzaSyAwY-vS9eyjPHxvcC3as_h5iMwicNRaBqg",
  authDomain: "jcr-radar.firebaseapp.com",
  messagingSenderId: "808852792035",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
