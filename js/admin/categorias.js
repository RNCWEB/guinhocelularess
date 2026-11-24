import { obterCatalogo, gravarCategoria, excluirCategoria } from "../dados/repositorio.js";
import { elemento, botao } from "../ui/dom.js";
import { icone } from "../ui/icones.js";
import { criarDialogo, confirmar } from "../ui/dialogos.js";
import { avisar } from "../ui/avisos.js";
import { campo, opcao, cabecalhoPagina, informarErro, acaoIcone } from "./componentes.js";
function editar(categoria, atualizar) {
  const painel = criarDialogo(categoria ? "Editar categoria" : "Nova categoria", "dialogo-pequeno"), form = elemento("form", "form-admin");
  campo(form, "nome", "Nome da categoria", "text", categoria?.nome || "", { required: true, maxlength: 50 });
  const select = campo(form, "icone", "Ícone", "select");
  for (const valor of ["tela", "bateria", "conector", "chip", "flex", "camera", "carcaca", "fone", "ferramenta", "caixa"]) opcao(select, valor, valor);
  select.value = categoria?.icone || "caixa";
  const salvar = elemento("button", "botao", "Salvar categoria");
  salvar.type = "submit";
  form.append(salvar);
  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    try {
      await gravarCategoria(Object.fromEntries(new FormData(form)), categoria?.id);
      avisar("Categoria salva.");
      painel.dialogo.close();
      atualizar();
    } catch (erro) {
      informarErro(form, erro);
    }
  });
  painel.conteudo.append(form);
  painel.abrir();
}
export function mostrarCategorias(area, atualizar) {
  const novo = botao("Nova categoria", "botao", () => editar(null, atualizar));
  novo.prepend(icone("mais"));
  area.append(cabecalhoPagina("Categorias", "Identidades visuais simples e uma organização clara para o catálogo.", novo));
  const grade = elemento("div", "admin-categorias"), { categorias, produtos } = obterCatalogo();
  categorias.forEach((categoria) => {
    const card = elemento("article", "painel categoria-admin");
    card.append(icone(categoria.icone), elemento("h2", "", categoria.nome), elemento("p", "texto-suave", `${produtos.filter((p) => p.categoria === categoria.id).length} produtos · ${categoria.id}`));
    const acoes = elemento("div", "acoes-tabela");
    acoes.append(acaoIcone("editar", "Editar categoria " + categoria.nome, () => editar(categoria, atualizar)), acaoIcone("lixeira", "Excluir categoria " + categoria.nome, () => confirmar("Excluir categoria?", "Categorias com produtos não podem ser removidas.", async () => {
      try {
        await excluirCategoria(categoria.id);
        atualizar();
        avisar("Categoria excluída.");
      } catch (erro) {
        avisar(erro.message, "erro");
      }
    })));
    card.append(acoes);
    grade.append(card);
  });
  area.append(grade);
}
