import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//     apiKey: "AIzaSyBlPInA-52ocWKE93AN1bbZ6Gj333IZh0A",
//     authDomain: "strayintouch-e920b.firebaseapp.com",
//     projectId: "strayintouch-e920b",
//     storageBucket: "strayintouch-e920b.appspot.com",
//     messagingSenderId: "563125147839",
//     appId: "1:563125147839:web:885a266fd0bcfdb3c7ce0a",
//     measurementId: "G-N3WX0YQK06"
// };

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET_ID,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};



const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
