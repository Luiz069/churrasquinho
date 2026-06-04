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

// 🚪 LOGOUT

function sair() {
  localStorage.removeItem("usuario");

  mostrarToast("Logout realizado!");

  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}

// ========== TESTE COD Nfrango ==========

// Máscara inteligente

const inputTelefone = document.getElementById("telefone");

if (inputTelefone) {
  inputTelefone.addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "");

    if (v.length > 11) v = v.slice(0, 11);

    if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
    else if (v.length > 2) v = v.replace(/(\d{2})(\d+)/, "($1) $2");
    else if (v.length > 0) v = v.replace(/(\d+)/, "($1");

    e.target.value = v;
  });
}

// LOGIN

function entrar() {
  let nome = document.getElementById("nome").value;

  let telefone = document.getElementById("telefone").value.replace(/\D/g, "");

  if (!nome || !telefone) {
    alert("Preencha tudo!");

    return;
  }

  const user = {
    nome,

    telefone,

    pedidos: JSON.parse(localStorage.getItem("pedidos")) || [],
  };

  mostrarToast("Login realizado com sucesso!");

  // salva usuário

  localStorage.setItem("usuario", JSON.stringify(user));

  // esconde login

  document.getElementById("loginBox").style.display = "none";

  // mostra app

  document.getElementById("app").classList.remove("hidden");

  iniciarApp();
}

// ================= INICIAR APP =================

function iniciarApp() {
  document.getElementById("loginBox").style.display = "none";

  document.getElementById("app").classList.remove("hidden");

  // pega usuário salvo
  const user = JSON.parse(localStorage.getItem("usuario"));

  // ================= NOME PERFIL =================

  const spanNome = document.getElementById("cliente-nome");

  if (spanNome && user) {
    spanNome.innerText = user.nome;
  }

  // ================= BANNER NOME =================

  const bannerNome = document.getElementById("banner-nome");

  if (bannerNome && user) {
    bannerNome.innerText = `${user.nome}! 👋`;
  }

  // ================= INPUTS CARRINHO =================

  const inputNome = document.getElementById("c-nome");

  const inputTelefone = document.getElementById("c-numero");

  if (user) {
    // preenche nome

    if (inputNome) {
      inputNome.value = user.nome;
    }

    // preenche telefone

    if (inputTelefone) {
      inputTelefone.value = user.telefone;
    }
  }

  // ==================================================
  // =========== FECHAR MODAIS AO INICIAR =============
  const modalItem = document.getElementById("modalItem");
  const modalBebida = document.getElementById("modalBebida");
  const modalEditarPerfil = document.getElementById("modalEditarPerfil");

  if (modalItem) {
    modalItem.style.display = "none";
  }

  if (modalBebida) {
    modalBebida.style.display = "none";
  }

  if (modalEditarPerfil) {
    modalEditarPerfil.classList.remove("active");
  }

  // ================= RENDERS =================

  renderCarrinho();
  carregarDadosPerfil();
  carregarHistorico();
}

// ====================================

// ================= CARRINHO (AGORA PERSISTENTE) =================

// 🔥 Carrega do localStorage

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// ================= VARIÁVEIS DO MODAL =================

let itemAtual = {};

let qtdModal = 1;

let extras = {
  bacon: false,
  queijo: false,
  frango: false,
  calabresa: false,
  ovo: false,
  carneCaseira: false,
  carneIndustrial: false,
  catupiry: false,
};

const precosExtras = {
  bacon: 4.0,
  queijo: 3.0,
  frango: 4.0,
  calabresa: 3.0,
  ovo: 3.0,
  carneCaseira: 4.0,
  carneIndustrial: 3.0,
  catupiry: 4.0,
};

let valorPagamento = "";

let metodoConsumo = ""; // 👈 Nfrango

// ================= MODAL PRODUTO =================

