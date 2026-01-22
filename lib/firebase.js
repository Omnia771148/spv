// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDIitDbOHvjqffq6XFtT5GJzX3_Dp7STIs",
  authDomain: "deliveryboy-5d87b.firebaseapp.com",
  projectId: "deliveryboy-5d87b",
  storageBucket: "deliveryboy-5d87b.firebasestorage.app",
  messagingSenderId: "434284812926",
  appId: "1:434284812926:web:a93ad7116363925c89162f",
  measurementId: "G-MRVSSF1YYL"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = "en";

let analytics;
// Analytics is only supported in browser environments
if (typeof window !== 'undefined') {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, analytics };
