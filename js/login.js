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

// ================= BOTÃO LOGIN =================
function loginGoogle() {
  auth.signInWithRedirect(provider);
}

// ================= RETORNO DO GOOGLE =================
auth
  .getRedirectResult()
  .then((result) => {
    // voltou do google agora
    if (result.user) {
      salvarUsuario(result.user);
      window.location.replace("inicio.html");
      return;
    }

    // já estava logado anteriormente
    auth.onAuthStateChanged((user) => {
      if (user) {
        window.location.replace("inicio.html");
      }
    });
  })
  .catch((error) => {
    console.error("Erro login:", error);
  });

// ================= SALVAR USUÁRIO =================
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
