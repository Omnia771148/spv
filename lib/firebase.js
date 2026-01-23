// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDZ2uueufL3iXjyY2q-p1YT4III3xsZfgY",
  authDomain: "realdel-f964c.firebaseapp.com",
  projectId: "realdel-f964c",
  storageBucket: "realdel-f964c.firebasestorage.app",
  messagingSenderId: "118715949536",
  appId: "1:118715949536:web:9d37749a6c6e2346548b85",
  measurementId: "G-XGFZJKTF9D"
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
