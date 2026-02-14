// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAcv5sSPj2yUtw0CUJHbZpF0TTfEyshyiQ",
  authDomain: "churrasquinho-7b2d2.firebaseapp.com",
  projectId: "churrasquinho-7b2d2",
  storageBucket: "churrasquinho-7b2d2.firebasestorage.app",
  messagingSenderId: "506815282983",
  appId: "1:506815282983:web:92d14f09bafa15e2d03302",
  measurementId: "G-V0TWG5Y0H8",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// ================= PROTEÇÃO DE ROTA =================

// auth.onAuthStateChanged((user) => {
//   if (!user) {
//     window.location.href = "inicio.htm.html";
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
    window.location.href = "inicio.htm.html";
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
  const user = firebase.auth().currentUser;
  if (!user) return;

  const nome = document.getElementById("c-nome").value;
  const numero = document.getElementById("c-numero").value;
  const observacao = document.getElementById("c-obs").value;
  const pagamento = document.getElementById("c-pagto").value;

  if (!nome || !numero) {
    alert("Preencha nome e número!");
    return;
  }

  if (carrinho.length === 0) {
    alert("Carrinho vazio!");
    return;
  }

  let total = 0;
  let textoItens = "";

  carrinho.forEach((item, inicio) => {
    const subtotal = item.precoUn * item.qtd;
    total += subtotal;

    textoItens += `\n${inicio + 1}. ${item.nome}
Qtd: ${item.qtd}
Obs: ${item.obs || "Nenhuma"}
Subtotal: R$ ${subtotal.toFixed(2)}\n`;
  });

  // 🔥 SALVA NO FIRESTORE
  firebase
    .firestore()
    .collection("pedidos")
    .add({
      uid: user.uid,
      nome: nome,
      numero: numero,
      observacaoGeral: observacao,
      pagamento: pagamento,
      itens: carrinho,
      total: total,
      status: "Recebido",
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      // 🔥 MONTA MENSAGEM WHATSAPP
      const mensagem = `🍔 *NOVO PEDIDO*

Cliente: ${nome}
Número: ${numero}

Itens:${textoItens}

Observação Geral:
${observacao || "Nenhuma"}

Pagamento: ${pagamento}

💰 Total: R$ ${total.toFixed(2)}
`;

      const numeroLanchonete = "5598985301953";
      const url = `https://wa.me/${numeroLanchonete}?text=${encodeURIComponent(mensagem)}`;

      // Limpa carrinho
      carrinho = [];
      renderCarrinho();

      // Abre WhatsApp
      window.open(url, "_blank");

      alert("Pedido enviado com sucesso!");
    })
    .catch((error) => {
      console.error("Erro ao salvar pedido:", error);
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
