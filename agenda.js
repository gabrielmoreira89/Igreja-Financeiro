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



const listaBlocos = document.getElementById("listaBlocos");
const editorBloco = document.getElementById("editorBloco");
const tituloEditor = document.getElementById("tituloEditor");
const textoEditor = document.getElementById("textoEditor");
const btnFecharEditor = document.getElementById("btnFecharEditor");

let blocos = JSON.parse(localStorage.getItem("blocosNotas")) || [];
let blocoAtualId = null;

function salvarBlocos() {
  localStorage.setItem("blocosNotas", JSON.stringify(blocos));
}

function formatarData(data) {
  if (!data) return "Sem data";

  const novaData = new Date(data);

  if (isNaN(novaData.getTime())) {
    return "Sem data";
  }

  return novaData.toLocaleDateString("pt-BR");
}

function criarBloco() {
  const novoBloco = {
    id: crypto.randomUUID(),
    titulo: "Sem Título",
    texto: "",
    data: new Date().toISOString()
  };

  blocos.unshift(novoBloco);
  salvarBlocos();
  renderizarBlocos();
}

function excluirBloco(id) {
  blocos = blocos.filter(bloco => bloco.id !== id);
  salvarBlocos();
  renderizarBlocos();

  if (blocoAtualId === id) {
    fecharEditor();
  }
}

function abrirBloco(id) {
  const bloco = blocos.find(bloco => bloco.id === id);

  if (!bloco) return;

  blocoAtualId = id;
  tituloEditor.value = bloco.titulo;
  textoEditor.value = bloco.texto;
  editorBloco.style.display = "flex";
}

function fecharEditor() {
  blocoAtualId = null;
  editorBloco.style.display = "none";
}

function salvarEdicao() {
  const bloco = blocos.find(bloco => bloco.id === blocoAtualId);

  if (!bloco) return;

  bloco.titulo = tituloEditor.value;
  bloco.texto = textoEditor.value;

  salvarBlocos();
  renderizarBlocos();
}

function renderizarBlocos() {
  listaBlocos.innerHTML = "";

  blocos.forEach(bloco => {
    const card = document.createElement("div");
    card.className = "card-bloco";

    card.innerHTML = `
      <div class="topo-card">
        ${bloco.titulo ? `<h3>${bloco.titulo}</h3>` : ""}

        <div class="menu-acoes">
          <button class="btn-menu">⋮</button>
          <div class="dropdown-acoes">
            <button class="btn-excluir-opcao">Excluir</button>
          </div>
        </div>
      </div>

      <p>${bloco.texto ? bloco.texto.substring(0, 80) : "Sem anotação..."}</p>
      <div class="data-bloco">${formatarData(bloco.data)}</div>
    `;

    card.addEventListener("click", function () {
      abrirBloco(bloco.id);
    });

    const btnMenu = card.querySelector(".btn-menu");
    const dropdownAcoes = card.querySelector(".dropdown-acoes");
    const btnExcluirOpcao = card.querySelector(".btn-excluir-opcao");

    btnMenu.addEventListener("click", function (event) {
      event.stopPropagation();

      document.querySelectorAll(".dropdown-acoes").forEach(menu => {
        if (menu !== dropdownAcoes) {
          menu.classList.remove("ativo");
        }
      });

      dropdownAcoes.classList.toggle("ativo");
    });

    btnExcluirOpcao.addEventListener("click", function (event) {
      event.stopPropagation();
      excluirBloco(bloco.id);
    });

    listaBlocos.appendChild(card);
  });
}

document.addEventListener("click", function () {
  document.querySelectorAll(".dropdown-acoes").forEach(menu => {
    menu.classList.remove("ativo");
  });
});

btnFecharEditor.addEventListener("click", fecharEditor);
tituloEditor.addEventListener("input", salvarEdicao);
textoEditor.addEventListener("input", salvarEdicao);

renderizarBlocos();