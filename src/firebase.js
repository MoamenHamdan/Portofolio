import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getCountFromServer,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";

// IMPORTANT — Firebase client-side config is NOT secret.
// These values are visible in any deployed site's network requests by design —
// that is how the Firebase web SDK works. The REAL security boundary is
// Firestore/Storage Security Rules (see firestore.rules), NOT hiding this key.
// We still move them to .env.local as good config-management practice
// (prevents accidental hardcoding in forks, makes environment switching easy).
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// ── Session persistence: browserSessionPersistence means the Firebase
//    auth token is cleared when the browser tab/window is closed.
//    On top of this we enforce a 24-hour hard expiry via localStorage
//    (see AdminPanel.jsx signIn/onAuthStateChanged logic).
setPersistence(auth, browserSessionPersistence).catch(() => {});

export {
  db,
  auth,
  // Firestore helpers re-exported so components don't need to import firebase/firestore directly
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getCountFromServer,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};