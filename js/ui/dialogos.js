import { elemento, botao } from "./dom.js";
import { icone } from "./icones.js";
export function criarDialogo(titulo, classe = "") {
  const dialogo = elemento("dialog", "dialogo " + classe), cabecalho = elemento("div", "dialogo-cabecalho");
  const id = "dialogo-" + crypto.randomUUID(), heading = elemento("h2", "", titulo);
  heading.id = id;
  dialogo.setAttribute("aria-labelledby", id);
  const fechar = botao("", "botao-icone", () => dialogo.close());
  fechar.append(icone("fechar"));
  fechar.setAttribute("aria-label", "Fechar");
  cabecalho.append(heading, fechar);
  const conteudo = elemento("div", "dialogo-conteudo");
  dialogo.append(cabecalho, conteudo);
  document.body.append(dialogo);
  const origem = document.activeElement;
  dialogo.addEventListener("close", () => {
    dialogo.remove();
    if (!document.querySelector("dialog[open]")) document.body.classList.remove("dialogo-aberto");
    if (origem?.isConnected) origem.focus({ preventScroll: true });
  });
  dialogo.addEventListener("click", (evento) => {
    if (evento.target !== dialogo) return;
    const r = dialogo.getBoundingClientRect();
    if (evento.clientX < r.left || evento.clientX > r.right || evento.clientY < r.top || evento.clientY > r.bottom) dialogo.close();
  });
  return { dialogo, conteudo, abrir() {
    document.body.classList.add("dialogo-aberto");
    dialogo.showModal();
  } };
}
export function confirmar(titulo, mensagem, acao) {
  const painel = criarDialogo(titulo, "dialogo-pequeno");
  painel.conteudo.append(elemento("p", "texto-suave", mensagem));
  const acoes = elemento("div", "acoes-dialogo");
  acoes.append(botao("Cancelar", "botao secundario", () => painel.dialogo.close()), botao("Confirmar", "botao", () => {
    acao();
    painel.dialogo.close();
  }));
  painel.conteudo.append(acoes);
  painel.abrir();
}
