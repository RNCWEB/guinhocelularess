import { obterConfiguracao, gravarConfiguracao, restaurarCatalogo, obterCatalogo } from "../dados/repositorio.js";
import { elemento, botao } from "../ui/dom.js";
import { avisar } from "../ui/avisos.js";
import { confirmar } from "../ui/dialogos.js";
import { campo, cabecalhoPagina, informarErro } from "./componentes.js";
export function mostrarConfiguracoes(area, atualizar) {
  const config = obterConfiguracao();
  area.append(cabecalhoPagina("Configurações da loja", "Uma prévia local da identidade e dos canais comerciais."));
  const form = elemento("form", "painel form-admin");
  form.id = "form-configuracoes";
  const grade = elemento("div", "form-grade");
  for (const [nome, rotulo, tipo] of [["nome", "Nome da loja", "text"], ["complemento", "Complemento da marca", "text"], ["assinatura", "Assinatura da marca", "text"], ["whatsapp", "WhatsApp com DDD", "tel"], ["instagram", "Instagram (URL completa)", "url"], ["email", "E-mail comercial", "email"], ["endereco", "Endereço", "text"], ["cidade", "Cidade e estado", "text"], ["horario", "Horário de atendimento", "text"], ["urlPublica", "Endereço público do site", "url"]]) campo(grade, nome, rotulo, tipo, config[nome] || "", { maxlength: 160, ...nome === "nome" ? { required: true } : {} });
  form.append(grade);
  campo(form, "descricao", "Descrição da loja", "textarea", config.descricao, { rows: 3, maxlength: 400 });
  form.append(elemento("p", "nota-demo", "As mudanças desta tela valem somente neste navegador. Para publicar os dados comerciais, edite o arquivo js/configuracao.js. O WhatsApp não é enviado para nenhum servidor."));
  const salvar = elemento("button", "botao", "Salvar configurações locais");
  salvar.type = "submit";
  form.append(salvar);
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    try {
      gravarConfiguracao(Object.fromEntries(new FormData(form)));
      avisar("Configurações salvas neste navegador.");
    } catch (erro) {
      informarErro(form, erro);
    }
  });
  area.append(form);
  const ferramentas = elemento("section", "painel ferramentas-locais");
  ferramentas.append(elemento("h2", "", "Seus dados locais"), elemento("p", "texto-suave", "O catálogo de demonstração pode ser restaurado sem apagar o carrinho. Exporte uma cópia antes de alterar dados que deseja manter."));
  const acoes = elemento("div", "acoes-dialogo");
  acoes.append(botao("Exportar catálogo local", "botao secundario", () => {
    const blob = new Blob([JSON.stringify({ catalogo: obterCatalogo(), configuracao: obterConfiguracao() }, null, 2)], { type: "application/json" }), url = URL.createObjectURL(blob), link = elemento("a");
    link.href = url;
    link.download = "guinho-dados-locais.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  }), botao("Restaurar demonstração", "botao discreto", () => confirmar("Restaurar o catálogo?", "Os produtos e categorias editados neste navegador serão substituídos pelos exemplos iniciais. Seu carrinho e as configurações serão preservados.", () => {
    restaurarCatalogo();
    atualizar();
    avisar("Catálogo de demonstração restaurado.");
  })));
  ferramentas.append(acoes);
  area.append(ferramentas);
}
