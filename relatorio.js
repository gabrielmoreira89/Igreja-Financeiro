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




const tabelaRelatorio = document.getElementById("tabelaRelatorio");
const totalEntradas = document.getElementById("totalEntradas");
const totalSaidas = document.getElementById("totalSaidas");
const saldoFinal = document.getElementById("saldoFinal");
const filtroMes = document.getElementById("filtroMes");
const btnGerarPdf = document.getElementById("btnGerarPdf");

const inputArrecadado = document.getElementById("inputArrecadado");
const inputGastos = document.getElementById("inputGastos");
const textoArrecadado = document.getElementById("textoArrecadado");
const textoGastos = document.getElementById("textoGastos");

let lancamentosRelatorio = JSON.parse(localStorage.getItem("lancamentosRelatorio")) || [];

function salvarLancamentosRelatorio() {
  localStorage.setItem("lancamentosRelatorio", JSON.stringify(lancamentosRelatorio));
}

function ajustarAlturaTextarea(textarea) {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.overflow = "hidden";
  textarea.style.height = textarea.scrollHeight + "px";
}

function garantirIdsRelatorio() {
  let alterou = false;

  lancamentosRelatorio = lancamentosRelatorio.map((item, index) => {
    if (!item.idRelatorio) {
      alterou = true;
      return {
        ...item,
        idRelatorio: `${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`
      };
    }
    return item;
  });

  if (alterou) {
    salvarLancamentosRelatorio();
  }
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatarData(dataTexto) {
  if (!dataTexto) return "-";

  const partes = dataTexto.split("-");

  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return dataTexto;
}

function obterMes(dataTexto) {
  if (!dataTexto) return "";
  const partes = dataTexto.split("-");
  return partes[1] || "";
}

function removerDoRelatorio(idRelatorio) {
  const confirmar = confirm("Deseja remover este lançamento do relatório?");
  if (!confirmar) return;

  lancamentosRelatorio = lancamentosRelatorio.filter(
    (item) => item.idRelatorio !== idRelatorio
  );

  salvarLancamentosRelatorio();
  filtrarPorMes();
}

function renderizarRelatorio(lista = lancamentosRelatorio) {
  if (!tabelaRelatorio) return;

  tabelaRelatorio.innerHTML = "";

  let entradas = 0;
  let gastos = 0;

  if (lista.length === 0) {
    tabelaRelatorio.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center;">Nenhum lançamento no relatório.</td>
      </tr>
    `;

    if (totalEntradas) totalEntradas.textContent = "R$ +0,00";
    if (totalSaidas) totalSaidas.textContent = "R$ -0,00";
    if (saldoFinal) saldoFinal.textContent = "R$ 0,00";
    return;
  }

  lista.forEach((lancamento) => {
    const entrada = Number(lancamento.valorEntrada) || 0;
    const despesa = Number(lancamento.valorDespesa || lancamento.valorSaida) || 0;
    const total = entrada - despesa;

    entradas += entrada;
    gastos += despesa;

    tabelaRelatorio.innerHTML += `
      <tr>
        <td>${formatarData(lancamento.data)}</td>
        <td>${lancamento.tipo || "-"}</td>
        <td>${lancamento.registrarTipo || "-"}</td>
        <td>${lancamento.descricao || "-"}</td>
        <td class="valor-entrada">${entrada > 0 ? formatarMoeda(entrada) : "-"}</td>
        <td class="valor-saida">${despesa > 0 ? formatarMoeda(despesa) : "-"}</td>
        <td>${formatarMoeda(total)}</td>
        <td class="coluna-acao">
          <button class="btn-remover-relatorio" onclick="removerDoRelatorio('${lancamento.idRelatorio}')">
            Excluir
          </button>
        </td>
      </tr>
    `;
  });

  if (totalEntradas) {
    totalEntradas.textContent = formatarMoeda(entradas).replace("R$", "R$ +");
  }

  if (totalSaidas) {
    totalSaidas.textContent = formatarMoeda(gastos).replace("R$", "R$ -");
  }

  if (saldoFinal) {
    saldoFinal.textContent = formatarMoeda(entradas - gastos);
  }
}

function filtrarPorMes() {
  if (!filtroMes) {
    renderizarRelatorio(lancamentosRelatorio);
    return;
  }

  const mesSelecionado = filtroMes.value;

  if (mesSelecionado === "todos") {
    renderizarRelatorio(lancamentosRelatorio);
    return;
  }

  const listaFiltrada = lancamentosRelatorio.filter((lancamento) => {
    return obterMes(lancamento.data) === mesSelecionado;
  });

  renderizarRelatorio(listaFiltrada);
}

function gerarPDF() {
  const elemento = document.getElementById("relatorioPDF");
  if (!elemento) return;

  if (textoArrecadado && inputArrecadado) {
    textoArrecadado.textContent = inputArrecadado.value;
  }

  if (textoGastos && inputGastos) {
    textoGastos.textContent = inputGastos.value;
  }

  elemento.classList.add("modo-pdf");

  const opcoes = {
    margin: [6, 6, 6, 6],
    filename: "relatorio-financeiro.pdf",
    image: { type: "jpeg", quality: 1 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      scrollY: 0
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    }
  };

  html2pdf()
    .set(opcoes)
    .from(elemento)
    .save()
    .then(() => {
      elemento.classList.remove("modo-pdf");
    })
    .catch(() => {
      elemento.classList.remove("modo-pdf");
    });
}

garantirIdsRelatorio();

if (filtroMes) {
  filtroMes.addEventListener("change", filtrarPorMes);
}

if (btnGerarPdf) {
  btnGerarPdf.addEventListener("click", gerarPDF);
}

if (inputArrecadado) {
  ajustarAlturaTextarea(inputArrecadado);
  inputArrecadado.addEventListener("input", function () {
    ajustarAlturaTextarea(inputArrecadado);
  });
}

if (inputGastos) {
  ajustarAlturaTextarea(inputGastos);
  inputGastos.addEventListener("input", function () {
    ajustarAlturaTextarea(inputGastos);
  });
}

filtrarPorMes();
  
