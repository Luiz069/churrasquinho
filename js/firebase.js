// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSCPTNBvh7Aln21o18nhmcoyhLKh6SsS8",
  authDomain: "churrasquinho-durans.firebaseapp.com",
  projectId: "churrasquinho-durans",
  storageBucket: "churrasquinho-durans.firebasestorage.app",
  messagingSenderId: "955795329849",
  appId: "1:955795329849:web:7977212ba4d0ffbf9f4ee8",
  measurementId: "G-7MPZM4N3E8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
