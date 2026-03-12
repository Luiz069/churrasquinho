// ================= FIREBASE =================

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

// ================= CARRINHO (AGORA PERSISTENTE) =================

// 🔥 Carrega do localStorage
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// ================= VARIÁVEIS DO MODAL =================

let itemAtual = {};
let qtdModal = 1;
let extras = { queijo: 0, ovo: 0, carne: 0 };
const precosExtras = { queijo: 3.0, ovo: 2.0, carne: 8.0 };

// ================= MODAL PRODUTO =================

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

// ================= ADICIONAR AO CARRINHO =================

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

  salvarCarrinho();
  renderCarrinho();
  fecharModal();
}

// ================= RENDER CARRINHO =================

function renderCarrinho() {
  const lista = document.getElementById("lista-carrinho");
  if (!lista) return;

  lista.innerHTML = "";
  let totalGeral = 0;

  carrinho.forEach((item, i) => {
    let sub = item.precoUn * item.qtd;
    totalGeral += sub;

    lista.innerHTML += `
        <div class="cart-item-card">
          <div class="header-card">
            <h3 class="carrinho-nome-produto">${item.nome}</h3>
            <p class="carrinho-subtotal-produto">R$ ${sub.toFixed(2)}</p>
          </div>

          <div class="botoes-add-obs">
            ${item.adicionais?.length ? `<p class="carrinho-adicional">➕  ${item.adicionais.join(", ")}</p>` : ""}
            ${item.obs ? `<p class="carrinho-obs">📝 ${item.obs}</p>` : ""}
          </div>


          <div class="carrinho-card-footer">
            <div class="carrinho-quantidade-produto">
              <button class="botao-menos" onclick="alterarQtdCarrinho(${i}, -1)">-</button>
              ${item.qtd}
              <button class="botao-mais" onclick="alterarQtdCarrinho(${i}, 1)">+</button>
            </div>

            <div>
              <button class="botao-excluir" onclick="removerItem(${i})">🗑️</button>
            </div>
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

  salvarCarrinho();
  renderCarrinho();
}

function removerItem(i) {
  carrinho.splice(i, 1);
  salvarCarrinho();
  renderCarrinho();
}

function toggleCart() {
  document.getElementById("cartSidebar").classList.toggle("active");
}

// ================= FINALIZAR PEDIDO =================

function finalizarPedido() {
  const user = firebase.auth().currentUser;
  if (!user) return alert("Faça login!");

  const nome = document.getElementById("c-nome").value;
  const numero = document.getElementById("c-numero").value;
  const observacao = document.getElementById("c-obs").value;
  const pagamento = document.getElementById("c-pagto").value;

  if (!nome || !numero) return alert("Preencha nome e número!");
  if (carrinho.length === 0) return alert("Carrinho vazio!");

  let total = 0;
  let textoItens = "";

  carrinho.forEach((item, index) => {
    const subtotal = item.precoUn * item.qtd;
    total += subtotal;

    textoItens += `\n${index + 1}. ${item.nome}
Qtd: ${item.qtd}
Obs: ${item.obs || "Nenhuma"}
Subtotal: R$ ${subtotal.toFixed(2)}\n`;
  });

  db.collection("pedidos")
    .add({
      uid: user.uid,
      nome,
      numero,
      observacaoGeral: observacao,
      pagamento,
      itens: carrinho,
      total,
      status: "pendente",
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
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
      const url = `https://wa.me/${numeroLanchonete}?text=${encodeURIComponent(
        mensagem,
      )}`;

      carrinho = [];
      salvarCarrinho();
      renderCarrinho();

      window.open(url, "_blank");
      alert("Pedido enviado com sucesso!");
    })
    .catch((error) => {
      console.error("Erro ao salvar pedido:", error);
    });
}

function voltarPagina() {
  window.history.back();
}

// ================= AUTO RENDER AO ABRIR =================

document.addEventListener("DOMContentLoaded", () => {
  renderCarrinho();
});
