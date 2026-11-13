(() => {
  const STORAGE_KEY = "churrasquinho_produtos_preview";
  const form = document.getElementById("formProduto");
  const nome = document.getElementById("nome");
  const preco = document.getElementById("preco");
  const categoria = document.getElementById("categoria");
  const categoriaBebida = document.getElementById("categoriaBebida");
  const categoriaBebidaContainer = document.getElementById("categoriaBebidaContainer");
  const imagem = document.getElementById("imagem");
  const descricao = document.getElementById("descricao");
  const lista = document.getElementById("lista");
  const formTitulo = document.getElementById("formTitulo");
  const btnSalvar = document.getElementById("btnSalvar");
  let filtroAtual = "todos";
  let editandoId = null;

  const getProdutos = () => {
    try {
      const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(items) ? items : [];
    } catch (e) {
      console.error("Falha ao ler produtos:", e);
      return [];
    }
  };
  const salvarProdutos = (items) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    renderizar();
  };
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
  const categoriaNome = (cat) => ({
    industrial:"Hambúrguer Industrial", artesanal:"Hambúrguer Artesanal",
    misto:"Misto Quente", "hot-dog":"Cachorro Quente", batata:"Batata Frita", bebidas:"Bebidas"
  })[cat] || cat;
  const categoriaBebidaNome = (cat) => ({
    agua:"Água", suco:"Suco", "350ml":"350ml", "1l":"1L", "2l":"2L"
  })[cat] || cat;

  function atualizarCategoriaBebida() {
    const ehBebida = categoria.value === "bebidas";
    categoriaBebidaContainer.hidden = !ehBebida;
    categoriaBebida.required = ehBebida;
    if (!ehBebida) categoriaBebida.value = "";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const produto = {
      id: editandoId || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      nome: nome.value.trim(),
      preco: Number(preco.value),
      categoria: categoria.value,
      categoriaBebida: categoria.value === "bebidas" ? categoriaBebida.value : "",
      imagem: imagem.value.trim(),
      descricao: descricao.value.trim(),
      ativo: true
    };
    if (!produto.nome || !produto.descricao || !produto.imagem || !Number.isFinite(produto.preco) || produto.preco <= 0 ||
        (produto.categoria === "bebidas" && !produto.categoriaBebida)) {
      alert("Confira nome, descrição, imagem e preço.");
      return;
    }
    const items = getProdutos();
    if (editandoId) {
      const idx = items.findIndex((p) => p.id === editandoId);
      if (idx >= 0) items[idx] = {...items[idx], ...produto, ativo: items[idx].ativo !== false};
    } else {
      items.push(produto);
    }
    salvarProdutos(items);
    form.reset();
    imagem.value = "img/lanches/x-burguer.webp";
    atualizarCategoriaBebida();
    editandoId = null;
    formTitulo.textContent = "＋ Adicionar produto";
    btnSalvar.textContent = "Adicionar produto ao cardápio";
  });

  function editar(id) {
    const produto = getProdutos().find((p) => p.id === id);
    if (!produto) return;
    editandoId = id;
    nome.value = produto.nome;
    preco.value = produto.preco;
    categoria.value = produto.categoria;
    atualizarCategoriaBebida();
    categoriaBebida.value = produto.categoriaBebida || "";
    imagem.value = produto.imagem;
    descricao.value = produto.descricao;
    formTitulo.textContent = "✎ Editar produto";
    btnSalvar.textContent = "Salvar alterações";
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function alternar(id) {
    salvarProdutos(getProdutos().map((p) => p.id === id ? {...p, ativo: p.ativo === false} : p));
  }
  function excluir(id) {
    if (!confirm("Deseja excluir este produto da prévia?")) return;
    salvarProdutos(getProdutos().filter((p) => p.id !== id));
  }
  window.editarProdutoPreview = editar;
  window.alternarProdutoPreview = alternar;
  window.excluirProdutoPreview = excluir;

  function renderizar() {
    const produtos = getProdutos().filter((p) => filtroAtual === "todos" ||
      (filtroAtual === "ativos" && p.ativo !== false) ||
      (filtroAtual === "inativos" && p.ativo === false));
    if (!produtos.length) {
      lista.innerHTML = '<div class="empty">Nenhum produto nesta visualização. Cadastre seu primeiro lanche acima.</div>';
      return;
    }
    lista.innerHTML = produtos.map((p) => `
      <article class="item">
        <img class="thumb" src="${esc(p.imagem)}" alt="" onerror="this.onerror=null;this.src='img/lanches/x-burguer.webp'">
        <div class="info"><strong>${esc(p.nome)} ${p.ativo === false ? '<span style="color:#fcd34d;font-size:10px">• INATIVO</span>' : ''}</strong>
          <p>${esc(categoriaNome(p.categoria))}${p.categoria === "bebidas" && p.categoriaBebida ? ` · ${esc(categoriaBebidaNome(p.categoriaBebida))}` : ""} · ${esc(p.descricao)}</p>
          <div class="price">R$ ${Number(p.preco).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
        </div>
        <div class="actions">
          <button class="toggle ${p.ativo === false ? 'off' : ''}" onclick="alternarProdutoPreview('${esc(p.id)}')">${p.ativo === false ? 'Ativar' : 'Desativar'}</button>
          <button class="toggle" onclick="editarProdutoPreview('${esc(p.id)}')">Editar</button>
          <button class="delete" onclick="excluirProdutoPreview('${esc(p.id)}')">Excluir</button>
        </div>
      </article>`).join("");
  }
  document.querySelectorAll(".filter").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    filtroAtual = button.dataset.filter;
    renderizar();
  }));
  categoria.addEventListener("change", atualizarCategoriaBebida);
  atualizarCategoriaBebida();
  renderizar();
})();
