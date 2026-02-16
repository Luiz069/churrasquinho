const firebaseConfig = {
  apiKey: "AIzaSyAcv5sSPj2yUtw0CUJHbZpF0TTfEyshyiQ",
  authDomain: "churrasquinho-7b2d2.firebaseapp.com",
  projectId: "churrasquinho-7b2d2",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

// 🔥 mantém login mesmo fechando navegador (IMPORTANTE)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// ================= LOGIN =================
function loginGoogle() {
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

      window.location.href = "inicio.html";
    })
    .catch((error) => {
      alert(error.message);
    });
}

// ================= SE JÁ LOGADO =================
auth.onAuthStateChanged((user) => {
  if (user) {
    window.location.href = "inicio.html";
  }
});
