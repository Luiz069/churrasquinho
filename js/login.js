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

const provider = new firebase.auth.GoogleAuthProvider();

// ===============================
// 🔥 BOTÃO LOGIN
// ===============================
document.getElementById("btnGoogleLogin").addEventListener("click", () => {
  auth.signInWithRedirect(provider);
});

// ===============================
// 🔥 RETORNO DO GOOGLE
// ===============================
auth
  .getRedirectResult()
  .then((result) => {
    if (!result.user) return;

    const user = result.user;

    // cria/atualiza usuário no banco
    db.collection("usuarios").doc(user.uid).set(
      {
        nome: user.displayName,
        email: user.email,
        foto: user.photoURL,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // entra no sistema
    window.location.href = "inicio.html";
  })
  .catch((error) => {
    console.error("Erro login:", error);
    alert("Erro ao entrar com Google");
  });

// ===============================
// 🔥 JÁ LOGADO
// ===============================
auth.onAuthStateChanged((user) => {
  if (user) {
    window.location.href = "inicio.html";
  }
});
