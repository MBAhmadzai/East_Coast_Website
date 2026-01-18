import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDVDD7XB24uyniYrBuEym7xGk-qeW3Xzm4",
  authDomain: "smartgearwebsite.firebaseapp.com",
  projectId: "smartgearwebsite",
  storageBucket: "smartgearwebsite.firebasestorage.app",
  messagingSenderId: "790659660768",
  appId: "1:790659660768:web:6da86ed0a02d6285a10985"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
