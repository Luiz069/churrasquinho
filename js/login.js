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

// Se já estiver logado → vai para inicio.htm
auth.onAuthStateChanged((user) => {
  if (user) {
    window.location.href = "inicio.html";
  }
});

// Login Google
function loginGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();

  // 🔥 NOVO MÉTODO (sem erro COOP)
  auth.signInWithRedirect(provider);
}

// 🔥 precisa existir ao carregar a página
auth
  .getRedirectResult()
  .then((result) => {
    if (result.user) {
      console.log("Logado:", result.user.email);

      // redireciona depois do login
      window.location.href = "inicio.html";
    }
  })
  .catch((error) => {
    console.error(error);
  });