function abrirModal(nome, preco, desc, imagem) {
  itemAtual = {
    nome,
    preco,
    desc,
    imagem,
  };

  qtdModal = 1;

  extras = {
    bacon: false,
    queijo: false,
    frango: false,
    calabresa: false,
    ovo: false,
    carneCaseira: false,
    carneIndustrial: false,
    catupiry: false,
  };

  setTimeout(() => {
    document
      .querySelectorAll('.adicionais-container input[type="checkbox"]')
      .forEach((checkbox) => {
        checkbox.checked = false;
      });
  }, 50);

  document.getElementById("m-nome").innerText = nome;

  document.getElementById("m-desc").innerText = desc;

  document.getElementById("m-img").src = imagem;

  document.getElementById("m-obs").value = "";

  // atualiza apenas quantidade
  document.getElementById("m-qtd-val").innerText = qtdModal;

  // subtotal inicial
  document.getElementById("m-subtotal").innerText = itemAtual.preco.toFixed(2);

  document.getElementById("modalItem").style.display = "flex";
}

function mudarQtdModal(val) {
  if (qtdModal + val >= 1) {
    qtdModal += val;

    atualizarInterfaceModal();
  }
}

function capturarExtras() {
  extras.bacon = document.getElementById("extra-bacon")?.checked || false;

  extras.queijo = document.getElementById("extra-queijo")?.checked || false;

  extras.frango = document.getElementById("extra-frango")?.checked || false;

  extras.ovo = document.getElementById("extra-ovo")?.checked || false;

  extras.carneCaseira =
    document.getElementById("extra-carneCaseira")?.checked || false;

  extras.carneIndustrial =
    document.getElementById("extra-carneIndustrial")?.checked || false;

  extras.catupiry = document.getElementById("extra-catupiry")?.checked || false;

  extras.calabresa =
    document.getElementById("extra-calabresa")?.checked || false;
}

function atualizarInterfaceModal() {
  capturarExtras();

  let custoExtras = 0;

  Object.keys(extras).forEach((key) => {
    if (extras[key]) {
      custoExtras += precosExtras[key];
    }
  });

  let total = (itemAtual.preco + custoExtras) * qtdModal;

  document.getElementById("m-qtd-val").innerText = qtdModal;

  document.getElementById("m-subtotal").innerText = total.toFixed(2);
}

function fecharModal() {
  document.getElementById("modalItem").style.display = "none";
}

// ================= MODAL BEBIDAS =================

let bebidaSelecionada = null;
let qtdBebida = 1;

function abrirModalBebidas(nome, imagem, opcoes) {
  itemAtual = {
    nome,
    imagem,
  };

  bebidaSelecionada = null;
  qtdBebida = 1;

  document.getElementById("m-nome-bebida").innerText = nome;

  document.getElementById("m-img-bebida").src = imagem;

  document.getElementById("bebida-qtd").innerText = qtdBebida;

  const container = document.getElementById("bebida-opcoes");

  container.innerHTML = "";

  opcoes.forEach((op, index) => {
    container.innerHTML += `
    <label class="add-card">

      <div class="add-left">

        <label class="checkbox-custom">
          <input
            class="bebida-checkbox"
            type="checkbox"
            onchange="selecionarBebida(this, '${op.nome}', ${op.preco})"
          >
          <span></span>
        </label>

        <span class="add-texto">
          ${op.nome}
        </span>

      </div>

      <span class="add-preco">
        + R$ ${op.preco.toFixed(2)}
      </span>

    </label>
    `;
  });

  document.getElementById("m-total-bebida").innerText = "0.00";

  document.getElementById("modalBebida").style.display = "flex";
}

function selecionarBebida(input, nome, preco) {
  document.querySelectorAll(".checkbox-bebida").forEach((cb) => {
    if (cb !== input) {
      cb.checked = false;
      cb.parentElement.classList.remove("ativo");
    }
  });

  if (input.checked) {
    input.parentElement.classList.add("ativo");

    bebidaSelecionada = {
      nome,
      preco,
    };
  } else {
    input.parentElement.classList.remove("ativo");
    bebidaSelecionada = null;
  }

  atualizarTotalBebida();
}

function alterarQtdBebida(valor) {
  if (qtdBebida + valor < 1) return;

  qtdBebida += valor;

  document.getElementById("bebida-qtd").innerText = qtdBebida;

  atualizarTotalBebida();
}

