import { montarEstrutura, preencherEstrutura } from "./loja/estrutura.js";
import { iniciarRepositorio, observarCatalogo } from "./dados/repositorio.js";
import { iniciarPesquisa } from "./loja/pesquisa.js";
import { iniciarCarrinhoGlobal, atualizarContador } from "./loja/painel-carrinho.js";
import { prepararAvisos } from "./ui/avisos.js";
import { iniciarAnimacoes } from "./ui/animacoes.js";
import { elemento } from "./ui/dom.js";
prepararAvisos();
montarEstrutura();
async function iniciar() {
  try {
    await iniciarRepositorio();
    preencherEstrutura();
    iniciarPesquisa();
    iniciarCarrinhoGlobal();
    const pagina = document.body.dataset.pagina;
    const modulo = await import("./loja/" + ({ inicio: "inicio", catalogo: "catalogo", carrinho: "fechamento" }[pagina] || "inicio") + ".js");
    modulo.iniciarPagina();
    iniciarAnimacoes();
    observarCatalogo(() => {
      preencherEstrutura();
      atualizarContador();
      window.dispatchEvent(new CustomEvent("guinho:atualizar-pagina"));
    });
  } catch (erro) {
    const area = document.querySelector("[data-area-principal]") || document.querySelector("main");
    const mensagem = elemento("div", "erro-carregamento");
    mensagem.setAttribute("role", "alert");
    mensagem.append(elemento("h2", "", "Não foi possível abrir o catálogo."), elemento("p", "texto-suave", erro.message));
    const tentar = elemento("button", "botao", "Tentar novamente");
    tentar.type = "button";
    tentar.addEventListener("click", () => location.reload());
    mensagem.append(tentar);
    area.replaceChildren(mensagem);
  }
}
iniciar();
