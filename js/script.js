// ================= FIREBASE CONFIG =================

const firebaseConfig = {
  apiKey: "AIzaSyCSCPTNBvh7Aln21o18nhmcoyhLKh6SsS8",
  authDomain: "churrasquinho-durans.firebaseapp.com",
  projectId: "churrasquinho-durans",
  storageBucket: "churrasquinho-durans.firebasestorage.app",
  messagingSenderId: "955795329849",
  appId: "1:955795329849:web:7977212ba4d0ffbf9f4ee8",
  measurementId: "G-7MPZM4N3E8",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// ================= PROTEÇÃO DE ROTA =================

// auth.onAuthStateChanged((user) => {
//   if (!user) {
//     window.location.href = "login.html";
//   } else {
//     carregarDadosUsuario(user);
//   }
// });

// ================= CARREGAR DADOS DO USUÁRIO =================

function carregarDadosUsuario(user) {
  db.collection("usuarios")
    .doc(user.uid)
    .get()
    .then((doc) => {
      const nomeInput = document.getElementById("c-nome");
      const numeroInput = document.getElementById("c-numero");

      if (nomeInput) nomeInput.value = user.displayName || "";
      if (numeroInput) numeroInput.value = user.phoneNumber || "";
    });
}

// ================= LOGOUT =================

function sair() {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
}

// ================= SISTEMA DO CARRINHO =================

let carrinho = [];
let itemAtual = {};
let qtdModal = 1;
let extras = { queijo: 0, ovo: 0, carne: 0 };
const precosExtras = { queijo: 3.0, ovo: 2.0, carne: 8.0 };

// ===== MODAL PRODUTO =====

function abrirModal(nome, preco, desc) {
  itemAtual = { nome, preco, desc };
  qtdModal = 1;
  extras = { queijo: 0, ovo: 0, carne: 0 };

  document.getElementById("m-nome").innerText = nome;
  document.getElementById("m-desc").innerText = desc;
  document.getElementById("m-obs").value = "";

  atualizarInterfaceModal();
  document.getElementById("modalItem").style.display = "flex";
}

function mudarQtdModal(val) {
  if (qtdModal + val >= 1) {
    qtdModal += val;
    atualizarInterfaceModal();
  }
}

function mudarAdd(tipo, val) {
  if (extras[tipo] + val >= 0) {
    extras[tipo] += val;
    atualizarInterfaceModal();
  }
}

function atualizarInterfaceModal() {
  document.getElementById("m-qtd-val").innerText = qtdModal;
  document.getElementById("qtd-add-queijo").innerText = extras.queijo;
  document.getElementById("qtd-add-ovo").innerText = extras.ovo;
  document.getElementById("qtd-add-carne").innerText = extras.carne;

  let precoExtras =
    extras.queijo * precosExtras.queijo +
    extras.ovo * precosExtras.ovo +
    extras.carne * precosExtras.carne;

  let total = (itemAtual.preco + precoExtras) * qtdModal;
  document.getElementById("m-subtotal").innerText = total.toFixed(2);
}

function fecharModal() {
  document.getElementById("modalItem").style.display = "none";
}

// ===== ADICIONAR AO CARRINHO =====

function addAoCarrinho() {
  let listaExtras = [];

  if (extras.queijo > 0) listaExtras.push(`${extras.queijo}x Queijo Extra`);
  if (extras.ovo > 0) listaExtras.push(`${extras.ovo}x Ovo Extra`);
  if (extras.carne > 0) listaExtras.push(`${extras.carne}x Carne Extra`);

  let custoExtras =
    extras.queijo * precosExtras.queijo +
    extras.ovo * precosExtras.ovo +
    extras.carne * precosExtras.carne;

  carrinho.push({
    ...itemAtual,
    qtd: qtdModal,
    obs: document.getElementById("m-obs").value,
    adicionais: listaExtras,
    precoUn: itemAtual.preco + custoExtras,
  });

  renderCarrinho();
  fecharModal();
}

// ===== RENDER CARRINHO =====

function renderCarrinho() {
  const lista = document.getElementById("lista-carrinho");
  lista.innerHTML = "";
  let totalGeral = 0;

  carrinho.forEach((item, i) => {
    let sub = item.precoUn * item.qtd;
    totalGeral += sub;

    lista.innerHTML += `
      <div class="cart-item-card">
        <b>${item.nome}</b><br>
        ${item.desc}<br>
        ${item.adicionais.join(", ")}<br>
        ${item.obs ? "Obs: " + item.obs : ""}
        <br><b>R$ ${sub.toFixed(2)}</b>
        <div>
          <button onclick="alterarQtdCarrinho(${i}, -1)">-</button>
          ${item.qtd}
          <button onclick="alterarQtdCarrinho(${i}, 1)">+</button>
          <button onclick="removerItem(${i})">🗑️</button>
        </div>
      </div>
    `;
  });

  document.getElementById("total-final").innerText = totalGeral.toFixed(2);

  document.getElementById("cart-count").innerText = carrinho.length;
}

function alterarQtdCarrinho(i, v) {
  if (carrinho[i].qtd + v > 0) {
    carrinho[i].qtd += v;
  } else {
    carrinho.splice(i, 1);
  }
  renderCarrinho();
}

function removerItem(i) {
  carrinho.splice(i, 1);
  renderCarrinho();
}

function toggleCart() {
  document.getElementById("cartSidebar").classList.toggle("active");
}

// ================= FINALIZAR PEDIDO =================

function finalizarPedido() {
  const user = auth.currentUser;

  if (!user || carrinho.length === 0) {
    alert("Carrinho vazio!");
    return;
  }

  const nome = document.getElementById("c-nome").value;
  const numero = document.getElementById("c-numero").value;
  const obsGeral = document.getElementById("c-obs-geral")?.value || "";

  let total = carrinho.reduce((acc, item) => acc + item.precoUn * item.qtd, 0);

  db.collection("pedidos")
    .add({
      uid: user.uid,
      nome,
      numero,
      observacaoGeral: obsGeral,
      itens: carrinho,
      total,
      status: "Recebido",
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      alert("Pedido enviado com sucesso!");
      carrinho = [];
      renderCarrinho();
      toggleCart();
    });
}

// ================= HISTÓRICO =================

function abrirHistorico() {
  const user = auth.currentUser;
  if (!user) return;

  db.collection("pedidos")
    .where("uid", "==", user.uid)
    .orderBy("criadoEm", "desc")
    .get()
    .then((snapshot) => {
      let html = "";

      snapshot.forEach((doc) => {
        const pedido = doc.data();
        html += `
          <div style="border:1px solid #ccc; padding:10px; margin:10px;">
            <strong>${pedido.nome}</strong><br>
            Total: R$ ${pedido.total}<br>
            Status: ${pedido.status}
          </div>
        `;
      });

      document.getElementById("listaHistorico").innerHTML = html;
      document.getElementById("modalHistorico").style.display = "block";
    });
}

function fecharHistorico() {
  document.getElementById("modalHistorico").style.display = "none";
}
