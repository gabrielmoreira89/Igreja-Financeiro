const menuLateral = document.getElementById("menu-lateral");
const overlay = document.getElementById("overlay");

function abrirMenu() {
    menuLateral.classList.add("ativo");
    overlay.classList.add("ativo");
}

function fecharMenu() {
    menuLateral.classList.remove("ativo");
    overlay.classList.remove("ativo");
}

overlay.addEventListener("click", fecharMenu);



const totalArrecadado = document.getElementById("totalArrecadado");
const totalGasto = document.getElementById("totalGasto");
const saldoFinal = document.getElementById("saldoFinal");

const form = document.getElementById("formLancamento");

const tipo = document.getElementById("tipo");
const registrarTipo = document.getElementById("registrarTipo");
const descricao = document.getElementById("descricao");
const valorEntrada = document.getElementById("valorEntrada");
const valorDespesa = document.getElementById("valorDespesa");
const data = document.getElementById("data");

const ultimoLancamento = document.getElementById("ultimoLancamento");
const maiorEntrada = document.getElementById("maiorEntrada");
const maiorGasto = document.getElementById("maiorGasto");

const buscarLancamento = document.getElementById("buscarLancamento");

const tabelaLancamentos = document.getElementById("tabelaLancamentos");


let lancamentos = JSON.parse(localStorage.getItem("lancamentos")) || [];
let lancamentosRelatorio =
  JSON.parse(localStorage.getItem("lancamentosRelatorio")) || [];

function salvarLancamentos() {
  localStorage.setItem("lancamentos", JSON.stringify(lancamentos));
}

