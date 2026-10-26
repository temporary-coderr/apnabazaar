// JAORA BAZAAR - Firebase Live Config - website-1cb04
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBtcdBS75tgYJ5W1wilHT9y4rNI1LzUAHI",
  authDomain: "website-1cb04.firebaseapp.com",
  projectId: "website-1cb04",
  storageBucket: "website-1cb04.firebasestorage.app",
  messagingSenderId: "392147898697",
  appId: "1:392147898697:web:faa25a34b938ccd739ca98",
  measurementId: "G-RWF18VNE3E"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log("✅ Jaora Bazaar LIVE - website-1cb04");
