import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

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

// Firebase só é usado dentro de useEffect/handlers (client-side). Inicializar
// no SSR (Cloudflare Worker) queima CPU do request à toa — getAuth() em
// especial faz probing síncrono de persistence (indexedDB/localStorage) que
// não existe no runtime do Worker, e isso soma no limite de CPU do plano
// free. `window` não existe no Worker, então esse guard mantém tudo no cliente.
const isBrowser = typeof window !== "undefined";

const app = isBrowser ? initializeApp(firebaseConfig) : (undefined as unknown as FirebaseApp);
export const auth = isBrowser ? getAuth(app) : (undefined as unknown as Auth);
export const db = isBrowser ? getFirestore(app) : (undefined as unknown as Firestore);
export const storage = isBrowser ? getStorage(app) : (undefined as unknown as FirebaseStorage);
export const googleProvider = isBrowser ? new GoogleAuthProvider() : (undefined as unknown as GoogleAuthProvider);