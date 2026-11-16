(() => {
  const produtosRef = db.collection("produtos");
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
  const btnImportar = document.getElementById("importarCards");
  const statusImportacao = document.getElementById("statusImportacao");
  let filtroAtual = "todos";
  let editandoId = null;
  let pararDeOuvirProdutos = null;
  let adminAutenticado = false;

  function exigirAdministrador() {
    if (adminAutenticado) return true;
    mostrarErro("Faça login com a conta administrativa para gerenciar os produtos.");
    return false;
  }

  const categorias = {
    industrial: "Hambúrguer Industrial",
    artesanal: "Hambúrguer Artesanal",
    misto: "Misto Quente",
    "hot-dog": "Cachorro Quente",
    batata: "Batata Frita",
    bebidas: "Bebidas",
    espetinho: "Espetinho",
    churrascoCompleto: "Churrasco Completo"
  };
  const categoriasBebidas = {
    agua: "Água",
    suco: "Suco",
    "350ml": "Refrigerante de 350 ml",
    "1l": "Refrigerante de 1 L",
    "2l": "Refrigerante de 2 L"
  };

  const aliasesCategoriasBebidas = {
    "Refrigerante 350ml": "350ml",
    "Refrigerante 1L": "1l",
    "Refrigerante 2L": "2l",
    "350 ml": "350ml",
    "1 L": "1l",
    "2 L": "2l"
  };
  function normalizarCategoriaBebida(valor) {
    return aliasesCategoriasBebidas[valor] || valor || "";
  }


  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  function atualizarCategoriaBebida() {
    const ehBebida = categoria.value === "bebidas";
    categoriaBebidaContainer.hidden = !ehBebida;
    categoriaBebida.required = ehBebida;
    if (!ehBebida) categoriaBebida.value = "";
  }

  function limparFormulario() {
    form.reset();
    imagem.value = "";
    editandoId = null;
    formTitulo.textContent = "＋ Adicionar produto";
    btnSalvar.textContent = "Adicionar produto ao cardápio";
    atualizarCategoriaBebida();
  }

  function mostrarErro(mensagem) {
    alert(mensagem);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!exigirAdministrador()) return;
    const produto = {
      nome: nome.value.trim(),
      preco: Number(preco.value),
      categoria: categoria.value,
      categoriaBebida: categoria.value === "bebidas" ? categoriaBebida.value : "",
      imagem: imagem.value.trim(),
      descricao: descricao.value.trim(),
      ativo: true
    };

    if (!produto.nome || !produto.imagem || !Number.isFinite(produto.preco) || produto.preco <= 0) {
      mostrarErro("Confira nome, imagem e preço.");
      return;
    }
    if (produto.categoria === "bebidas" && !Object.prototype.hasOwnProperty.call(categoriasBebidas, produto.categoriaBebida)) {
      mostrarErro("Selecione a categoria da bebida: água, suco, 350ml, 1L ou 2L.");
      return;
    }

    btnSalvar.disabled = true;
    try {
      if (editandoId) {
        const atual = await produtosRef.doc(editandoId).get();
        await produtosRef.doc(editandoId).set({
          ...produto,
          ativo: atual.exists && atual.data().ativo === false ? false : true,
          atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } else {
        await produtosRef.add({
          ...produto,
          criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      limparFormulario();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      mostrarErro(`Não foi possível salvar o produto no Firebase. ${error.code || error.message || "Verifique sua conexão e as permissões do Firestore."}`);
    } finally {
      btnSalvar.disabled = false;
    }
  });

  async function editar(id) {
    if (!exigirAdministrador()) return;
    try {
      const snapshot = await produtosRef.doc(id).get();
      if (!snapshot.exists) return;
      const produto = snapshot.data();
      editandoId = id;
      nome.value = produto.nome || "";
      preco.value = produto.preco ?? "";
      categoria.value = produto.categoria || "industrial";
      atualizarCategoriaBebida();
      categoriaBebida.value = normalizarCategoriaBebida(produto.categoriaBebida);
      imagem.value = produto.imagem || "";
      descricao.value = produto.descricao || "";
      formTitulo.textContent = "✎ Editar produto";
      btnSalvar.textContent = "Salvar alterações";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
      mostrarErro("Não foi possível carregar o produto.");
    }
  }

  async function alternar(id, ativoAtual) {
    if (!exigirAdministrador()) return;
    try {
      await produtosRef.doc(id).update({
        ativo: !ativoAtual,
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      mostrarErro("Não foi possível alterar o status do produto.");
    }
  }

  async function excluir(id) {
    if (!exigirAdministrador()) return;
    if (!confirm("Deseja excluir este produto do Firebase?")) return;
    try {
      await produtosRef.doc(id).delete();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      mostrarErro("Não foi possível excluir o produto.");
    }
  }

  window.editarProduto = editar;
  window.alternarProduto = alternar;
  window.excluirProduto = excluir;

  function idCardSite(nome, categoria, categoriaBebida = "") {
    const texto = `${categoria}-${categoriaBebida}-${nome}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `site_${texto.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  }

  async function importarCardsDoSite() {
    if (!exigirAdministrador()) return;
    if (!Array.isArray(window.CARDS_SITE) || !window.CARDS_SITE.length) {
      statusImportacao.textContent = "Catálogo do site não encontrado.";
      return;
    }
    if (!confirm("Importar os 35 cards existentes do site para o Firebase?")) return;

    btnImportar.disabled = true;
    statusImportacao.textContent = "Importando cards para o Firebase...";
    try {
      const existentesSnapshot = await produtosRef.get();
      const chaveProduto = (produto) => `${produto.categoria || ""}|${produto.categoriaBebida || ""}|${String(produto.nome || "").trim().toLocaleLowerCase("pt-BR")}`;
      const chavesExistentes = new Set();
      existentesSnapshot.forEach((doc) => chavesExistentes.add(chaveProduto(doc.data())));

      const novosCards = window.CARDS_SITE.filter((card) => !chavesExistentes.has(chaveProduto(card)));
      if (!novosCards.length) {
        statusImportacao.textContent = "Os cards do catálogo já estão cadastrados. Nenhum produto duplicado foi criado.";
        return;
      }

      const batch = db.batch();
      novosCards.forEach((card) => {
        const ref = produtosRef.doc(idCardSite(card.nome, card.categoria, card.categoriaBebida));
        batch.set(ref, {
          ...card,
          importadoEm: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      });
      await batch.commit();
      statusImportacao.textContent = `${novosCards.length} novos cards importados; ${window.CARDS_SITE.length - novosCards.length} já estavam cadastrados. Atualize o cardápio para conferir.`;
    } catch (error) {
      console.error("Erro ao importar cards:", error);
      statusImportacao.textContent = "Não foi possível importar os cards. Verifique as regras do Firestore.";
    } finally {
      btnImportar.disabled = false;
    }
  }

  btnImportar.addEventListener("click", importarCardsDoSite);

  function categoriaTexto(produto) {
    const principal = categorias[produto.categoria] || produto.categoria || "Sem categoria";
    const bebida = produto.categoria === "bebidas" && produto.categoriaBebida
      ? ` · ${categoriasBebidas[produto.categoriaBebida] || produto.categoriaBebida}`
      : "";
    return `${principal}${bebida}`;
  }

  function imagemPadraoPorCategoria(categoria) {
    const imagens = {
      industrial: "img/lanches/x-burguer.webp",
      artesanal: "img/lanches/x-burguer.webp",
      misto: "img/lanches/misto-quente.webp",
      "hot-dog": "img/lanches/cachorro-quente.webp",
      batata: "img/lanches/batata-frita.webp",
      bebidas: "img/bebidas/agua-mineral.webp",
      espetinho: "img/churrasco/espetinho.webp",
      churrascoCompleto: "img/churrasco/churrasco-completo.webp"
    };
    return imagens[categoria] || "img/lanches/x-burguer.webp";
  }

  function renderizar(snapshot) {
    const produtos = [];
    snapshot.forEach((doc) => produtos.push({ id: doc.id, ...doc.data() }));
    produtos.sort((a, b) => {
      const diferenca = Number(a.preco || 0) - Number(b.preco || 0);
      return diferenca || String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR");
    });
    const filtrados = produtos.filter((produto) => filtroAtual === "todos" ||
      (filtroAtual === "ativos" && produto.ativo !== false) ||
      (filtroAtual === "inativos" && produto.ativo === false));

    if (!filtrados.length) {
      lista.innerHTML = '<div class="empty">Nenhum produto nesta visualização.</div>';
      return;
    }

    const grupos = new Map();
    filtrados.forEach((produto) => {
      const chave = produto.categoria || "sem-categoria";
      if (!grupos.has(chave)) grupos.set(chave, []);
      grupos.get(chave).push(produto);
    });
    const gruposOrdenados = [...grupos.entries()].sort(([categoriaA], [categoriaB]) => {
      const ordemA = Object.keys(categorias).indexOf(categoriaA);
      const ordemB = Object.keys(categorias).indexOf(categoriaB);
      return (ordemA < 0 ? 999 : ordemA) - (ordemB < 0 ? 999 : ordemB);
    });

    const renderizarProduto = (produto) => {
      const ativo = produto.ativo !== false;
      const precoProduto = Number(produto.preco || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      const caminhoImagem = produto.imagem || imagemPadraoPorCategoria(produto.categoria);
      const prefixoImagem = "../../";
      const imagemAdmin = /^(https?:|data:|\/)/i.test(caminhoImagem) ? caminhoImagem : `${prefixoImagem}${caminhoImagem}`;
      return `
        <article class="item">
          <img class="thumb" src="${esc(imagemAdmin)}" alt="" onerror="this.onerror=null;this.src='../img/favcon.png'">
          <div class="info">
            <strong>${esc(produto.nome)} ${ativo ? "" : '<span style="color:#fcd34d;font-size:10px">• INATIVO</span>'}</strong>
            <p>${esc(categoriaTexto(produto))} · ${esc(produto.descricao || "Sem descrição")}</p>
            <div class="price">R$ ${precoProduto}</div>
          </div>
          <div class="actions">
            <button class="toggle ${ativo ? "" : "off"}" onclick="alternarProduto('${esc(produto.id)}', ${ativo})">${ativo ? "Desativar" : "Ativar"}</button>
            <button class="toggle" onclick="editarProduto('${esc(produto.id)}')">Editar</button>
            <button class="delete" onclick="excluirProduto('${esc(produto.id)}')">Excluir</button>
          </div>
        </article>`;
    };

    lista.innerHTML = gruposOrdenados.map(([chave, itens]) => `
      <section class="categoria-grupo">
        <h4>${esc(categorias[chave] || "Sem categoria")}</h4>
        <div class="categoria-grupo-lista">${itens.map(renderizarProduto).join("")}</div>
      </section>
    `).join("");
  }

  document.querySelectorAll(".filter").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    filtroAtual = button.dataset.filter;
    carregarProdutos();
  }));

  function carregarProdutos() {
    if (pararDeOuvirProdutos) pararDeOuvirProdutos();
    pararDeOuvirProdutos = produtosRef.onSnapshot(renderizar, (error) => {
      console.error("Erro ao carregar produtos:", error);
      lista.innerHTML = '<div class="empty">Não foi possível carregar os produtos do Firebase. Verifique as regras do Firestore.</div>';
    });
  }

  categoria.addEventListener("change", atualizarCategoriaBebida);
  atualizarCategoriaBebida();

  auth.onAuthStateChanged((user) => {
    adminAutenticado = Boolean(user && (user.email || "").toLowerCase() === "shirlianedurans@gmail.com");
    if (adminAutenticado) {
      carregarProdutos();
    } else {
      if (pararDeOuvirProdutos) pararDeOuvirProdutos();
      pararDeOuvirProdutos = null;
      lista.innerHTML = '<div class="empty">Verificando autenticação administrativa...</div>';
    }
  });
})();
