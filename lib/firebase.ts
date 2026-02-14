import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
 apiKey: "AIzaSyBK6aJMiBErbB3KrN4_EmE3RWzdTXFNN_A",
  authDomain: "careops-d3813.firebaseapp.com",
  projectId: "careops-d3813",
  storageBucket: "careops-d3813.firebasestorage.app",
  messagingSenderId: "943110673032",
  appId: "1:943110673032:web:e9e004a661bbd10152453d"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
