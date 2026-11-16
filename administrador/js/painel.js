// 1. CONFIGURAÇÃO (Mantida original)
const firebaseConfig = {
  apiKey: "AIzaSyAcv5sSPj2yUtw0CUJHbZpF0TTfEyshyiQ",
  authDomain: "churrasquinho-7b2d2.firebaseapp.com",
  projectId: "churrasquinho-7b2d2",
  storageBucket: "churrasquinho-7b2d2.firebasestorage.app",
  messagingSenderId: "506815282983",
  appId: "1:506815282983:web:92d14f09bafa15e2d03302",
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const somNovoPedido = new Audio(
  "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
);
let primeiraCarga = true;
let todosPedidos = [];
let filtroStatus = "pendente";

// --- NOVO: BANCO DE DADOS DE PRODUTOS PARA EDIÇÃO ---
const PRODUTOS_DB = {
  Industrial: [
    { nome: "X-burguer", preco: 8.0 },
    { nome: "Egg-burguer", preco: 8.0 },
    { nome: "Americano", preco: 10.0 },
    { nome: "X-bacon", preco: 13.0 },
    { nome: "Bauru", preco: 13.0 },
    { nome: "X-Tudo", preco: 15.0 },
    { nome: "X-Frango", preco: 15.0 },
    { nome: "X-Burguer Duplo", preco: 16.0 },
    { nome: "X-Bacon Especial", preco: 19.0 },
    { nome: "X-Tudão", preco: 22.0 },
  ],
  Artesanal: [
    { nome: "X-burguer", preco: 12.0 },
    { nome: "Egg-burguer", preco: 12.0 },
    { nome: "Americano", preco: 14.0 },
    { nome: "X-bacon", preco: 17.0 },
    { nome: "Bauru", preco: 17.0 },
    { nome: "X-Tudo", preco: 18.0 },
    { nome: "X-Frango", preco: 18.0 },
    { nome: "X-Burguer Duplo", preco: 19.0 },
    { nome: "X-Bacon Especial", preco: 22.0 },
    { nome: "X-Tudão", preco: 27.0 },
  ],
  Misto: [
    { nome: "Sem Ovo", preco: 5.0 },
    { nome: "Com Ovo", preco: 7.0 },
  ],
  HotDog: [
    { nome: "Normal", preco: 9.0 },
    { nome: "Com Bacon", preco: 12.0 },
    { nome: "Na Chapa", preco: 16.0 },
    { nome: "Especial", preco: 18.0 },
  ],
  Batata: [
    { nome: "1 porção", preco: 19.0 },
    { nome: "Meia porção", preco: 10.0 },
    { nome: "Especial", preco: 28.0 },
  ],
  Bebidas: [
    { nome: "Agua", preco: 3.0 },
    { nome: "Lata", preco: 5.0 },
    { nome: "1 Litro LS", preco: 6.0 },
    { nome: "1 Litro", preco: 8.0 },
    { nome: "2 Litros", preco: 13.0 },
  ],
  Adicional: [
    { nome: "Carne", preco: 3.0 },
    { nome: "Queijo", preco: 5.0 },
    { nome: "Ovo", preco: 6.0 },
    { nome: "Frango", preco: 8.0 },
  ],
};
let pedidoEmEdicao = null;

// 2. MONITORAMENTO DE LOGIN (Mantida original)
auth.onAuthStateChanged((user) => {
  if (user) {
    const isAdmin = user.email.toLowerCase() === "shirlianedurans@gmail.com";
    ouvirPedidos(user.uid, isAdmin);
  } else {
    window.location.href = "index.html";
  }
});

// 3. ESCUTAR PEDIDOS (Mantida original)
function ouvirPedidos(uid, isAdmin) {
  let query = db.collection("pedidos");
  if (!isAdmin) query = query.where("uid", "==", uid);

  query.onSnapshot(
    (snapshot) => {
      if (!primeiraCarga) {
        snapshot.docChanges().forEach((change) => {
          if (
            change.type === "added" &&
            change.doc.data().status === "pendente"
          ) {
            tocarAlerta();
          }
        });
      }

      todosPedidos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      todosPedidos.sort(
        (a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0),
      );
      primeiraCarga = false;
      atualizarContadores();
      renderizar();
    },
    (error) => console.error("Erro Firestore:", error),
  );
}

// Função para o botão de voltar
function voltarPagina() {
  // Tenta voltar para a página anterior no histórico
  if (window.history.length > 1) {
    window.history.back();
  } else {
    // Se não houver histórico, redireciona para a home
    window.location.href = "index.html";
  }
}

function tocarAlerta() {
  somNovoPedido.play().catch((e) => console.warn("Autoplay bloqueado!"));
}

function atualizarContadores() {
  const dataSelecionada = document.getElementById("dataFiltro").value;

  // Filtramos os pedidos pela data antes de contar os status
  const pedidosFiltradosPorData = todosPedidos.filter((p) => {
    if (!dataSelecionada) return true; // Se não tiver data, conta tudo
    if (!p.criadoEm) return false;
    const dataDoPedido = p.criadoEm.toDate().toLocaleDateString("sv-SE");
    return dataDoPedido === dataSelecionada;
  });

  document.getElementById("count-pendente").innerText =
    pedidosFiltradosPorData.filter((p) => p.status === "pendente").length;
  document.getElementById("count-preparo").innerText =
    pedidosFiltradosPorData.filter((p) => p.status === "preparo").length;
  document.getElementById("count-pronto").innerText =
    pedidosFiltradosPorData.filter((p) => p.status === "pronto").length;
}

// 5. RENDERIZAR (Atualizada apenas para incluir o ícone de lápis)
function renderizar() {
  const container = document.getElementById("pedidosContainer");
  const busca = document.getElementById("buscaInput").value.toLowerCase();
  const dataSelecionada = document.getElementById("dataFiltro").value;

  container.innerHTML = "";

  const filtrados = todosPedidos.filter((p) => {
    const matchStatus = p.status === filtroStatus;
    const nomeCliente = (p.nome || "").toLowerCase();
    const idPedido = String(p.pedidoNumero || "").toLowerCase();
    const matchBusca = nomeCliente.includes(busca) || idPedido.includes(busca);

    let matchData = true;
    if (dataSelecionada && p.criadoEm) {
      const dataDoPedido = p.criadoEm.toDate().toLocaleDateString("sv-SE");
      matchData = dataDoPedido === dataSelecionada;
    }

    return matchStatus && matchBusca && matchData;
  });

  // Atualiza os contadores toda vez que renderizar (para garantir sincronia)
  atualizarContadores();

  if (filtrados.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:#777; margin-top:20px;">Nenhum pedido para este filtro.</p>`;
    return;
  }

  filtrados.forEach((p) => {
    const valorTotal = Number(p.total || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    });
    const horaPedido = p.criadoEm?.toDate
      ? p.criadoEm.toDate().toLocaleString("pt-BR")
      : "---";

    let areaBotao = "";
    if (p.status === "pendente") {
      areaBotao = `<button class="btn-status-blue" onclick="proximoStatus('${p.id}', 'pendente')"><i class="fa-solid fa-chevron-right"></i> Iniciar Preparo</button>`;
    } else if (p.status === "preparo") {
      areaBotao = `<button class="btn-status-blue" onclick="proximoStatus('${p.id}', 'preparo')"><i class="fa-solid fa-chevron-right"></i> Marcar Pronto</button>`;
    } else if (p.status === "pronto") {
      areaBotao = `<div class="status-finalizado"><i class="fa-solid fa-check"></i> Pedido Pronto</div>`;
    }

    const itensHTML = (p.itens || [])
      .map(
        (i) => `
        <div class="item-line-admin" style="margin-bottom: 8px; border-bottom: 1px dashed #eee; padding-bottom: 4px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
                <span class="item-nome"><strong class="item-qtd">${i.qtd}x</strong> <strong class="item-produto">${i.nome}</strong></span>
                <span>R$ ${(i.precoUn * i.qtd).toFixed(2)}</span>
            </div>
            <div class="item-detalhes">
              ${i.adicionais?.length ? `<div class="item-adicionais">➕ ${i.adicionais.join(", ")}</div>` : ""}
              ${i.obs ? `<div class="produto-obs">📝 ${i.obs}</div>` : ""}
            </div>
        </div>
    `,
      )
      .join("");

    container.innerHTML += `
            <div class="order-card">
                <div class="order-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <span class="order-id">Pedido #${p.pedidoNumero || "---"}</span>
                        <button onclick="abrirEdicao('${p.id}')" style="background:none; border:none; color:#e67e22; cursor:pointer; margin-left:10px; font-size:1.1rem;">
                            <i class="fa-solid fa-pencil"></i>
                        </button>
                    </div>
                    <span class="order-price">R$ ${valorTotal}</span>
                </div>
                <div class="order-date"><i class="fa-regular fa-calendar"></i> ${horaPedido}</div>
                <div class="badge-row"><div class="badge badge-status">${p.status}</div></div>
                <div class="items-box">
                    <p class="items-titulo">Itens:</p>
                    <div style="margin-top: 8px;">${itensHTML}</div>
                </div>
                ${p.observacaoGeral ? `<div class="obs-geral-admin"><strong class="obs-geral-titulo">Observação geral:</strong><p>${p.observacaoGeral}</p></div>` : ""}
                <div class="client-box">
                    <strong class="clienti-titulo">Cliente:</strong>
                    <div class="client-info">
                      <div>Nome: <strong>${p.nome || "---"}</strong></div>
                      <div>Telefone: <strong>${p.numeroCelular || "---"}</strong></div>
                      <div>Consumo: <strong>${p.consumo === "local" ? " No Local" : " Retirada"}</strong> </div>
                      <div>Pagamento: <strong>${p.pagamento || ""}</strong></div>
                    </div>
                </div>
                ${areaBotao}
            </div>`;
  });
}

