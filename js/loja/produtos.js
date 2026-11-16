import { elemento, botao, moeda, quantidadeValida } from "../ui/dom.js";
import { icone } from "../ui/icones.js";
import { criarDialogo } from "../ui/dialogos.js";
import { avisar } from "../ui/avisos.js";
import { adicionarProduto } from "./carrinho.js";
import { obterCatalogo } from "../dados/repositorio.js";
import { ler, salvar } from "../dados/armazenamento.js";
export function obterFavoritos() {
  const itens = ler("favoritos", []);
  return Array.isArray(itens) ? itens.filter((item) => typeof item === "string").slice(0, 150) : [];
}
function adicionarComFeedback(produto, quantidade, acionador) {
  try {
    adicionarProduto(produto, quantidade);
    acionador.classList.add("adicionado");
    avisar(`${quantidade}x ${produto.nome} adicionado ao carrinho.`);
    setTimeout(() => acionador.classList.remove("adicionado"), 900);
  } catch (erro) {
    avisar(erro.message, "erro");
  }
}
export function criarCard(produto) {
  const card = elemento("article", "produto-card");
  card.dataset.produto = produto.id;
  if (produto.selo) card.append(elemento("span", "selo selo--" + (produto.novidade ? "azul" : produto.oferta ? "verde" : "vermelho"), produto.selo));
  else card.append(elemento("span", "produto-linha", produto.marca));
  const heading = elemento("h3"), detalhe = botao(produto.nome, "produto-titulo", () => abrirProduto(produto));
  heading.append(detalhe);
  const sku = elemento("p", "produto-sku", "SKU: " + produto.sku), compatibilidade = elemento("p", "produto-compativel", produto.modelo);
  const preco = elemento("strong", "produto-preco", moeda(produto.precoCentavos));
  const disponibilidade = elemento("p", "produto-estoque" + (produto.estoque ? "" : " sem-estoque"), produto.estoque ? `Estoque demo: ${produto.estoque} un.` : "Indisponível na demonstração");
  const acoes = elemento("div", "produto-acoes"), adicionar = botao("", "botao botao-adicionar");
  adicionar.append(icone("carrinho"), elemento("span", "", "Adicionar"));
  adicionar.setAttribute("aria-label", "Adicionar " + produto.nome + " ao carrinho");
  adicionar.disabled = !produto.ativo || produto.estoque < 1;
  adicionar.addEventListener("click", () => adicionarComFeedback(produto, 1, adicionar));
  const favorito = botao("", "botao-icone favorito");
  favorito.append(icone("coracao"));
  favorito.setAttribute("aria-label", "Favoritar " + produto.nome);
  favorito.setAttribute("aria-pressed", String(obterFavoritos().includes(produto.id)));
  favorito.addEventListener("click", () => {
    const itens = obterFavoritos(), existe = itens.includes(produto.id);
    salvar("favoritos", existe ? itens.filter((id) => id !== produto.id) : [...itens, produto.id]);
    favorito.setAttribute("aria-pressed", String(!existe));
    window.dispatchEvent(new CustomEvent("guinho:favoritos-alterados"));
    avisar(existe ? "Produto removido dos favoritos." : "Produto salvo nos favoritos.");
  });
  acoes.append(adicionar, favorito);
  card.append(heading, sku, compatibilidade, preco, disponibilidade, acoes);
  return card;
}
export function abrirProduto(produto) {
  const painel = criarDialogo(produto.nome, "dialogo-produto");
  const categoria = obterCatalogo().categorias.find((item) => item.id === produto.categoria);
  const topo = elemento("div", "detalhe-codigo");
  topo.append(icone(categoria?.icone || "caixa"), elemento("span", "", produto.sku), elemento("span", "etiqueta-demo", "Produto demonstrativo"));
  const dados = elemento("dl", "especificacoes");
  for (const [rotulo, valor] of Object.entries({ Marca: produto.marca, Compatibilidade: produto.modelo, Categoria: categoria?.nome, ...produto.especificacoes })) {
    if (!valor) continue;
    const linha = elemento("div");
    linha.append(elemento("dt", "", rotulo), elemento("dd", "", valor));
    dados.append(linha);
  }
  const compra = elemento("div", "detalhe-compra"), preco = elemento("strong", "produto-preco", moeda(produto.precoCentavos));
  const label = elemento("label", "campo", "Quantidade");
  const quantidade = elemento("input");
  quantidade.type = "number";
  quantidade.min = "1";
  quantidade.max = String(Math.min(produto.estoque || 1, 999));
  quantidade.step = "1";
  quantidade.value = "1";
  label.append(quantidade);
  const adicionar = botao("Adicionar ao carrinho", "botao");
  adicionar.prepend(icone("carrinho"));
  adicionar.disabled = !produto.ativo || !produto.estoque;
  adicionar.addEventListener("click", () => {
    try {
      adicionarComFeedback(produto, quantidadeValida(quantidade.value, Math.min(produto.estoque, 999)), adicionar);
    } catch (erro) {
      avisar(erro.message, "erro");
      quantidade.focus();
    }
  });
  compra.append(preco, label, adicionar);
  painel.conteudo.append(topo, elemento("p", "texto-suave", produto.descricao), dados, elemento("p", "nota-demo", "Preço e disponibilidade ilustrativos. Confirme as informações com a equipe."), compra);
  painel.abrir();
}
