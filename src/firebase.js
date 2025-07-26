
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc, getDocs } from "@firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";



const firebaseConfig = {
  apiKey: "AIzaSyDuGPI6PU6wqzxbZignmUmBX-aUjMsWAb8",
  authDomain: "moamenhamdanportfolio.firebaseapp.com",
  projectId: "moamenhamdanportfolio",
  storageBucket: "moamenhamdanportfolio.firebasestorage.app",
  messagingSenderId: "1020364456708",
  appId: "1:1020364456708:web:e10a8e3c9860cf7a7d4651",
  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, collection, addDoc, auth, signInWithEmailAndPassword, signOut };