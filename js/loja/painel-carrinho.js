import { elemento, botao, moeda, memorizarFocoLista } from "../ui/dom.js";
import { icone } from "../ui/icones.js";
import { avisar } from "../ui/avisos.js";
import { criarDialogo } from "../ui/dialogos.js";
import { obterLinhas, calcularTotais, alterarQuantidade, removerProduto, observarCarrinho } from "./carrinho.js";
export function linhaCarrinho(item, compacto = false) {
  const linha = elemento("article", "item-carrinho" + (compacto ? " compacto" : ""));
  linha.dataset.itemCarrinho = item.id;
  const simbolo = elemento("div", "item-simbolo");
  simbolo.append(icone("caixa"));
  const info = elemento("div", "item-info");
  info.append(elemento("h3", "", item.nome), elemento("p", "texto-suave", item.sku + " · " + moeda(item.precoCentavos) + " cada"));
  if (!item.valido) info.append(elemento("p", "mensagem-erro", "Indisponível na demonstração ou quantidade acima do estoque local."));
  const controles = elemento("div", "item-controles"), grupo = elemento("div", "quantidade");
  const menos = botao("", "botao-icone"), mais = botao("", "botao-icone"), quantidade = elemento("input");
  menos.append(icone("menos"));
  mais.append(icone("mais"));
  menos.setAttribute("aria-label", "Diminuir quantidade de " + item.nome);
  mais.setAttribute("aria-label", "Aumentar quantidade de " + item.nome);
  quantidade.type = "number";
  quantidade.min = "1";
  quantidade.max = String(Math.min(item.estoque || 999, 999));
  quantidade.step = "1";
  quantidade.value = String(item.quantidade);
  quantidade.setAttribute("aria-label", "Quantidade de " + item.nome);
  menos.disabled = item.quantidade <= 1;
  mais.disabled = !item.valido || item.quantidade >= Math.min(item.estoque, 999);
  function atualizar(valor) {
    try {
      alterarQuantidade(item.id, Number(valor));
    } catch (erro) {
      quantidade.value = String(item.quantidade);
      avisar(erro.message, "erro");
    }
  }
  menos.addEventListener("click", () => atualizar(item.quantidade - 1));
  mais.addEventListener("click", () => atualizar(item.quantidade + 1));
  quantidade.addEventListener("change", () => atualizar(quantidade.value));
  grupo.append(menos, quantidade, mais);
  const excluir = botao("", "botao-icone remover-item", () => removerProduto(item.id));
  excluir.append(icone("lixeira"));
  excluir.setAttribute("aria-label", "Remover " + item.nome);
  controles.append(grupo, elemento("strong", "item-subtotal", moeda(item.subtotal)), excluir);
  linha.append(simbolo, info, controles);
  return linha;
}
export function estadoVazio(titulo = "Seu carrinho começa aqui.") {
  const vazio = elemento("div", "estado-vazio");
  vazio.append(icone("carrinho"), elemento("h2", "", titulo), elemento("p", "texto-suave", "Explore o catálogo e adicione as peças que você precisa."));
  const link = elemento("a", "botao", "Explorar catálogo");
  link.href = "catalogo.html";
  link.append(icone("seta"));
  vazio.append(link);
  return vazio;
}
export function abrirCarrinho() {
  const painel = criarDialogo("Seu carrinho", "carrinho-lateral");
  function renderizar() {
    if (!painel.dialogo.isConnected) return;
    const restaurarFoco = memorizarFocoLista(painel.conteudo);
    const linhas = obterLinhas();
    painel.conteudo.replaceChildren();
    if (!linhas.length) {
      painel.conteudo.append(estadoVazio());
      restaurarFoco();
      return;
    }
    painel.conteudo.append(elemento("p", "nota-demo", "Valores e disponibilidade demonstrativos. A equipe confirma seu pedido."));
    const lista = elemento("div", "lista-carrinho");
    linhas.forEach((item) => lista.append(linhaCarrinho(item, true)));
    const resumo = elemento("div", "resumo-lateral");
    resumo.append(elemento("span", "", "Total estimado"), elemento("strong", "", moeda(calcularTotais(linhas).total)));
    const revisar = elemento("a", "botao botao-largo", "Revisar pedido");
    revisar.href = "carrinho.html";
    revisar.append(icone("seta"));
    painel.conteudo.append(lista, resumo, revisar, botao("Continuar comprando", "botao secundario botao-largo", () => painel.dialogo.close()));
    restaurarFoco();
  }
  const atualizacao = () => renderizar();
  window.addEventListener("guinho:carrinho-alterado", atualizacao);
  painel.dialogo.addEventListener("close", () => window.removeEventListener("guinho:carrinho-alterado", atualizacao), { once: true });
  renderizar();
  painel.abrir();
}
export function atualizarContador() {
  const total = calcularTotais(obterLinhas());
  document.querySelectorAll("[data-contador-carrinho]").forEach((no) => no.textContent = String(total.quantidade));
  document.querySelectorAll("[data-total-carrinho]").forEach((no) => no.textContent = moeda(total.total));
  document.querySelectorAll("[data-abrir-carrinho]").forEach((no) => no.setAttribute("aria-label", `Abrir carrinho, ${total.quantidade} itens`));
}
export function iniciarCarrinhoGlobal() {
  document.querySelectorAll("[data-abrir-carrinho]").forEach((link) => link.addEventListener("click", (evento) => {
    evento.preventDefault();
    abrirCarrinho();
  }));
  atualizarContador();
  observarCarrinho(atualizarContador);
}
