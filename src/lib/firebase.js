// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRN8LxfXiew_L8PPRDYdrCz7BdI5elp-I",
  authDomain: "chat-bot-dad1a.firebaseapp.com",
  projectId: "chat-bot-dad1a",
  storageBucket: "chat-bot-dad1a.firebasestorage.app",
  messagingSenderId: "225887978096",
  appId: "1:225887978096:web:d912e5b5989f45ee3daab5",
  measurementId: "G-H1LBLHSSRJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;