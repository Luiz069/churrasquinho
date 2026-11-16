// 1. CONFIGURAÇÃO (Mesma que você já usa)
const firebaseConfig = {
  apiKey: "AIzaSyAcv5sSPj2yUtw0CUJHbZpF0TTfEyshyiQ",
  authDomain: "churrasquinho-7b2d2.firebaseapp.com",
  projectId: "churrasquinho-7b2d2",
  storageBucket: "churrasquinho-7b2d2.firebasestorage.app",
  messagingSenderId: "506815282983",
  appId: "1:506815282983:web:92d14f09bafa15e2d03302",
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// 2. CONTROLE DE ACESSO
auth.onAuthStateChanged((user) => {
  const loadingEl = document.getElementById("loading");
  const contentEl = document.getElementById("dashboard-content");

  if (user) {
    const isAdmin = user.email.toLowerCase() === "shirlianedurans@gmail.com";

    if (isAdmin) {
      // SÓ TENTA MEXER NO STYLE SE O ELEMENTO EXISTIR
      if (loadingEl) loadingEl.style.display = "none";
      if (contentEl) contentEl.style.display = "block";
    } else {
      alert("Acesso restrito!");
      window.location.href = "https://churrasquinho.vercel.app/inicio.html";
    }
  } else {
    const caminhoLogin = window.location.pathname.includes("/html/") ? "../index.html" : "index.html";
    window.location.href = caminhoLogin;
  }
});

// 3. FUNÇÃO DE LOGOUT
function fazerLogout() {
  auth
    .signOut()
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert("Erro ao sair: " + error.message);
    });
}
