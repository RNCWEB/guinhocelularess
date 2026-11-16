import { obterCatalogo } from "../dados/repositorio.js";
import { elemento, botao } from "../ui/dom.js";
import { icone } from "../ui/icones.js";
import { criarDialogo } from "../ui/dialogos.js";
import { criarCard, abrirProduto, obterFavoritos } from "./produtos.js";
import { corresponde } from "./pesquisa.js";
let pagina = 1;
const porPagina = 12;
function valores() {
  const formulario = document.querySelector("#filtros-catalogo"), dados = Object.fromEntries(new FormData(formulario));
  return { ...dados, ofertas: formulario.elements.ofertas.checked, novidades: formulario.elements.novidades.checked, favoritos: formulario.elements.favoritos.checked };
}
function renderizar() {
  const estado = valores(), { produtos, categorias } = obterCatalogo(), favoritos = obterFavoritos();
  const encontrados = produtos.filter((produto) => produto.ativo && corresponde(produto, estado.busca) && (!estado.categoria || produto.categoria === estado.categoria) && (!estado.marca || produto.marca === estado.marca) && (!estado.modelo || produto.modelo === estado.modelo) && (!estado.ofertas || produto.oferta) && (!estado.novidades || produto.novidade) && (!estado.favoritos || favoritos.includes(produto.id)) && (!estado.disponibilidade || (estado.disponibilidade === "disponivel" ? produto.estoque > 0 : produto.estoque === 0)));
  const ordenacao = document.querySelector("#ordenacao").value;
  encontrados.sort((a, b) => ordenacao === "menor" ? a.precoCentavos - b.precoCentavos : ordenacao === "maior" ? b.precoCentavos - a.precoCentavos : ordenacao === "nome" ? a.nome.localeCompare(b.nome, "pt-BR") : ordenacao === "nome-desc" ? b.nome.localeCompare(a.nome, "pt-BR") : Number(b.destaque) - Number(a.destaque));
  const paginas = Math.max(1, Math.ceil(encontrados.length / porPagina));
  pagina = Math.min(pagina, paginas);
  document.querySelector("#quantidade-resultados").textContent = `${encontrados.length} ${encontrados.length === 1 ? "produto encontrado" : "produtos encontrados"}`;
  const grade = document.querySelector("#grade-catalogo");
  grade.replaceChildren();
  encontrados.slice((pagina - 1) * porPagina, pagina * porPagina).forEach((produto) => grade.append(criarCard(produto)));
  if (!encontrados.length) {
    const vazio = elemento("div", "estado-vazio");
    vazio.append(icone("busca"), elemento("h2", "", "Nenhuma peça por aqui."), elemento("p", "texto-suave", "Tente outro modelo, marca ou código. Você também pode combinar menos filtros."), botao("Limpar filtros", "botao secundario", limparFiltros));
    grade.append(vazio);
  }
  const ativos = document.querySelector("#filtros-ativos");
  ativos.replaceChildren();
  for (const [chave, valor] of Object.entries(estado)) {
    if (!valor) continue;
    const rotulo = chave === "categoria" ? categorias.find((c) => c.id === valor)?.nome : chave === "ofertas" ? "Ofertas demo" : chave === "novidades" ? "Novidades" : chave === "favoritos" ? "Favoritos" : chave === "disponibilidade" ? valor === "disponivel" ? "Com estoque demo" : "Indisponíveis demo" : valor;
    const chip = botao(String(rotulo), "filtro-chip", () => {
      const campo = document.querySelector("#filtros-catalogo").elements[chave];
      campo.type === "checkbox" ? campo.checked = false : campo.value = "";
      pagina = 1;
      renderizar();
    });
    chip.append(icone("fechar"));
    chip.setAttribute("aria-label", "Remover filtro: " + rotulo);
    ativos.append(chip);
  }
  const paginacao = document.querySelector("#paginacao");
  paginacao.replaceChildren();
  if (paginas > 1) for (let i = 1; i <= paginas; i++) {
    const link = botao(String(i), "botao-icone", () => {
      pagina = i;
      renderizar();
      document.querySelector("#quantidade-resultados").focus({ preventScroll: true });
      document.querySelector(".catalogo-resultados").scrollIntoView({ block: "start" });
    });
    link.setAttribute("aria-label", "Página " + i);
    if (i === pagina) link.setAttribute("aria-current", "page");
    paginacao.append(link);
  }
  const query = new URLSearchParams();
  for (const [chave, valor] of Object.entries(estado)) if (valor) query.set(chave, valor === true ? "1" : valor);
  if (ordenacao !== "relevancia") query.set("ordem", ordenacao);
  history.replaceState(null, "", location.pathname + (query.size ? "?" + query : ""));
}
function limparFiltros() {
  document.querySelector("#filtros-catalogo").reset();
  document.querySelector("#ordenacao").value = "relevancia";
  pagina = 1;
  renderizar();
}
function preencherSeletores() {
  const { produtos, categorias } = obterCatalogo(), formulario = document.querySelector("#filtros-catalogo");
  for (const [chave, itens, todos] of [["categoria", categorias.map((c) => [c.id, c.nome]), "Todas as categorias"], ["marca", [...new Set(produtos.map((p) => p.marca))].sort().map((v) => [v, v]), "Todas as marcas"], ["modelo", [...new Set(produtos.map((p) => p.modelo))].sort().map((v) => [v, v]), "Todos os modelos"]]) {
    const select = formulario.elements[chave], anterior = select.value;
    select.replaceChildren();
    const primeiro = elemento("option", "", todos);
    primeiro.value = "";
    select.append(primeiro);
    itens.forEach(([valor, nome]) => {
      const option = elemento("option", "", nome);
      option.value = valor;
      select.append(option);
    });
    select.value = anterior;
  }
}
export function iniciarPagina() {
  preencherSeletores();
  const formulario = document.querySelector("#filtros-catalogo"), query = new URLSearchParams(location.search), produtoInicial = query.get("produto");
  for (const campo of formulario.elements) if (campo.name && query.has(campo.name)) campo.type === "checkbox" ? campo.checked = query.get(campo.name) === "1" : campo.value = query.get(campo.name);
  if (["menor", "maior", "nome", "nome-desc"].includes(query.get("ordem"))) document.querySelector("#ordenacao").value = query.get("ordem");
  formulario.addEventListener("submit", (evento) => evento.preventDefault());
  formulario.addEventListener("input", () => {
    pagina = 1;
    renderizar();
  });
  document.querySelector("#ordenacao").addEventListener("change", () => {
    pagina = 1;
    renderizar();
  });
  document.querySelector("[data-limpar-filtros]").addEventListener("click", limparFiltros);
  document.querySelector("#abrir-filtros").addEventListener("click", () => {
    const painel = criarDialogo("Filtros do catálogo", "dialogo-filtros"), origem = document.querySelector(".catalogo-filtros");
    painel.conteudo.append(formulario, botao("Ver resultados", "botao botao-largo", () => painel.dialogo.close()));
    painel.dialogo.addEventListener("close", () => origem.append(formulario), { once: true });
    painel.abrir();
  });
  window.addEventListener("guinho:favoritos-alterados", () => {
    if (formulario.elements.favoritos.checked) renderizar();
  });
  window.addEventListener("guinho:atualizar-pagina", () => {
    preencherSeletores();
    renderizar();
  });
  renderizar();
  if (produtoInicial) {
    const produto = obterCatalogo().produtos.find((p) => p.id === produtoInicial && p.ativo);
    if (produto) abrirProduto(produto);
  }
}
