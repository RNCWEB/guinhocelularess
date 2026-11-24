import { obterCatalogo } from "../dados/repositorio.js";
import { elemento } from "../ui/dom.js";
import { icone } from "../ui/icones.js";
import { criarCard } from "./produtos.js";
function preencherVitrine(seletor, produtos) {
  const area = document.querySelector(seletor);
  area.replaceChildren();
  produtos.forEach((produto) => area.append(criarCard(produto)));
  if (!produtos.length) area.append(elemento("p", "texto-suave", "Nenhum item nesta seleção no momento. Explore o catálogo completo."));
}
function atualizar() {
  const { categorias, produtos } = obterCatalogo(), area = document.querySelector("#categorias-inicio");
  area.replaceChildren();
  categorias.forEach((categoria) => {
    const link = elemento("a", "categoria-card");
    link.href = "catalogo.html?" + new URLSearchParams({ categoria: categoria.id });
    link.append(icone(categoria.icone), elemento("span", "", categoria.nome));
    area.append(link);
  });
  const ativos = produtos.filter((produto) => produto.ativo);
  preencherVitrine("#produtos-destaque", ativos.filter((produto) => produto.destaque).slice(0, 5));
  preencherVitrine("#produtos-novidades", ativos.filter((produto) => produto.novidade).slice(0, 5));
  preencherVitrine("#produtos-ofertas", ativos.filter((produto) => produto.oferta).slice(0, 5));
}
export function iniciarPagina() {
  atualizar();
  window.addEventListener("guinho:atualizar-pagina", atualizar);
  const slides = [
    ["A peça certa.", "O próximo reparo.", "Peças, componentes e acessórios para quem vive de assistência técnica. Encontre a compatibilidade certa e organize seu pedido."],
    ["A peça certa para", "o próximo reparo", "Busque por modelo, marca ou SKU. Explore as compatibilidades e leve sua seleção para o atendimento."],
    ["Seu pedido com", "mais clareza", "Organize suas peças, ajuste as quantidades e revise a mensagem antes de conversar com a equipe."]
  ];
  document.querySelectorAll("[data-slide]").forEach((botao) => botao.addEventListener("click", () => {
    const slide = slides[Number(botao.dataset.slide)], titulo = document.querySelector("#titulo-hero"), destaque = elemento("em", "", slide[1]);
    titulo.replaceChildren(document.createTextNode(slide[0]), document.createElement("br"), destaque);
    document.querySelector("#descricao-hero").textContent = slide[2];
    document.querySelectorAll("[data-slide]").forEach((item) => item.setAttribute("aria-pressed", String(item === botao)));
    const area = document.querySelector(".hero-texto");
    area.classList.remove("trocando");
    requestAnimationFrame(() => area.classList.add("trocando"));
  }));
}
