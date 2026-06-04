import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAKcFlRmCjuQ35hiGnlDmOPO1P4VdjGZqw",
  authDomain: "mineaddonsnews-web.firebaseapp.com",
  databaseURL: "https://mineaddonsnews-web-default-rtdb.firebaseio.com",
  projectId: "mineaddonsnews-web",
  storageBucket: "mineaddonsnews-web.firebasestorage.app",
  messagingSenderId: "877653857210",
  appId: "1:877653857210:web:13cbd8a9d58d611600c383",
  measurementId: "G-YG2BXTLYJJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Initialize analytics conditionally (might fail in some environments)
export const analytics = typeof window !== 'undefined' ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

export default app;
