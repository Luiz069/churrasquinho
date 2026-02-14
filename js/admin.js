firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    // Não está logado
    window.location.href = "index.html";
    return;
  }

  try {
    const doc = await db.collection("usuarios").doc(user.uid).get();

    if (!doc.exists) {
      alert("Acesso negado!");
      window.location.href = "inicio.html";
      return;
    }

    const dados = doc.data();

    if (dados.admin !== true) {
      alert("Você não é administrador!");
      window.location.href = "inicio.html";
      return;
    }

    // 🔥 Se chegou aqui → é admin
    console.log("Admin autorizado");
  } catch (error) {
    console.error("Erro ao verificar admin:", error);
    window.location.href = "index.html";
  }
});

db.collection("pedidos")
  .orderBy("criadoEm", "desc")
  .onSnapshot((snapshot) => {
    lista.innerHTML = "";

    let totalHoje = 0;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // zera hora

    snapshot.forEach((doc) => {
      const pedido = doc.data();

      // SOMA APENAS PEDIDOS DE HOJE
      if (pedido.criadoEm) {
        const dataPedido = pedido.criadoEm.toDate();

        if (dataPedido >= hoje) {
          totalHoje += pedido.total;
        }
      }

      lista.innerHTML += `
        <div class="pedido">
          <h3>${pedido.nome}</h3>
          <p><b>Total:</b> R$ ${pedido.total}</p>
          <p><b>Pagamento:</b> ${pedido.pagamento}</p>
          <p><b>Status:</b> ${pedido.status}</p>
        </div>
      `;
    });

    document.getElementById("totalHoje").innerText = totalHoje.toFixed(2);
  });
