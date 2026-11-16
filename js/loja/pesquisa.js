import { obterCatalogo } from "../dados/repositorio.js";
import { elemento, normalizarTexto, moeda } from "../ui/dom.js";
import { icone } from "../ui/icones.js";
export function corresponde(produto, busca) {
  const termos = normalizarTexto(busca).split(/\s+/).filter(Boolean);
  const texto = normalizarTexto([produto.nome, produto.sku, produto.marca, produto.modelo, produto.categoria].join(" "));
  return termos.every((termo) => texto.includes(termo));
}
export function iniciarPesquisa() {
  const formulario = document.querySelector(".pesquisa-global"), input = formulario.querySelector("input"), lista = document.querySelector("#sugestoes-busca");
  let indice = -1, opcoes = [];
  function fechar() {
    lista.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    indice = -1;
  }
  function selecionar(novo) {
    indice = Math.max(0, Math.min(opcoes.length - 1, novo));
    lista.querySelectorAll("[role=option]").forEach((no, i) => no.setAttribute("aria-selected", String(i === indice)));
    if (opcoes[indice]) input.setAttribute("aria-activedescendant", opcoes[indice].id);
  }
  function pesquisar() {
    lista.replaceChildren();
    opcoes = [];
    indice = -1;
    if (input.value.trim().length < 2) {
      fechar();
      return;
    }
    const encontrados = obterCatalogo().produtos.filter((p) => p.ativo && corresponde(p, input.value)).slice(0, 5);
    encontrados.forEach((produto, i) => {
      const item = elemento("a", "sugestao");
      item.href = "catalogo.html?" + new URLSearchParams({ produto: produto.id });
      item.id = "sugestao-" + i;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", "false");
      const textos = elemento("span");
      textos.append(elemento("strong", "", produto.nome), elemento("small", "", produto.sku + " · " + produto.marca));
      item.append(icone("caixa"), textos, elemento("b", "", moeda(produto.precoCentavos)));
      lista.append(item);
      opcoes.push(item);
    });
    if (!encontrados.length) lista.append(elemento("p", "sugestao-vazia", "Nenhum item encontrado. Tente outro modelo ou SKU."));
    lista.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }
  input.addEventListener("input", pesquisar);
  input.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") fechar();
    if (evento.key === "ArrowDown" && opcoes.length) {
      evento.preventDefault();
      selecionar(indice + 1);
    }
    if (evento.key === "ArrowUp" && opcoes.length) {
      evento.preventDefault();
      selecionar(indice - 1);
    }
    if (evento.key === "Enter" && indice >= 0 && opcoes[indice]) {
      evento.preventDefault();
      location.href = opcoes[indice].href;
    }
  });
  formulario.addEventListener("submit", () => fechar());
  document.addEventListener("click", (evento) => {
    if (!evento.target.closest(".pesquisa-global")) fechar();
  });
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "/" && !evento.ctrlKey && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      evento.preventDefault();
      input.focus();
    }
  });
}