// 6. STATUS E EVENTOS (Mantida original)
async function proximoStatus(id, atual) {
  const fluxos = { pendente: "preparo", preparo: "pronto" };
  const novoStatus = fluxos[atual];
  if (novoStatus && confirm(`Deseja alterar o status para: ${novoStatus}?`)) {
    try {
      await db.collection("pedidos").doc(id).update({ status: novoStatus });
    } catch (e) {
      alert("Erro ao atualizar: " + e.message);
    }
  }
}

document.querySelectorAll(".tab").forEach((t) => {
  t.onclick = () => {
    document
      .querySelectorAll(".tab")
      .forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    filtroStatus = t.getAttribute("data-status");
    renderizar();
  };
});
document.getElementById("buscaInput").oninput = renderizar;

// --- NOVO: FUNÇÕES DE EDIÇÃO DE PRODUTOS ---

function abrirEdicao(id) {
  // Clonamos o pedido para não alterar o original antes de salvar
  pedidoEmEdicao = JSON.parse(
    JSON.stringify(todosPedidos.find((p) => p.id === id)),
  );
  document.getElementById("edit-id-display").innerText =
    `#${pedidoEmEdicao.pedidoNumero}`;
  document.getElementById("modalEdicao").style.display = "flex";
  renderizarItensEdicao();
}

