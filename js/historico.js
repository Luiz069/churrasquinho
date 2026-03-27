const firebaseConfig = {
  apiKey: "AIzaSyAcv5sSPj2yUtw0CUJHbZpF0TTfEyshyiQ",
  authDomain: "churrasquinho-7b2d2.firebaseapp.com",
  projectId: "churrasquinho-7b2d2",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

// 🔒 Verifica login
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    carregarPedidos();
  }
});

// ================= CARREGAR PEDIDOS =================

function carregarPedidos() {
  const lista = document.getElementById("lista-pedidos");
  lista.innerHTML = "Carregando...";

  db.collection("pedidos")
    .orderBy("criadoEm", "desc")
    .onSnapshot((snapshot) => {
      lista.innerHTML = "";

      snapshot.forEach((doc, index) => {
        const p = doc.data();

        let data = "";
        if (p.criadoEm) {
          const d = p.criadoEm.toDate();
          data = d.toLocaleString();
        }

        let itensHTML = "";

        p.itens.forEach((item) => {
          const subtotal = item.precoUn * item.qtd;

          itensHTML += `
            <div class="item">
              <span>${item.qtd}x ${item.nome}</span>
              <span>R$ ${subtotal.toFixed(2)}</span>
            </div>
          `;
        });

        lista.innerHTML += `
          <div class="pedido-card">
            
            <div class="topo">
              <h2>Pedido #${doc.id.slice(0, 6)}</h2>
              <span class="preco">R$ ${p.total.toFixed(2)}</span>
            </div>

            <small>📅 ${data}</small>

            <div class="badges">
              <span class="badge pendente">⏳ ${p.status}</span>
              <span class="badge">🏪 Retirada</span>
              <span class="badge">💳 ${p.pagamento}</span>
            </div>

            <div class="info-box">
              <strong>📦 Itens:</strong>
              ${itensHTML}
            </div>

            <div class="info-box">
              <strong>👤 Cliente:</strong><br>
              Nome: ${p.nome}<br>
              Telefone: ${p.numero}
            </div>

          </div>
        `;
      });
    });
}
