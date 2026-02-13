const firebaseConfig = {
  apiKey: "AIzaSyCSCPTNBvh7Aln21o18nhmcoyhLKh6SsS8",
  authDomain: "churrasquinho-durans.firebaseapp.com",
  projectId: "churrasquinho-durans",
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
