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

// 🔥 BOTÃO LOGIN
document.getElementById("btnGoogleLogin").addEventListener("click", () => {
  auth.signInWithRedirect(provider);
});

// 🔥 APENAS AQUI DECIDE O LOGIN
auth
  .getRedirectResult()
  .then((result) => {
    // Se voltou do Google
    if (result.user) {
      salvarUsuario(result.user);
      window.location.replace("inicio.html");
      return;
    }

    // Se já estava logado antes de abrir a página
    auth.onAuthStateChanged((user) => {
      if (user) {
        window.location.replace("inicio.html");
      }
    });
  })
  .catch((error) => {
    console.error(error);
  });

// 🔥 SALVAR USUÁRIO
function salvarUsuario(user) {
  db.collection("usuarios").doc(user.uid).set(
    {
      nome: user.displayName,
      email: user.email,
      foto: user.photoURL,
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
