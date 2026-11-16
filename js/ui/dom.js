export function elemento(tag, classe = "", texto) {
  const no = document.createElement(tag);
  if (classe) no.className = classe;
  if (texto !== void 0) no.textContent = String(texto);
  return no;
}
export function limpar(no, ...filhos) {
  no.replaceChildren(...filhos.filter(Boolean));
  return no;
}
export function botao(texto, classe = "", acao) {
  const no = elemento("button", classe, texto);
  no.type = "button";
  if (acao) no.addEventListener("click", acao);
  return no;
}
export function enderecoSeguro(valor) {
  try {
    const url = new URL(String(valor));
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}
export function normalizarTexto(valor) {
  return String(valor ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
export const moeda = (centavos) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(centavos / 100);
export function precoEmCentavos(valor) {
  let texto = String(valor).trim().replace(/^R\$\s*/, "");
  if (texto.includes(",")) texto = texto.replace(/\./g, "").replace(",", ".");
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(texto)) throw Error("Informe um preço válido, como 110,00.");
  const [inteiro, fracao = ""] = texto.split(".");
  const total = Number(inteiro) * 100 + Number(fracao.padEnd(2, "0"));
  if (!Number.isSafeInteger(total) || total < 1 || total > 1e8) throw Error("O preço deve ser maior que zero e menor que R$ 1.000.000,00.");
  return total;
}
export function quantidadeValida(valor, limite = 999) {
  const quantidade = Number(valor);
  if (!Number.isSafeInteger(quantidade) || quantidade < 1 || quantidade > limite) throw Error(`Use uma quantidade inteira entre 1 e ${limite}.`);
  return quantidade;
}
export function numeroWhatsapp(valor) {
  const digitos = String(valor || "").replace(/\D/g, "");
  if (/^55\d{10,11}$/.test(digitos)) return digitos;
  if (/^\d{10,11}$/.test(digitos)) return "55" + digitos;
  return "";
}

export function memorizarFocoLista(area) {
  const foco = document.activeElement;
  const id = area.contains(foco) ? foco.closest('[data-item-carrinho]')?.dataset.itemCarrinho : '';
  const rotulo = foco?.getAttribute('aria-label');
  const rolagem = area.closest('dialog') || area;
  const posicao = rolagem.scrollTop;
  return () => {
    if (id && rotulo) {
      const controles = [...area.querySelectorAll('button,input,a')];
      const equivalente = controles.find(no => no.getAttribute('aria-label') === rotulo && no.closest('[data-item-carrinho]')?.dataset.itemCarrinho === id);
      const alvo = equivalente && !equivalente.disabled ? equivalente : controles.find(no => no.tagName === "INPUT" && !no.disabled) || controles.find(no => !no.disabled);
      alvo?.focus({preventScroll:true});
    }
    rolagem.scrollTop = posicao;
  };
}
