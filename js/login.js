const firebaseConfig = {
  apiKey: "AIzaSyAcv5sSPj2yUtw0CUJHbZpF0TTfEyshyiQ",
  authDomain: "churrasquinho-7b2d2.firebaseapp.com",
  projectId: "churrasquinho-7b2d2",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// 🚀 LOGIN
function loginGoogle() {
  auth
    .signInWithPopup(provider)
    .then(() => {
      window.location.href = "inicio.html";
    })
    .catch((error) => {
      console.error("Erro no login:", error);
    });
}

// 🔒 ANTI-LOOP (ESSENCIAL)
auth.onAuthStateChanged((user) => {
  if (user) {
    // Se já estiver logado, manda direto pro início
    if (!window.location.pathname.includes("inicio.html")) {
      window.location.href = "inicio.html";
    }
  }
});
