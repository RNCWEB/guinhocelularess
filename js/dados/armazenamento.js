const memoria = new Map();
const somenteMemoria = new Set();
const prefixo = "guinho.v1.";
function informarErro() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("guinho:armazenamento-indisponivel"));
}
export function ler(chave, padrao) {
  if (somenteMemoria.has(chave)) return memoria.get(chave) ?? padrao;
  try {
    const texto = localStorage.getItem(prefixo + chave);
    if (texto !== null) return JSON.parse(texto);
  } catch {
    informarErro();
  }
  return memoria.has(chave) ? memoria.get(chave) : padrao;
}
export function salvar(chave, valor) {
  memoria.set(chave, valor);
  try {
    localStorage.setItem(prefixo + chave, JSON.stringify(valor));
    somenteMemoria.delete(chave);
    return true;
  } catch {
    somenteMemoria.add(chave);
    informarErro();
    return false;
  }
}
export function remover(chave) {
  memoria.delete(chave);
  try {
    localStorage.removeItem(prefixo + chave);
    somenteMemoria.delete(chave);
  } catch {
    memoria.set(chave, undefined);
    somenteMemoria.add(chave);
    informarErro();
  }
}
export function observarArmazenamento(acao) {
  window.addEventListener("storage", (evento) => {
    if (evento.key === null || evento.key.startsWith(prefixo)) acao();
  });
}
