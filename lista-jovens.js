const menuLateral = document.getElementById("menu-lateral");
const overlay = document.getElementById("overlay");

function abrirMenu() {
  menuLateral.classList.add("ativo");
  overlay.classList.add("ativo");
  history.pushState({ menu: true }, "");
}

function fecharMenu() {
  menuLateral.classList.remove("ativo");
  overlay.classList.remove("ativo");
}

overlay.addEventListener("click", fecharMenu);

window.addEventListener("popstate", function () {
  if (menuLateral.classList.contains("ativo")) {
    fecharMenu();
  }
});






const formJovem = document.getElementById("formJovem");
const nome = document.getElementById("nome");
const funcao = document.getElementById("funcao");
const contato = document.getElementById("contato");
const frequencia = document.getElementById("frequencia");
const tabelaJovens = document.getElementById("tabelaJovens");
const semDados = document.getElementById("semDados");
const btnSalvar = document.getElementById("btnSalvar");
const btnCancelar = document.getElementById("btnCancelar");

let jovens = JSON.parse(localStorage.getItem("jovens")) || [];
let indiceEditando = -1;

function salvarLocalStorage() {
  localStorage.setItem("jovens", JSON.stringify(jovens));
}

function limparFormulario() {
  nome.value = "";
  funcao.value = "";
  contato.value = "";
  frequencia.value = "";
  indiceEditando = -1;
  btnSalvar.textContent = "Adicionar Jovem";
  btnCancelar.style.display = "none";
}

function renderizarJovens() {
  tabelaJovens.innerHTML = "";

  if (jovens.length === 0) {
    semDados.style.display = "block";
    return;
  }

  semDados.style.display = "none";

  jovens.forEach((jovem, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${jovem.nome}</td>
      <td>${jovem.funcao}</td>
      <td>${jovem.contato}</td>
      <td>${jovem.frequencia}</td>
      <td>
        <button class="btn-editar" onclick="editarJovem(${index})">Editar</button>
        <button class="btn-excluir" onclick="excluirJovem(${index})">Excluir</button>
      </td>
    `;

    tabelaJovens.appendChild(tr);
  });
}

formJovem.addEventListener("submit", function (e) {
  e.preventDefault();

  const jovem = {
    nome: nome.value.trim(),
    funcao: funcao.value,
    contato: contato.value.trim(),
    frequencia: frequencia.value.trim()
  };

  if (!jovem.nome || !jovem.funcao || !jovem.contato || !jovem.frequencia) {
    return;
  }

  if (indiceEditando === -1) {
    jovens.push(jovem);
  } else {
    jovens[indiceEditando] = jovem;
  }

  salvarLocalStorage();
  renderizarJovens();
  limparFormulario();
});

function editarJovem(index) {
  const jovem = jovens[index];

  nome.value = jovem.nome;
  funcao.value = jovem.funcao;
  contato.value = jovem.contato;
  frequencia.value = jovem.frequencia;

  indiceEditando = index;
  btnSalvar.textContent = "Salvar Alterações";
  btnCancelar.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function excluirJovem(index) {
  if (confirm("Deseja realmente excluir este jovem?")) {
    jovens.splice(index, 1);
    salvarLocalStorage();
    renderizarJovens();
    limparFormulario();
  }
}

btnCancelar.addEventListener("click", function () {
  limparFormulario();
});

renderizarJovens();