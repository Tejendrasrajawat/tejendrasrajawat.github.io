// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore} from 'firebase/firestore';    


const firebaseConfig = {
  apiKey: "AIzaSyCZmYnaQOQrlpMZWJ2CQaBwHOx-S-Rpvjk",
  authDomain: "tejendrahimself-b780f.firebaseapp.com",
  projectId: "tejendrahimself-b780f",
  storageBucket: "tejendrahimself-b780f.appspot.com",
  messagingSenderId: "281698476889",
  appId: "1:281698476889:web:aa0943291e88e47332a248",
  measurementId: "G-KGT2VRCH0H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

console.log(app);

export const db = getFirestore();

