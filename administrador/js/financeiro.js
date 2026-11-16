// 1. CONFIGURAÇÃO
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
let dataSelecionada = new Date().toISOString().split("T")[0]; // Padrão: Hoje

// 2. MONITORAMENTO DE LOGIN
auth.onAuthStateChanged((user) => {
  if (user) {
    const isAdmin = user.email.toLowerCase() === "shirlianedurans@gmail.com";
    ouvirPedidos(user.uid, isAdmin);
  } else {
    window.location.href = "index.html";
  }
});

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

// 3. ESCUTAR PEDIDOS (REAL-TIME)
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

      primeiraCarga = false;
      renderizarPainel();
    },
    (error) => console.error("Erro Firestore:", error),
  );
}

function tocarAlerta() {
  somNovoPedido
    .play()
    .catch(() => console.warn("Clique na página para ativar o som."));
}

// 4. RENDERIZAÇÃO PRINCIPAL (TABELA E RESUMOS)
function renderizarPainel() {
  const corpoTabela = document.getElementById("corpoTabelaPedidos");
  if (!corpoTabela) return;

  corpoTabela.innerHTML = "";

  // Filtro por Data E Status "pronto"
  const filtrados = todosPedidos.filter((p) => {
    const dataPedido = p.criadoEm?.toDate
      ? p.criadoEm.toDate().toISOString().split("T")[0]
      : "";

    // AQUI ESTÁ A MUDANÇA: adicionamos p.status === "pronto"
    return dataPedido === dataSelecionada && p.status === "pronto";
  });

  let resumoLanches = {};
  let resumoFinanceiro = { Crédito: 0, Débito: 0, Pix: 0, Dinheiro: 0 };

  filtrados.forEach((p) => {
    // Processar Financeiro (Normaliza strings para bater com as chaves)
    const pag = p.pagamento || "Dinheiro";
    if (pag.includes("Pix")) resumoFinanceiro["Pix"] += Number(p.total || 0);
    else if (pag.includes("Crédito"))
      resumoFinanceiro["Crédito"] += Number(p.total || 0);
    else if (pag.includes("Débito"))
      resumoFinanceiro["Débito"] += Number(p.total || 0);
    else resumoFinanceiro["Dinheiro"] += Number(p.total || 0);

    // Processar Itens e Resumo de Lanches
    const nomesProdutos =
      p.itens
        ?.map((i) => {
          resumoLanches[i.nome] = (resumoLanches[i.nome] || 0) + Number(i.qtd);
          return `${i.qtd}x ${i.nome}`;
        })
        .join(", ") || "---";

    const qtdTotal = p.itens?.reduce((acc, i) => acc + Number(i.qtd), 0) || 0;

    // Criar Linha da Tabela
    corpoTabela.innerHTML += `
      <tr>
        <td data-label="Nº Pedido"><a href="javascript:void(0)" onclick="abrirDetalhes('${p.id}')" style="color:#e67e22; font-weight:bold;">#${p.pedidoNumero || "---"}</a></td>
        <td data-label="Cliente">${p.nome || "---"}</td>
        <td data-label="Produtos">${nomesProdutos}</td>
        <td data-label="Qtd Total">${qtdTotal}</td>
        <td data-label="Valor">R$ ${Number(p.total || 0).toFixed(2)}</td>
        <td data-label="Pagamento">${p.pagamento || "---"}</td>
      </tr>
    `;
  });

  atualizarBlocosResumo(resumoLanches, resumoFinanceiro);
}

// 5. ATUALIZAR RESUMOS ABAIXO DA LISTA
function atualizarBlocosResumo(lanches, financeiro) {
  const divLanches = document.getElementById("resumoLanches");
  const divFin = document.getElementById("resumoFinanceiro");

  if (divLanches) {
    divLanches.innerHTML =
      Object.entries(lanches)
        .map(([nome, qtd]) => `<p><strong>${qtd}x</strong> ${nome}</p>`)
        .join("") || "Nenhum lanche vendido.";
  }

  if (divFin) {
    divFin.innerHTML = Object.entries(financeiro)
      .map(
        ([tipo, valor]) =>
          `<p><strong>${tipo}:</strong> R$ ${valor.toFixed(2)}</p>`,
      )
      .join("");
  }
}

// 6. MODAL DE DETALHES
function abrirDetalhes(id) {
  const p = todosPedidos.find((ped) => ped.id === id);
  const modal = document.getElementById("modalPedido");
  const content = document.getElementById("detalhesPedidoContent");

  if (!p || !modal || !content) return;

  content.innerHTML = `
    <h3>Pedido #${p.pedidoNumero}</h3>
    <p><strong>Cliente:</strong> ${p.nome}</p>
    <p><strong>WhatsApp:</strong> ${p.numeroCelular || "N/A"}</p>
    <p><strong>Consumo:</strong> ${p.consumo === "local" ? "🛒 No Local" : "🛵 Retirada"}</p>
    <p><strong>Status Atual:</strong> ${p.status.toUpperCase()}</p>
    <hr>
    <h4>Itens:</h4>
    ${p.itens.map((i) => `<p>${i.qtd}x ${i.nome} - R$ ${(i.precoUn * i.qtd).toFixed(2)} ${i.obs ? `<br><small>📝 ${i.obs}</small>` : ""}</p>`).join("")}
    <hr>
    <p><strong>Obs Geral:</strong> ${p.observacaoGeral || "Nenhuma"}</p>
    <h3 style="text-align:right">Total: R$ ${Number(p.total).toFixed(2)}</h3>
  `;
  modal.style.display = "flex";
}

function fecharModal() {
  const modal = document.getElementById("modalPedido");
  if (modal) modal.style.display = "none";
}

// 7. INICIALIZAÇÃO E EVENTOS
window.addEventListener("load", () => {
  const inputData = document.getElementById("filtroData");
  if (inputData) {
    inputData.value = dataSelecionada;
    inputData.onchange = (e) => {
      dataSelecionada = e.target.value;
      renderizarPainel();
    };
  }

  // Fechar modal ao clicar fora dele
  window.onclick = (event) => {
    const modal = document.getElementById("modalPedido");
    if (event.target == modal) fecharModal();
  };
});
