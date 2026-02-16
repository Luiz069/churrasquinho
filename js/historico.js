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

auth.onAuthStateChanged((user) => {
  if (!user) {
    location.href = "index.html";
    return;
  }

  carregarHistorico(user.uid);
});

function carregarHistorico(uid) {
  db.collection("pedidos")
    .where("uid", "==", uid)
    .orderBy("criadoEm", "desc")
    .onSnapshot((snapshot) => {
      const lista = document.getElementById("lista-historico");
      lista.innerHTML = "";

      snapshot.forEach((doc) => {
        const pedido = doc.data();

        lista.innerHTML += `
          <div class="pedido-card status-${pedido.status}">
            <div class="topo">
              <b>Pedido #${doc.id.substring(0, 6)}</b>
              <span class="status">${pedido.status}</span>
            </div>

            <div class="itens">
              ${pedido.itens
                .map(
                  (i) => `
                ${i.qtd}x ${i.nome} - R$ ${(i.precoUn * i.qtd).toFixed(2)}
              `,
                )
                .join("<br>")}
            </div>

            <div class="rodape">
              Total: <b>R$ ${pedido.total.toFixed(2)}</b>
            </div>
          </div>
        `;
      });
    });
}
