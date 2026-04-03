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

//  🔒 VERIFICA LOGIN
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    carregarHistorico(); // 👈 AQUI
  }
});

// 🚪 LOGOUT
function sair() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}

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
let valorPagamento = "";

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

// ================ MODAL BEBIDAS ===============
let bebidaSelecionada = null;

function abrirModalBebidas(nome, opcoes) {
  itemAtual = { nome };
  bebidaSelecionada = null;

  document.getElementById("m-nome-bebida").innerText = nome;

  const container = document.getElementById("bebida-opcoes");
  container.innerHTML = "";

  opcoes.forEach((op) => {
    container.innerHTML += `
      <div class="opcao-bebida" onclick="selecionarBebida('${op.nome}', ${op.preco}, this)">
        <div>${op.nome}</div> 
        <div>R$ ${op.preco.toFixed(2)}</div>
      </div>
    `;
  });

  document.getElementById("m-total-bebida").innerText = "0.00";

  document.getElementById("modalBebida").style.display = "flex";
}

function selecionarBebida(nome, preco, el) {
  bebidaSelecionada = { nome, preco };

  // remove seleção anterior
  document
    .querySelectorAll(".opcao-bebida")
    .forEach((e) => e.classList.remove("ativo"));

  // adiciona seleção
  el.classList.add("ativo");

  document.getElementById("m-total-bebida").innerText = preco.toFixed(2);
}

function fecharModalBebida() {
  document.getElementById("modalBebida").style.display = "none";
}

function addBebidaCarrinho() {
  if (!bebidaSelecionada) {
    alert("Selecione uma bebida!");
    return;
  }

  carrinho.push({
    nome: itemAtual.nome + " (" + bebidaSelecionada.nome + ")",
    qtd: 1,
    obs: "",
    adicionais: [],
    precoUn: bebidaSelecionada.preco,
  });

  salvarCarrinho();
  renderCarrinho();
  fecharModalBebida();
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
              <button class="botao-menos" onclick="alterarQtdCarrinho(${i}, -1)">
                <svg class="botao-menos-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8"/>
                </svg>
              </button>
              <p class="numero-qtd">${item.qtd}</p>
              <button class="botao-mais" onclick="alterarQtdCarrinho(${i}, 1)">
                <svg class="botao-mais-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
                </svg>
              </button>
            </div>

            <div>
              <button class="botao-excluir" onclick="removerItem(${i})">
                <svg class="lixeira" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                </svg>
              </button>
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

  if (!nome || !numero) return alert("Preencha nome e número!");
  if (!valorPagamento) return alert("Selecione uma forma de pagamento!");
  if (carrinho.length === 0) return alert("Carrinho vazio!");

  let total = 0;
  let textoItens = "";

  carrinho.forEach((item) => {
    const subtotal = item.precoUn * item.qtd;
    total += subtotal;

    textoItens += `➡️ ${item.qtd}x ${item.nome}\n`;

    // Sabores / adicionais
    if (item.adicionais && item.adicionais.length > 0) {
      textoItens += `_➕_ ${item.adicionais.join(" | ")}\n`;
    }

    // Observação do item
    if (item.obs) {
      textoItens += `📝 ${item.obs}\n`;
    }

    textoItens += "\n";
  });

  // 🔥 EMOJIS DINÂMICOS
  let emojiPagamento = "";
  let emojiEntrega = "🏪";

  if (valorPagamento.toLowerCase().includes("cart")) {
    emojiPagamento = "💳";
  } else if (valorPagamento.toLowerCase().includes("din")) {
    emojiPagamento = "💵";
  } else if (valorPagamento.toLowerCase().includes("pix")) {
    emojiPagamento = "🏦";
  }

  // 1. Gerar o número de 5 dígitos ANTES de salvar, para usar no Firestore e no WhatsApp
  const numeroPedidoAleatorio = Math.floor(10000 + Math.random() * 90000);

  // 2. Salvar no Firebase
  db.collection("pedidos")
    .add({
      uid: user.uid,
      nome: nome,
      numeroCelular: numero, // Renomeado para clareza (celular do cliente)
      pedidoNumero: numeroPedidoAleatorio, // O número de 5 dígitos
      observacaoGeral: observacao,
      pagamento: valorPagamento,
      itens: carrinho,
      total: total,
      status: "pendente", // Mantido em minúsculo para bater com os filtros do painel
      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      // 3. Criar a mensagem do WhatsApp usando o MESMO número gerado acima
      const mensagem = `*PEDIDO Nº ${numeroPedidoAleatorio}* 🍔

*Cliente:* ${nome}
*Itens:*
${textoItens}

*Pagamento:* ${valorPagamento}
*Entrega:* 🛵 Retirada no local
(Estimativa: 35~45 min)

💰 *Total: R$ ${total.toFixed(2)}*

Obrigado pela preferência! 😉`;

      const numeroLanchonete = "5598985301953";
      const url = `https://wa.me/${numeroLanchonete}?text=${encodeURIComponent(mensagem)}`;

      // 4. Limpeza da interface
      carrinho = [];
      if (typeof salvarCarrinho === "function") salvarCarrinho();
      if (typeof renderCarrinho === "function") renderCarrinho();

      // Reset campo pagamento
      valorPagamento = "";
      const displayPagamento = document.querySelector(
        "#pagamento-select .selected",
      );
      if (displayPagamento) displayPagamento.textContent = "Forma de pagamento";

      // 5. Ações finais
      window.open(url, "_blank");
      alert(`Pedido nº ${numeroPedidoAleatorio} enviado com sucesso!`);
    })
    .catch((error) => {
      console.error("Erro ao salvar pedido:", error);
      alert("Erro ao processar pedido. Tente novamente.");
    });
}

