// Configuração do Firebase v8
const firebaseConfig = {
  apiKey: "AIzaSyAcv5sSPj2yUtw0CUJHbZpF0TTfEyshyiQ",
  authDomain: "churrasquinho-7b2d2.firebaseapp.com",
  projectId: "churrasquinho-7b2d2",
  storageBucket: "churrasquinho-7b2d2.firebasestorage.app",
  messagingSenderId: "506815282983",
  appId: "1:506815282983:web:92d14f09bafa15e2d03302",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

async function loginGoogle() {
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;

    // 1. Tenta buscar o perfil do usuário
    const userRef = db.collection("usuarios").doc(user.uid);
    const doc = await userRef.get();

    if (doc.exists) {
      // USUÁRIO JÁ EXISTE: Segue para o painel
      console.log("Usuário já cadastrado. Redirecionando...");
      window.location.href = "dashboard.html";
    } else {
      // USUÁRIO NÃO EXISTE: Criar o perfil agora (Auto-Cadastro)
      console.log("Primeiro acesso. Criando perfil no Firestore...");

      const novoUsuario = {
        nome: user.displayName,
        email: user.email,
        uid: user.uid,
        dataCriacao: firebase.firestore.FieldValue.serverTimestamp(),
        role: "cliente", // Define um papel padrão
      };

      // Salva no Firestore (Sua regra permite: if request.auth.uid == uid)
      await userRef.set(novoUsuario);

      alert("Perfil criado com sucesso!");
      window.location.href = "dashboard.html";
    }
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Erro ao acessar: " + error.message);
  }
}

