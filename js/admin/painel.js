import { obterCatalogo, obterAlteracoes } from "../dados/repositorio.js";
import { elemento, moeda } from "../ui/dom.js";
import { icone } from "../ui/icones.js";
import { cabecalhoPagina } from "./componentes.js";
export function mostrarPainel(area) {
  const { produtos, categorias } = obterCatalogo(), ativos = produtos.filter((p) => p.ativo), quantidade = ativos.reduce((s, p) => s + p.estoque, 0), valor = ativos.reduce((s, p) => s + p.precoCentavos * p.estoque, 0);
  area.append(cabecalhoPagina("Visão geral", "Uma visão dos dados demonstrativos armazenados neste navegador."));
  const indicadores = elemento("div", "admin-indicadores");
  for (const [titulo, valorIndicador, simbolo, legenda] of [["Produtos ativos", ativos.length, "caixa", "No catálogo local"], ["Categorias", categorias.length, "grade", "Organização das peças"], ["Unidades demo", quantidade, "grafico", "Saldo meramente ilustrativo"], ["Valor do estoque demo", moeda(valor), "etiqueta", "Calculado com valores demonstrativos"]]) {
    const card = elemento("article", "indicador");
    card.append(icone(simbolo), elemento("span", "", titulo), elemento("strong", "", String(valorIndicador)), elemento("small", "", legenda));
    indicadores.append(card);
  }
  area.append(indicadores);
  const grade = elemento("div", "admin-paineis"), distribuicao = elemento("section", "painel");
  distribuicao.append(elemento("p", "sobretitulo", "Seu catálogo em perspectiva"), elemento("h2", "", "Distribuição por categoria"));
  const maior = Math.max(1, ...categorias.map((c) => produtos.filter((p) => p.categoria === c.id).length));
  categorias.forEach((c) => {
    const total = produtos.filter((p) => p.categoria === c.id).length, linha = elemento("div", "categoria-barra"), texto = elemento("div");
    texto.append(elemento("span", "", c.nome), elemento("b", "", String(total)));
    const barra = elemento("span", "barra"), preenchimento = elemento("i");
    preenchimento.style.width = total / maior * 100 + "%";
    barra.append(preenchimento);
    linha.append(texto, barra);
    distribuicao.append(linha);
  });
  const historico = elemento("section", "painel");
  historico.append(elemento("p", "sobretitulo", "Registro deste navegador"), elemento("h2", "", "Últimas alterações"));
  const registros = obterAlteracoes();
  if (!registros.length) historico.append(elemento("p", "texto-suave vazio-historico", "As alterações que você fizer nos produtos, categorias e configurações aparecerão aqui."));
  registros.slice(0, 7).forEach((item) => {
    const linha = elemento("div", "alteracao-local"), data = new Date(item.data);
    linha.append(icone("relogio"), elemento("p", "", String(item.descricao)), elemento("time", "", Number.isFinite(data.getTime()) ? data.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : ""));
    historico.append(linha);
  });
  grade.append(distribuicao, historico);
  area.append(grade);
}
