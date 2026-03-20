// 🔥 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAcv5sSPj2yUtw0CUJHbZpF0TTfEyshyiQ",
  authDomain: "churrasquinho-7b2d2.firebaseapp.com",
  projectId: "churrasquinho-7b2d2",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// LOGIN
function loginGoogle() {
  auth.signInWithRedirect(provider);
}

// 🔥 ESSA É A CHAVE (FUNCIONA SEM ERRO)
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("Logado:", user);

    window.location.href = "inicio.html";
  }
});
