import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

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

// Initialize services
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export default app;