function voltarPagina() {
  window.history.back();
}

const select = document.getElementById("pagamento-select");

if (select) {
  const selected = select.querySelector(".selected");
  const options = select.querySelectorAll(".options div");

  // abrir/fechar
  selected.addEventListener("click", () => {
    select.classList.toggle("active");
  });

  // selecionar opção
  options.forEach((option) => {
    option.addEventListener("click", () => {
      selected.textContent = option.textContent;
      valorPagamento = option.dataset.value;
      select.classList.remove("active");
    });
  });

  // fechar ao clicar fora
  document.addEventListener("click", (e) => {
    if (!select.contains(e.target)) {
      select.classList.remove("active");
    }
  });
}

function carregarHistorico() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const container = document.getElementById("historico");

  db.collection("pedidos")
    .where("uid", "==", user.uid)
    .orderBy("criadoEm", "desc")
    .onSnapshot((snapshot) => {
      container.innerHTML = "";

      snapshot.forEach((doc) => {
        const pedido = doc.data();

        // ITENS DO PEDIDO
        let itensHTML = "";
        pedido.itens.forEach((item) => {
          itensHTML += `
            <div class="item-historico">
              <div class="item-info">
                <strong><p class="item-nome-historico">${item.qtd}x ${item.nome}</p></strong>
                <p class="observacao-historico-item">
                  ${item.obs || ""}
                </p>
              </div>
              <span class="item-preco">R$ ${(item.precoUn * item.qtd).toFixed(2)}</span>
            </div>

              <div class="linha-itens"></div>
          `;
        });

        let emojiPagamento = "💳";
        if (pedido.pagamento.includes("Dinheiro")) emojiPagamento = "💵";
        if (pedido.pagamento.includes("Pix")) emojiPagamento = "🏦";

        const data = pedido.criadoEm
          ? new Date(pedido.criadoEm.toDate()).toLocaleString()
          : "";

        container.innerHTML += `
          <div class="pedido-card">

            <div class="pedido-topo">
              <div>
                <h2>Pedido #${doc.id.slice(0, 8)}</h2>
                <div class="data-historico">📅 ${data}</div>
              </div>
              <div class="total-historico">R$ ${pedido.total.toFixed(2)}</div>
            </div>

            <div class="badges">
              <span class="status badge">
                <span class="ampulheta">⏳</span>
                ${pedido.status}
              </span>
              <span class="badge entrega">🏪 Retirada</span>
              <span class="badge pagamento">${emojiPagamento} ${pedido.pagamento}</span>
            </div>

            <div class="linha-historico"></div>

            <div class="box">
              <p class="itens-titulo-historico">📦 Itens:</p>
              ${itensHTML}

            </div>

              ${
                pedido.observacaoGeral
                  ? `
                <div class="obs-geral-historico">
                  <p class="observacao-historico-titulo">📝 Observação Geral</p>
                  <p class="observacao-historico">${pedido.observacaoGeral}</p>
                </div>
              `
                  : ""
              }

            <div class="box cliente">
              <strong class="cliente-historico"><p>👤 Cliente:</p></strong>
              <div class="cliente-info">
                <p><strong>Nome:</strong> ${pedido.nome}</p>
                <p><strong>Telefone:</strong> ${pedido.numeroCelular}</p>
              </div>
            </div>

            <button class="btn-repetir" onclick='repetirPedido(${JSON.stringify(pedido.itens)})'>
              🔁 Repetir pedido
            </button>

          </div>
        `;
      });
    });
}

function repetirPedido(itens) {
  carrinho = [...itens];

  salvarCarrinho();

  // 🔥 ativa mensagem ao chegar na home
  localStorage.setItem("repetirPedido", "true");

  // redireciona
  window.location.href = "inicio.html";
}

document.addEventListener("DOMContentLoaded", () => {
  renderCarrinho();

  // 🔥 VERIFICA SE VEIO DO "REPETIR PEDIDO"
  if (localStorage.getItem("repetirPedido")) {
    mostrarToast("🔁 Pedido carregado novamente!");
    localStorage.removeItem("repetirPedido");
  }
});

function mostrarToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ================= AUTO RENDER AO ABRIR =================

document.addEventListener("DOMContentLoaded", () => {
  renderCarrinho();
});