function atualizarTotalBebida() {
  if (!bebidaSelecionada) {
    document.getElementById("m-total-bebida").innerText = "0.00";
    return;
  }

  const total = bebidaSelecionada.preco * qtdBebida;

  document.getElementById("m-total-bebida").innerText = total.toFixed(2);
}

function fecharModalBebida() {
  document.getElementById("modalBebida").style.display = "none";
}

function addBebidaCarrinho() {
  if (!bebidaSelecionada) {
    mostrarToast("Selecione uma bebida!", "warning");
    return;
  }

  carrinho.push({
    nome: `${itemAtual.nome} - ${bebidaSelecionada.nome}`,

    qtd: qtdBebida,

    obs: "",

    adicionais: [],

    precoUn: bebidaSelecionada.preco,

    imagem: itemAtual.imagem,
  });

  salvarCarrinho();

  renderCarrinho();

  mostrarToast("Bebida adicionada!");

  fecharModalBebida();
}

// ================= ADICIONAR AO CARRINHO =================

function addAoCarrinho() {
  capturarExtras();

  let listaExtras = [];
  let custoExtras = 0;

  if (extras.bacon) {
    listaExtras.push("Bacon extra");
    custoExtras += precosExtras.bacon;
  }

  if (extras.queijo) {
    listaExtras.push("Queijo extra");
    custoExtras += precosExtras.queijo;
  }

  if (extras.frango) {
    listaExtras.push("frango frito");
    custoExtras += precosExtras.frango;
  }

  if (extras.ovo) {
    listaExtras.push("ovo ");
    custoExtras += precosExtras.ovo;
  }

  if (extras.carneCaseira) {
    listaExtras.push("carneCaseira");
    custoExtras += precosExtras.carneCaseira;
  }

  if (extras.carneIndustrial) {
    listaExtras.push("carneIndustrial");
    custoExtras += precosExtras.carneIndustrial;
  }

  if (extras.catupiry) {
    listaExtras.push("Catupiry");
    custoExtras += precosExtras.catupiry;
  }

  if (extras.calabresa) {
    listaExtras.push("Calabresa");
    custoExtras += precosExtras.calabresa;
  }

  carrinho.push({
    ...itemAtual,

    qtd: qtdModal,

    obs: document.getElementById("m-obs").value,

    adicionais: listaExtras,

    precoUn: itemAtual.preco + custoExtras,
  });

  salvarCarrinho();

  renderCarrinho();

  mostrarToast("Pedido adicionado à sacola!");

  fecharModal();
}

// ================= RENDER CARRINHO =================

