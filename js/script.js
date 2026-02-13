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

// ================= PROTEÇÃO DE ROTA (PASSO 4) =================

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    carregarDadosUsuario(user);
  }
});

// ================= CARREGAR DADOS DO USUÁRIO =================

function carregarDadosUsuario(user) {
  db.collection("usuarios")
    .doc(user.uid)
    .get()
    .then((doc) => {
      if (doc.exists) {
        const nomeInput = document.getElementById("c-nome");
        if (nomeInput) {
          nomeInput.value = doc.data().nome || user.displayName || "";
        }
      }
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

function renderCarrinho() {
  const lista = document.getElementById("lista-carrinho");
  lista.innerHTML = "";
  let totalGeral = 0;

  carrinho.forEach((item, i) => {
    let sub = item.precoUn * item.qtd;
    totalGeral += sub;

    lista.innerHTML += `
      <div class="cart-item-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="flex:1">
            <b>${item.nome}</b><br>
            <small>${item.desc}</small>
            ${
              item.adicionais.length > 0
                ? `<div style="font-size:0.8rem; color:#d61b1b; margin-top:5px;"><b>+ ${item.adicionais.join(", ")}</b></div>`
                : ""
            }
            ${
              item.obs
                ? `<div style="color:red; font-size:0.85rem; margin-top:5px;">Obs: ${item.obs}</div>`
                : ""
            }
          </div>
          <b style="color:var(--vermelho)">R$ ${sub.toFixed(2)}</b>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:12px; align-items:center; margin-top:15px;">
          <div class="qtd-control">
            <button class="btn-qtd" onclick="alterarQtdCarrinho(${i}, -1)">-</button>
            <span>${item.qtd}</span>
            <button class="btn-qtd" onclick="alterarQtdCarrinho(${i}, 1)">+</button>
          </div>
          <button onclick="removerItem(${i})" style="border:none; background:none; cursor:pointer; font-size:1.2rem;">🗑️</button>
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
