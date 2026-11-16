// Preços e totais são calculados em centavos inteiros; o envio não esvazia a lista.
import { ler, salvar, observarArmazenamento } from "../dados/armazenamento.js";
import { obterCatalogo, obterConfiguracao } from "../dados/repositorio.js";
import { quantidadeValida, moeda, numeroWhatsapp } from "../ui/dom.js";
export function obterCarrinho() {
  const dados = ler("carrinho", []);
  if (!Array.isArray(dados)) return [];
  const ids = new Set();
  return dados.slice(0, 150).filter((item) => {
    if (!item || typeof item.id !== "string" || item.id.length > 80 || ids.has(item.id)) return false;
    if (!Number.isSafeInteger(item.quantidade) || item.quantidade < 1 || item.quantidade > 999) return false;
    ids.add(item.id);
    return true;
  }).map((item) => ({ id: item.id, quantidade: item.quantidade, nome: String(item.nome || "Produto").slice(0, 100), sku: String(item.sku || "").slice(0, 40), precoCentavos: Number.isSafeInteger(item.precoCentavos) && item.precoCentavos > 0 && item.precoCentavos <= 1e8 ? item.precoCentavos : 0 }));
}
function gravar(itens) {
  salvar("carrinho", itens);
  window.dispatchEvent(new CustomEvent("guinho:carrinho-alterado"));
}
export function adicionarProduto(produto, quantidade = 1) {
  if (!produto.ativo || produto.estoque < 1) throw Error("Este item está indisponível na demonstração.");
  quantidadeValida(quantidade);
  const itens = obterCarrinho(), existente = itens.find((item) => item.id === produto.id);
  const total = quantidade + (existente?.quantidade || 0);
  quantidadeValida(total, Math.min(999, produto.estoque));
  if (existente) existente.quantidade = total;
  else itens.push({ id: produto.id, quantidade, nome: produto.nome, sku: produto.sku, precoCentavos: produto.precoCentavos });
  gravar(itens);
}
export function alterarQuantidade(id, quantidade) {
  const itens = obterCarrinho(), produto = obterCatalogo().produtos.find((item2) => item2.id === id);
  if (!produto || !produto.ativo || produto.estoque < 1) throw Error("O item está indisponível. Remova-o para continuar.");
  quantidadeValida(quantidade, Math.min(produto.estoque, 999));
  const item = itens.find((item2) => item2.id === id);
  if (item) {
    item.quantidade = quantidade;
    gravar(itens);
  }
}
export function removerProduto(id) {
  gravar(obterCarrinho().filter((item) => item.id !== id));
}
export function esvaziarCarrinho() {
  gravar([]);
}
export function obterLinhas() {
  const { produtos } = obterCatalogo();
  return obterCarrinho().map((item) => {
    const produto = produtos.find((produto2) => produto2.id === item.id);
    const valido = Boolean(produto?.ativo && produto.estoque >= item.quantidade);
    const atual = produto || { ...item, categoria: "", marca: "", modelo: "", estoque: 0 };
    return { ...atual, quantidade: item.quantidade, valido, subtotal: atual.precoCentavos * item.quantidade };
  });
}
export function calcularTotais(linhas) {
  let quantidade = 0, total = 0;
  for (const item of linhas) {
    quantidadeValida(item.quantidade);
    if (!Number.isSafeInteger(item.precoCentavos) || item.precoCentavos < 0) throw Error("Preço inválido no carrinho.");
    total += item.precoCentavos * item.quantidade;
    quantidade += item.quantidade;
    if (!Number.isSafeInteger(total)) throw Error("O valor do pedido excede o limite de cálculo.");
  }
  return { quantidade, total };
}
export function criarMensagem(linhas = obterLinhas(), config = obterConfiguracao()) {
  if (!linhas.length) return "";
  const itens = linhas.map((item) => `• ${item.quantidade}x ${item.nome} — SKU ${item.sku} (${moeda(item.precoCentavos)} cada)`);
  return `Olá! Sou lojista e quero fazer um pedido pela loja do ${config.nome}:

${itens.join("\n")}

Total estimado: ${moeda(calcularTotais(linhas).total)}

Este pedido foi montado em um catálogo demonstrativo. Pode confirmar os valores e a disponibilidade?`;
}
export function linkPedido(linhas = obterLinhas(), config = obterConfiguracao()) {
  const numero = numeroWhatsapp(config.whatsapp);
  if (!numero || !linhas.length || linhas.some((item) => !item.valido)) return "";
  return "https://wa.me/" + numero + "?text=" + encodeURIComponent(criarMensagem(linhas, config));
}
export function observarCarrinho(acao) {
  window.addEventListener("guinho:carrinho-alterado", acao);
  observarArmazenamento(acao);
}