function fecharModalEdicao() {
  document.getElementById("modalEdicao").style.display = "none";
  pedidoEmEdicao = null;
}

function renderizarItensEdicao() {
  const container = document.getElementById("lista-itens-edit");
  container.innerHTML = "";
  let total = 0;

  pedidoEmEdicao.itens.forEach((item, index) => {
    const subtotal = item.precoUn * item.qtd;
    total += subtotal;
    container.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; padding:10px; border-radius:8px; margin-bottom:8px; border:1px solid #eee;">
                <span><strong style="color:#e67e22">${item.qtd}x</strong> ${item.nome}</span>
                <div style="display:flex; align-items:center; gap:15px;">
                    <span style="font-weight:bold;">R$ ${subtotal.toFixed(2)}</span>
                    <button onclick="removerItemEdicao(${index})" style="color:#e74c3c; background:none; border:none; cursor:pointer; font-size:1.2rem;">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
  });

  pedidoEmEdicao.total = total;
  document.getElementById("edit-total-display").innerText =
    `Total: R$ ${total.toFixed(2)}`;
}

function removerItemEdicao(index) {
  if (confirm("Deseja remover este produto do pedido?")) {
    pedidoEmEdicao.itens.splice(index, 1);
    renderizarItensEdicao();
  }
}

function carregarProdutosCategoria(cat) {
  const container = document.getElementById("lista-produtos-categoria");
  container.innerHTML = "";
  if (!cat) return;

  PRODUTOS_DB[cat].forEach((prod) => {
    container.innerHTML += `
            <button onclick="adicionarItemEdicao('${prod.nome}', ${prod.preco})" 
                    style="padding:12px; border:1px solid #e67e22; border-radius:8px; background:white; cursor:pointer; text-align:center; transition:0.2s;"
                    onmouseover="this.style.background='#fff3e0'" onmouseout="this.style.background='white'">
                <strong style="display:block; color:#333;">${prod.nome}</strong>
                <span style="color:#e67e22; font-weight:bold;">R$ ${prod.preco.toFixed(2)}</span>
            </button>
        `;
  });
}

function adicionarItemEdicao(nome, preco) {
  const itemExistente = pedidoEmEdicao.itens.find((i) => i.nome === nome);
  if (itemExistente) {
    itemExistente.qtd++;
  } else {
    pedidoEmEdicao.itens.push({
      nome: nome,
      precoUn: preco,
      qtd: 1,
      adicionais: [],
      obs: "",
    });
  }
  renderizarItensEdicao();
}

async function salvarEdicaoPedido() {
  if (pedidoEmEdicao.itens.length === 0) {
    alert("O pedido não pode ficar vazio!");
    return;
  }

  try {
    await db.collection("pedidos").doc(pedidoEmEdicao.id).update({
      itens: pedidoEmEdicao.itens,
      total: pedidoEmEdicao.total,
    });
    alert("Pedido atualizado com sucesso!");
    fecharModalEdicao();
  } catch (e) {
    alert("Erro ao salvar: " + e.message);
  }
}

// 1. Define a data de hoje no input assim que a página carregar
window.addEventListener("DOMContentLoaded", () => {
  const hoje = new Date().toLocaleDateString("sv-SE"); // Formato YYYY-MM-DD
  const inputData = document.getElementById("dataFiltro");
  if (inputData) {
    inputData.value = hoje;
  }
});

// 2. Escuta mudanças no filtro de data
document.getElementById("dataFiltro").addEventListener("change", () => {
  renderizar();
});

// 3. Função para limpar o filtro e voltar para "hoje"
function limparData() {
  const hoje = new Date().toLocaleDateString("sv-SE");
  document.getElementById("dataFiltro").value = hoje;
  renderizar();
}
