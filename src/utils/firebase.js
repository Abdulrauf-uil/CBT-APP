import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Replace with your Firebase project configuration
// You can get this from Firebase Console -> Project Settings -> General -> SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyADys-eeamVYIaMIxSAGkXBzB88rYvt450",
  authDomain: "cbt-app-907ac.firebaseapp.com",
  projectId: "cbt-app-907ac",
  storageBucket: "cbt-app-907ac.firebasestorage.app",
  messagingSenderId: "684469997258",
  appId: "1:684469997258:web:d885e0e6ec0de3c5166e33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

export default app;
