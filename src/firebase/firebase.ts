import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyDGNhd0PHCj3N1TT2UOoQWEbCaSfKfOI1o",
    authDomain: "block-task-c6183.firebaseapp.com",
    projectId: "block-task-c6183",
    storageBucket: "block-task-c6183.firebasestorage.app",
    messagingSenderId: "43376193374",
    appId: "1:43376193374:web:779f307bd0438991baa9cf",
    measurementId: "G-DMVGLTTPLZ"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };