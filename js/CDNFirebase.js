import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB0NrF4LSgOg2mt3lSo0zaewPFwX649dW0",
  authDomain: "jewelry-store-new.firebaseapp.com",
  projectId: "jewelry-store-new",
  storageBucket: "jewelry-store-new.firebasestorage.app",
  messagingSenderId: "138583731016",
  appId: "1:138583731016:web:8c001293338dd31951217d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth }; // لكي تستخدميهم في صفحات الـ Login والـ Register