function salvarLancamentosRelatorio() {
  localStorage.setItem(
    "lancamentosRelatorio",
    JSON.stringify(lancamentosRelatorio)
  );
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

function atualizarResumo() {
  let entradas = 0;
  let gastos = 0;

  lancamentos.forEach((lancamento) => {
    entradas += Number(lancamento.valorEntrada) || 0;
    gastos += Number(lancamento.valorDespesa) || 0;
  });

  const saldo = entradas - gastos;

  if (totalArrecadado) {
    totalArrecadado.textContent = formatarMoeda(entradas).replace("R$", "R$ +");
  }

  if (totalGasto) {
    totalGasto.textContent = formatarMoeda(gastos).replace("R$", "R$ -");
  }

  if (saldoFinal) {
    saldoFinal.textContent = formatarMoeda(saldo);
  }

  if (ultimoLancamento) {
    if (lancamentos.length > 0) {
      ultimoLancamento.textContent = lancamentos[0].descricao || "-";
    } else {
      ultimoLancamento.textContent = "Nenhum";
    }
  }

  if (maiorEntrada) {
    const maiorValorEntrada = Math.max(
      0,
      ...lancamentos.map((item) => Number(item.valorEntrada) || 0)
    );
    maiorEntrada.textContent = formatarMoeda(maiorValorEntrada);
  }

  if (maiorGasto) {
    const maiorValorGasto = Math.max(
      0,
      ...lancamentos.map((item) => Number(item.valorDespesa) || 0)
    );
    maiorGasto.textContent = formatarMoeda(maiorValorGasto);
  }
}

function fecharTodosMenus() {
  document.querySelectorAll(".dropdown-acoes").forEach((menu) => {
    menu.classList.remove("ativo");
  });
}

function toggleMenu(indice) {
  const menu = document.getElementById(`menu-acoes-${indice}`);
  if (!menu) return;

  document.querySelectorAll(".dropdown-acoes").forEach((item) => {
    if (item !== menu) {
      item.classList.remove("ativo");
    }
  });

  menu.classList.toggle("ativo");
}

function transferirParaRelatorio(indice) {
  const lancamento = lancamentos[indice];
  if (!lancamento) return;

  const jaExiste = lancamentosRelatorio.some((item) => {
    return (
      item.data === lancamento.data &&
      item.tipo === lancamento.tipo &&
      item.descricao === lancamento.descricao &&
      Number(item.valorEntrada) === Number(lancamento.valorEntrada) &&
      Number(item.valorDespesa) === Number(lancamento.valorDespesa)
    );
  });

  if (jaExiste) {
    alert("Esse lançamento já foi transferido para o relatório.");
    fecharTodosMenus();
    return;
  }

  lancamentosRelatorio.push(lancamento);
  salvarLancamentosRelatorio();
  fecharTodosMenus();

  alert("Lançamento transferido para o relatório.");
}

function excluirLancamento(indice) {
  const confirmar = confirm("Deseja excluir este lançamento?");
  if (!confirmar) return;

  lancamentos.splice(indice, 1);
  salvarLancamentos();
  renderizarLancamentos();
  atualizarResumo();
}

function renderizarLancamentos(lista = lancamentos) {
  if (!tabelaLancamentos) return;

  tabelaLancamentos.innerHTML = "";

  if (lista.length === 0) {
    tabelaLancamentos.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center;">Nenhum lançamento cadastrado.</td>
      </tr>
    `;
    return;
  }

  lista.forEach((lancamento, indice) => {
    const entrada = Number(lancamento.valorEntrada) || 0;
    const despesa = Number(lancamento.valorDespesa) || 0;
    const total = entrada - despesa;

    tabelaLancamentos.innerHTML += `
      <tr>
        <td>${formatarData(lancamento.data)}</td>
        <td>${lancamento.tipo || "-"}</td>
        <td>${lancamento.registrarTipo || "-"}</td>
        <td>${lancamento.descricao || "-"}</td>
        <td class="valor-entrada">${entrada > 0 ? formatarMoeda(entrada) : "-"}</td>
        <td class="valor-saida">${despesa > 0 ? formatarMoeda(despesa) : "-"}</td>
        <td>${formatarMoeda(total)}</td>
        <td class="coluna-acoes">
          <div class="acoes-wrap">
            <button class="btn-acoes" onclick="toggleMenu(${indice})">⋮</button>

            <div class="dropdown-acoes" id="menu-acoes-${indice}">
              <button onclick="transferirParaRelatorio(${indice})">
                Transferir para relatório
              </button>
              <button onclick="excluirLancamento(${indice})">
                Excluir lançamento
              </button>
            </div>
          </div>
        </td>
      </tr>
    `;
  });
}
  

if (form) {
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const novoLancamento = {
      data: data ? data.value : "",
      tipo: tipo ? tipo.value : "",
      registrarTipo: registrarTipo ? registrarTipo.value : "",
      descricao: descricao ? descricao.value.trim() : "",
      valorEntrada: valorEntrada ? Number(valorEntrada.value) || 0 : 0,
      valorDespesa: valorDespesa ? Number(valorDespesa.value) || 0 : 0
    };

    if (!novoLancamento.data || !novoLancamento.descricao) {
      alert("Preencha a data e a descrição.");
      return;
    }

    if (novoLancamento.valorEntrada <= 0 && novoLancamento.valorDespesa <= 0) {
      alert("Informe um valor de entrada ou de despesa.");
      return;
    }

    lancamentos.unshift(novoLancamento);

    salvarLancamentos();
    renderizarLancamentos();
    atualizarResumo();
    form.reset();
  });
}

if (buscarLancamento) {
  buscarLancamento.addEventListener("input", function () {
    const termo = buscarLancamento.value.toLowerCase();

    const filtrados = lancamentos.filter((lancamento) => {
      return (
        (lancamento.descricao || "").toLowerCase().includes(termo) ||
        (lancamento.tipo || "").toLowerCase().includes(termo) ||
        (lancamento.registrarTipo || "").toLowerCase().includes(termo) ||
        (lancamento.data || "").includes(termo)
      );
    });

    renderizarLancamentos(filtrados);
  });
}

document.addEventListener("click", function (event) {
  const clicouDentro = event.target.closest(".acoes-wrap");

  if (!clicouDentro) {
    fecharTodosMenus();
  }
});

renderizarLancamentos();
atualizarResumo();


