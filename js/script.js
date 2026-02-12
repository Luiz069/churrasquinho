let carrinho = [];
let itemAtual = {};
let qtdModal = 1;
let extras = { queijo: 0, ovo: 0, carne: 0 };
const precosExtras = { queijo: 3.0, ovo: 2.0, carne: 8.0 };

// resto do seu JS continua aqui
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
                                ${item.adicionais.length > 0 ? `<div style="font-size:0.8rem; color:#d61b1b; margin-top:5px;"><b>+ ${item.adicionais.join(", ")}</b></div>` : ""}
                                ${item.obs ? `<div style="color:red; font-size:0.85rem; margin-top:5px;">_Obs: ${item.obs}_</div>` : ""}
                            </div>
                            <b style="color:var(--vermelho)">R$ ${sub.toFixed(2)}</b>
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:12px; align-items:center; margin-top:15px;">
                            <div class="qtd-control">
                                <button class="btn-qtd" onclick="alterarQtdCarrinho(${i}, -1)">-</button>
                                <span>${item.qtd}</span>
                                <button class="btn-qtd" onclick="alterarQtdCarrinho(${i}, 1)">+</button>
                            </div>
                            <button onclick="carrinho.splice(${i}, 1); renderCarrinho();" style="border:none; background:none; cursor:pointer; font-size:1.2rem;">🗑️</button>
                        </div>
                    </div>`;
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
function toggleCart() {
  document.getElementById("cartSidebar").classList.toggle("active");
}

function enviarWhatsApp() {
  const nome = document.getElementById("c-nome").value;
  const mesa = document.getElementById("c-mesa").value;
  if (!nome || !mesa || carrinho.length === 0)
    return alert("Preencha Nome e Mesa!");

  const numP = Math.floor(100000 + Math.random() * 900000);
  let msg = `${nome}, seu pedido Nº ${numP} está em análise.\n\n*Pedido nº ${numP}*\n\n*Itens:*\n`;
  let total = 0;

  carrinho.forEach((item) => {
    let sub = item.precoUn * item.qtd;
    total += sub;
    msg += `➡️ *${item.qtd}x ${item.nome}*\n`;
    if (item.adicionais.length > 0)
      msg += `   _Adicionais: ${item.adicionais.join(", ")}_\n`;
    if (item.obs) msg += `   _Obs: ${item.obs}_\n`;
  });

  msg += `\n💵 *${document.getElementById("c-pagto").value}*\n📍 Mesa: ${mesa}\n⏱️ Estimativa: 30~60 min\n\n*Total: R$ ${total.toFixed(2)}*\n\nObrigado! 😉`;
  window.open(
    `https://api.whatsapp.com/send?phone=559885301953&text=${encodeURIComponent(msg)}`,
    "_blank",
  );
}

// ================= LOGIN =================

window.onload = function () {
  verificarLogin();
};

function verificarLogin() {
  const usuario = localStorage.getItem("usuarioLogado");

  if (usuario) {
    const dados = JSON.parse(usuario);
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("c-nome").value = dados.nome;
  }
}

function fazerLogin() {
  const nome = document.getElementById("loginNome").value.trim();
  const celular = document.getElementById("loginCelular").value.trim();

  if (!nome || !celular) {
    alert("Preencha nome e celular!");
    return;
  }

  if (celular.length < 10) {
    alert("Digite um número válido!");
    return;
  }

  const usuario = {
    nome: nome,
    celular: celular,
  };

  localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("c-nome").value = nome;
}
