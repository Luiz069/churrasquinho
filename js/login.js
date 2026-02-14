const firebaseConfig = {
  apiKey: "AIzaSyAcv5sSPj2yUtw0CUJHbZpF0TTfEyshyiQ",
  authDomain: "churrasquinho-7b2d2.firebaseapp.com",
  projectId: "churrasquinho-7b2d2",
  storageBucket: "churrasquinho-7b2d2.firebasestorage.app",
  messagingSenderId: "506815282983",
  appId: "1:506815282983:web:92d14f09bafa15e2d03302",
  measurementId: "G-V0TWG5Y0H8",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Se já estiver logado → vai para index
auth.onAuthStateChanged((user) => {
  if (user) {
    window.location.href = "index.html";
  }
});

// Login Google
document.getElementById("btnGoogleLogin").addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth
    .signInWithPopup(provider)
    .then((result) => {
      const user = result.user;

      db.collection("usuarios").doc(user.uid).set(
        {
          nome: user.displayName,
          email: user.email,
          foto: user.photoURL,
          criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      window.location.href = "index.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});
