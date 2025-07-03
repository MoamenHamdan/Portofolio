import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { collection, addDoc } from "@firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDuGPI6PU6wqzxbZignmUmBX-aUjMsWAb8",
    authDomain: "moamenhamdanportfolio.firebaseapp.com",
    projectId: "moamenhamdanportfolio",
    storageBucket: "moamenhamdanportfolio.firebasestorage.app",
    messagingSenderId: "1020364456708",
    appId: "1:1020364456708:web:e10a8e3c9860cf7a7d4651",
    measurementId: "G-M5ZTB8CQ10"
};

// Initialize with a unique name
const app = initializeApp(firebaseConfig, 'comments-app');
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, collection, addDoc };