function renderCarrinho() {
  const lista = document.getElementById("lista-carrinho");

  const dadosCliente = document.querySelector(".dados-cliente");

  const finalizarPedido = document.querySelector(".finalizar-pedido");

  if (!lista) return;

  lista.innerHTML = "";

  let totalGeral = 0;

  // ================= SACOLA VAZIA =================

  if (carrinho.length === 0) {
    lista.innerHTML = `

      <div class="sacola-vazia">

        <svg

          xmlns="http://www.w3.org/2000/svg"

          width="40"

          height="40"

          viewBox="0 0 24 24"

          fill="none"

          stroke="currentColor"

          stroke-width="2"

          stroke-linecap="round"

          stroke-linejoin="round"

          class="lucide lucide-shopping-bag"

        >

          <path

            d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"

          ></path>

          <path d="M3 6h18"></path>

          <path d="M16 10a4 4 0 0 1-8 0"></path>

        </svg>



        <p>Sua sacola está vazia.</p>

      </div>

    `;

    // esconder conteúdo

    if (dadosCliente) {
      dadosCliente.style.display = "none";
    }

    if (finalizarPedido) {
      finalizarPedido.style.display = "none";
    }

    const totalFinal = document.getElementById("total-final");

    const cartCount = document.getElementById("cart-count");

    if (totalFinal) {
      totalFinal.innerText = "0,00";
    }

    if (cartCount) {
      cartCount.innerText = "0";

      cartCount.style.display = "none";
    }

    return;
  }

  // ================= MOSTRAR CONTEÚDO =================

  if (dadosCliente) {
    dadosCliente.style.display = "flex";
  }

  if (finalizarPedido) {
    finalizarPedido.style.display = "flex";
  }

  // ================= ITENS =================

  carrinho.forEach((item, i) => {
    let sub = item.precoUn * item.qtd;

    totalGeral += sub;

    lista.innerHTML += `

      <div class="cart-item-card">

        <div class="carrinho-quantidade-produto">

            ${item.qtd}x

        </div>



        <div class="lanche-sacola">

          <p class="carrinho-nome-produto">

            ${item.nome}

          </p>



          ${
            item.adicionais?.length
              ? `

                <p class="carrinho-adicional">

                  ➕ ${item.adicionais.join(", ")}

                </p>

              `
              : ""
          }



          ${
            item.obs
              ? `

                <p class="carrinho-obs">

                  📝 ${item.obs}

                </p>

              `
              : ""
          }



        </div>



        <div class="total-e-excluir">

         <span class="sacola-subtotal-produto">

            R$ ${sub.toFixed(2)}

          </span>



          <button

            class="botao-excluir-sacola"

            onclick="removerItem(${i})"

          >

            <svg

              xmlns="http://www.w3.org/2000/svg"

              width="14"

              height="14"

              viewBox="0 0 24 24"

              fill="none"

              stroke="currentColor"

              stroke-width="2"

              stroke-linecap="round"

              stroke-linejoin="round"

              class="lucide lucide-trash2"

              data-loc="client/src/components/CartModal.tsx:153"

            >

              <path d="M3 6h18"></path>

              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>

              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>

              <line x1="10" x2="10" y1="11" y2="17"></line>

              <line x1="14" x2="14" y1="11" y2="17"></line>

            </svg>

          </button>



        </div>



      </div>

    `;
  });

  // ================= TOTAL =================

  const totalFinal = document.getElementById("total-final");

  const cartCount = document.getElementById("cart-count");

  if (totalFinal) {
    totalFinal.innerText = totalGeral.toFixed(2);
  }

  if (cartCount) {
    cartCount.innerText = carrinho.length;

    // mostra apenas se tiver item

    if (carrinho.length > 0) {
      cartCount.style.display = "flex";
    } else {
      cartCount.style.display = "none";
    }
  }
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

// ================= FINALIZAR PEDIDO =================

function finalizarPedido() {
  // ================= USUÁRIO =================

  const user = JSON.parse(localStorage.getItem("usuario"));

  if (!user) {
    alert("Faça login!");

    return;
  }

  // ================= CAMPOS =================

  const nome = document.getElementById("c-nome")?.value || "";

  const numero = document.getElementById("c-numero")?.value || "";

  const observacao = document.getElementById("c-obs")?.value || "";

  const troco = document.getElementById("input-troco")?.value || "";

  // ================= VALIDAÇÕES =================

  if (!valorPagamento) {
    alert("Selecione uma forma de pagamento!");

    return;
  }

  if (!metodoConsumo) {
    alert("Selecione o método de consumo!");

    return;
  }

  if (carrinho.length === 0) {
    alert("Carrinho vazio!");

    return;
  }

  // ================= TOTAL =================

  let total = 0;

  let textoItens = "";

  carrinho.forEach((item) => {
    const subtotal = item.precoUn * item.qtd;

    total += subtotal;

    textoItens += `➡️ ${item.qtd}x ${item.nome}\n`;

    // adicionais

    if (item.adicionais?.length > 0) {
      textoItens += `➕ ${item.adicionais.join(" | ")}\n`;
    }

    // observação

    if (item.obs) {
      textoItens += `📝 ${item.obs}\n`;
    }

    textoItens += "";
  });

  // ================= EMOJIS =================

  let emojiPagamento = "💳";

  if (valorPagamento.includes("Pix")) {
    emojiPagamento = "🏦";
  }

  if (valorPagamento.includes("Dinheiro")) {
    emojiPagamento = "💵";
  }

  const emojiEntrega = metodoConsumo === "local" ? "🍽️" : "🏪";

  // ================= NÚMERO PEDIDO =================

  const numeroPedidoAleatorio = Math.floor(10000 + Math.random() * 90000);

  // ================= FIREBASE =================

  db.collection("pedidos")

    .add({
      uid: user.telefone,

      nome: nome,

      numeroCelular: numero,

      pedidoNumero: numeroPedidoAleatorio,

      observacaoGeral: observacao,

      pagamento: valorPagamento,

      troco: troco || null,

      consumo: metodoConsumo,

      itens: carrinho,

      total: total,

      status: "pendente",

      criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
    })

    .then(() => {
      // ================= WHATSAPP =================

      const mensagem = `*PEDIDO Nº ${numeroPedidoAleatorio}* 🍔
👤 *Cliente:* ${nome}

📦 *Itens:*
    ${textoItens}
${emojiPagamento} *Pagamento:* ${valorPagamento}
${troco ? `💵 Troco para: R$ ${troco}` : ""}
${emojiEntrega} *Consumo:* ${metodoConsumo === "local" ? "Comer no local" : "Retirada"}
⏱️ Estimativa: 35~45 min
💰 *Total: R$ ${total.toFixed(2)}*

Obrigado pela preferência 😉`;

      const numeroLanchonete = "5598985213506";

      const url = `https://wa.me/${numeroLanchonete}?text=${encodeURIComponent(mensagem)}`;

      // ================= RESET CARRINHO =================

      carrinho = [];

      salvarCarrinho();

      renderCarrinho();

      // ================= RESET PAGAMENTO =================

      valorPagamento = "Pix";

      document.querySelectorAll(".btn-pagamento").forEach((btn) => {
        btn.classList.remove("active");
      });

      const btnPix = document.querySelector('.btn-pagamento[data-value="Pix"]');

      if (btnPix) {
        btnPix.classList.add("active");
      }

      // ================= RESET CONSUMO =================

      metodoConsumo = "retirada";

      const btnRetirada = document.getElementById("btn-retirada");

      const btnLocal = document.getElementById("btn-local");

      if (btnRetirada && btnLocal) {
        btnRetirada.classList.add("active");

        btnLocal.classList.remove("active");
      }

      // ================= RESET TROCO =================

      const inputTroco = document.getElementById("input-troco");

      if (inputTroco) {
        inputTroco.value = "";
      }

      // ================= ESCONDER BOXES =================

      const boxTroco = document.getElementById("box-troco");

      const taxaDebito = document.getElementById("taxa-debito");

      const taxaCredito = document.getElementById("taxa-credito");

      if (boxTroco) {
        boxTroco.style.display = "none";
      }

      if (taxaDebito) {
        taxaDebito.style.display = "none";
      }

      if (taxaCredito) {
        taxaCredito.style.display = "none";
      }

      mostrarToast("Pedido realizado com sucesso!");

      // ================= ABRIR WHATSAPP =================

      setTimeout(() => {
        window.location.href = url;
      }, 1500);
    })

    .catch((error) => {
      console.error("Erro ao salvar pedido:", error);

      mostrarToast("Erro ao processar pedido. Tente novamente.", "error");
    });
}

function voltarPagina() {
  window.history.back();
}

function selecionarPagamento(botao) {
  const botoes = document.querySelectorAll(".btn-pagamento");

  botoes.forEach((btn) => {
    btn.classList.remove("active");
  });

  botao.classList.add("active");

  valorPagamento = botao.dataset.value;

  // BOXES

  const boxTroco = document.getElementById("box-troco");

  const taxaDebito = document.getElementById("taxa-debito");

  const taxaCredito = document.getElementById("taxa-credito");

  // RESET

  boxTroco.style.display = "none";

  taxaDebito.style.display = "none";

  taxaCredito.style.display = "none";

  // DINHEIRO

  if (valorPagamento === "Dinheiro") {
    boxTroco.style.display = "block";
  }

  // DÉBITO

  if (valorPagamento === "Débito") {
    taxaDebito.style.display = "block";
  }

  // CRÉDITO

  if (valorPagamento === "Crédito") {
    taxaCredito.style.display = "block";
  }
}

// ================= CONSUMO =================

metodoConsumo = "retirada";

function selecionarConsumo(tipo) {
  metodoConsumo = tipo;

  const btnRetirada = document.getElementById("btn-retirada");

  const btnLocal = document.getElementById("btn-local");

  btnRetirada.classList.remove("active");

  btnLocal.classList.remove("active");

  if (tipo === "retirada") {
    btnRetirada.classList.add("active");
  } else {
    btnLocal.classList.add("active");
  }
}

function carregarHistorico() {
  const user = JSON.parse(localStorage.getItem("usuario"));

  if (!user) return;

  const container = document.getElementById("historico");

  if (!container) return;

  container.innerHTML = `

    <div class="historico-vazio">

      <p>Carregando pedidos...</p>

    </div>

  `;

  // 🔥 BUSCA TODOS OS PEDIDOS

  db.collection("pedidos")

    .orderBy("criadoEm", "desc")

    .onSnapshot((snapshot) => {
      container.innerHTML = "";

      // filtra pedidos do usuário

      const pedidosUsuario = [];

      snapshot.forEach((doc) => {
        const pedido = doc.data();

        // compatibilidade antiga e nova

        if (
          pedido.uid === user.telefone ||
          pedido.numeroCelular === user.telefone
        ) {
          pedidosUsuario.push(pedido);
        }
      });

      // ================= SEM PEDIDOS =================

      if (pedidosUsuario.length === 0) {
        container.innerHTML = `

          <div class="historico-vazio">
            <svg

              xmlns="http://www.w3.org/2000/svg"

              width="46"

              height="46"

              viewBox="0 0 24 24"

              fill="none"

              stroke="currentColor"

              stroke-width="1.8"

              stroke-linecap="round"

              stroke-linejoin="round"

            >

              <circle cx="12" cy="12" r="10"></circle>

              <polyline points="12 6 12 12 16 14"></polyline>

            </svg>



            <p>Nenhum pedido realizado ainda</p>



          </div>

        `;

        return;
      }

      // ================= PEDIDOS =================

      pedidosUsuario.forEach((pedido) => {
        let itensHTML = "";

        pedido.itens.forEach((item) => {
          itensHTML += `

            <div class="item-historico">

              <div class="item-info">

                <p class="item-nome-historico">${item.qtd}x ${item.nome}</p>



                ${
                  item.adicionais?.length
                    ? `

                <p class="item-adicional-historico">+ ${item.adicionais.join(", ")}</p>

                `
                    : ""
                } ${
                  item.obs
                    ? `

                <p class="observacao-historico-item">Obs: ${item.obs}</p>

                `
                    : ""
                }

              </div>

            </div>

          `;
        });

        const data = pedido.criadoEm
          ? new Date(pedido.criadoEm.toDate()).toLocaleString()
          : "";

        container.innerHTML += `
          <div class="pedido-card">
            <div class="pedido-container">

              <div class="pedido-topo">
                <h3>Aguardando</h3>

                <span class="data-historico">
                  ${data}
                </span>
              </div>

              <div class="total-historico">
                R$ ${pedido.total.toFixed(2)}
              </div>

              <div class="itens-box">
                ${itensHTML}
              </div>

              <button
                class="btn-repetir"
                onclick='repetirPedido(${JSON.stringify(pedido.itens)})'
              >
                Repetir pedido
              </button>

            </div>
          </div>
        `;
      });
    });
}

function repetirPedido(itens) {
  // adiciona itens novamente ao carrinho

  carrinho = [...itens];

  // salva carrinho

  salvarCarrinho();

  // mostra toast na home

  localStorage.setItem("repetirPedido", "true");

  // fecha perfil

  fecharPerfil();

  // redireciona para home

  window.location.href = "index.html";
}

function mostrarToast(msg, tipo = "success") {
  const toast = document.getElementById("toast");
  const texto = document.getElementById("toast-text");
  const icon = document.getElementById("toast-icon");

  if (!toast || !texto || !icon) return;

  // limpa classes
  toast.classList.remove("success", "warning", "error");

  // adiciona tipo
  toast.classList.add(tipo);

  // texto
  texto.textContent = msg;

  // ícones
  if (tipo === "success") {
    icon.innerHTML = "✓";
  }

  if (tipo === "warning") {
    icon.innerHTML = "!";
  }

  if (tipo === "error") {
    icon.innerHTML = "✕";
  }

  toast.classList.add("show");

  clearTimeout(window.toastTimeout);

  window.toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ============== BOTÃO DE RODAR OS CARROCEL ===================

function scrollCarrossel(id, direction) {
  const el = document.getElementById(id);

  el.scrollBy({
    left: direction * 200,

    behavior: "smooth",
  });
}

// ============== BOTÃO DE MUDA DE COR A NAVBAR ===================

const botoes = document.querySelectorAll(".botao-nav");

const botaoHome = document.querySelector(".button-home");

// ================= BOTÕES NAV =================

botoes.forEach((botao) => {
  botao.addEventListener("click", () => {
    // ================= HOME =================

    if (botao.classList.contains("button-home")) {
      fecharCart();

      fecharPerfil();

      botoes.forEach((b) => b.classList.remove("ativo"));

      botao.classList.add("ativo");
    }

    // ================= SACOLA =================
    else if (botao.classList.contains("button-sacola")) {
      fecharPerfil();

      abrirCart();

      botoes.forEach((b) => b.classList.remove("ativo"));

      botao.classList.add("ativo");
    }

    // ================= PERFIL =================
    else if (botao.classList.contains("button-perfil")) {
      fecharCart();

      abrirPerfil();

      botoes.forEach((b) => b.classList.remove("ativo"));

      botao.classList.add("ativo");
    }
  });
});

// ================= CART =================

function abrirCart() {
  const cartSidebar = document.getElementById("cartSidebar");

  if (cartSidebar) {
    cartSidebar.classList.add("active");
  }
}

function fecharCart() {
  const cartSidebar = document.getElementById("cartSidebar");

  if (cartSidebar) {
    cartSidebar.classList.remove("active");
  }

  // REMOVE TODOS

  botoes.forEach((b) => b.classList.remove("ativo"));

  // ATIVA HOME

  if (botaoHome) {
    botaoHome.classList.add("ativo");
  }
}

// ====================================================================================

// ================= ABRIR PERFIL =================

function abrirPerfil() {
  const perfilSidebar = document.getElementById("perfilSidebar");

  if (perfilSidebar) {
    perfilSidebar.classList.add("active");
  }

  carregarDadosPerfil();
}

// ================= FECHAR PERFIL =================

function fecharPerfil() {
  const perfilSidebar = document.getElementById("perfilSidebar");

  if (perfilSidebar) {
    perfilSidebar.classList.remove("active");
  }

  botoes.forEach((b) => b.classList.remove("ativo"));

  if (botaoHome) {
    botaoHome.classList.add("ativo");
  }
}

// ================= DADOS PERFIL =================

function carregarDadosPerfil() {
  const user = JSON.parse(localStorage.getItem("usuario"));

  if (!user) return;

  const nome = document.getElementById("perfil-nome");
  const telefone = document.getElementById("perfil-telefone");

  const avatarPerfil = document.getElementById("avatar-letra-perfil");
  const avatarInicio = document.getElementById("avatar-letra-inicio");

  const inicial = user.nome.charAt(0).toUpperCase();

  // nome
  if (nome) {
    nome.innerText = user.nome;
  }

  // telefone
  if (telefone) {
    telefone.innerText = formatarTelefone(user.telefone);
  }

  // avatar perfil
  if (avatarPerfil) {
    avatarPerfil.innerText = inicial;
  }

  // avatar início
  if (avatarInicio) {
    avatarInicio.innerText = inicial;
  }
}

// ================= EDITAR PERFIL =================

function editarPerfil() {
  const user = JSON.parse(localStorage.getItem("usuario"));

  if (!user) return;

  const nfrangoNome = prompt("Digite seu nfrango nome:", user.nome);

  if (!nfrangoNome || nfrangoNome.trim() === "") {
    return;
  }

  // atualiza objeto

  user.nome = nfrangoNome.trim();

  // salva

  localStorage.setItem("usuario", JSON.stringify(user));

  // atualiza modal

  document.getElementById("perfil-nome").innerText = user.nome;

  // atualiza home

  const clienteNome = document.getElementById("cliente-nome");

  if (clienteNome) {
    clienteNome.innerText = user.nome;
  }

  // atualiza avatar

  const avatar = document.getElementById("avatar-letra");

  if (avatar) {
    avatar.innerText = user.nome.charAt(0).toUpperCase();
  }
}

// ================= FORMATAR TELEFONE =================

function formatarTelefone(numero) {
  numero = numero.replace(/\D/g, "");

  return numero.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

// ================= AUTO LOGIN =================

document.addEventListener("DOMContentLoaded", () => {
  const usuarioSalvo = localStorage.getItem("usuario");

  // se tiver usuário salvo
  if (usuarioSalvo) {
    iniciarApp();
  } else {
    // mostra login
    const loginBox = document.getElementById("loginBox");

    if (loginBox) {
      loginBox.style.display = "flex";
    }
  }

  // render carrinho
  renderCarrinho();

  // toast repetir pedido
  if (localStorage.getItem("repetirPedido")) {
    mostrarToast("🔁 Pedido carregado novamente!");
    localStorage.removeItem("repetirPedido");
  }
});

// ========================================================

// ================= ABRIR MODAL =================

function abrirModalPerfil() {
  const user = JSON.parse(localStorage.getItem("usuario"));

  if (!user) return;

  document.getElementById("editar-nome").value = user.nome || "";

  document.getElementById("modalEditarPerfil").classList.add("active");
}

// ================= FECHAR MODAL =================

function fecharModalPerfil() {
  document.getElementById("modalEditarPerfil").classList.remove("active");
}

// ================= SALVAR NOME =================

function salvarPerfilEditado() {
  const nfrangoNome = document.getElementById("editar-nome").value;

  if (!nfrangoNome) {
    alert("Digite um nome!");

    return;
  }

  const user = JSON.parse(localStorage.getItem("usuario"));

  user.nome = nfrangoNome;

  localStorage.setItem("usuario", JSON.stringify(user));

  // atualiza perfil

  const perfilNome = document.getElementById("perfil-nome");

  if (perfilNome) {
    perfilNome.innerText = nfrangoNome;
  }

  // atualiza input carrinho

  const inputNome = document.getElementById("c-nome");

  if (inputNome) {
    inputNome.value = nfrangoNome;
  }

  fecharModalPerfil();

  // atualiza banner
  const bannerNome = document.getElementById("banner-nome");

  if (bannerNome) {
    bannerNome.innerText = `${nfrangoNome}! 👋`;
  }

  mostrarToast("✅ Nome atualizado!");
}

// ================= FECHAR AO CLICAR FORA =================

window.addEventListener("click", (e) => {
  const modal = document.getElementById("modalEditarPerfil");

  if (e.target === modal) {
    fecharModalPerfil();
  }
});

// ========================================================
function mostrarNome() {
  const telefone = document.getElementById("telefone").value;
  const nomeArea = document.getElementById("nomeArea");

  // remove tudo que não for número
  const numeros = telefone.replace(/\D/g, "");

  // mostra o nome após começar digitar
  if (numeros.length > 0) {
    nomeArea.style.display = "block";
  } else {
    nomeArea.style.display = "none";
  }

  // máscara telefone
  let valor = numeros;

  if (valor.length > 11) valor = valor.slice(0, 11);

  valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
  valor = valor.replace(/(\d{5})(\d)/, "$1-$2");

  document.getElementById("telefone").value = valor;
}

// atualizar subtotal automaticamente ao marcar extras
document.addEventListener("change", (e) => {
  if (e.target.matches('.adicionais-container input[type="checkbox"]')) {
    atualizarInterfaceModal();
  }
});
