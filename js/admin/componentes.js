import { elemento, botao } from "../ui/dom.js";
import { icone } from "../ui/icones.js";
export function campo(formulario, nome, rotulo, tipo = "text", valor = "", atributos = {}) {
  const label = elemento("label", "campo", rotulo), controle = elemento(tipo === "textarea" ? "textarea" : tipo === "select" ? "select" : "input");
  controle.name = nome;
  if (!["textarea", "select"].includes(tipo)) controle.type = tipo;
  Object.entries(atributos).forEach(([chave, valor2]) => {
    if (valor2 === true) controle.setAttribute(chave, "");
    else if (valor2 !== false) controle.setAttribute(chave, String(valor2));
  });
  if (tipo !== "select") controle.value = valor;
  label.append(controle);
  formulario.append(label);
  return controle;
}
export function opcao(select, valor, texto) {
  const no = elemento("option", "", texto);
  no.value = valor;
  select.append(no);
  return no;
}
export function cabecalhoPagina(titulo, descricao, acao) {
  const area = elemento("div", "admin-titulo"), textos = elemento("div");
  textos.append(elemento("p", "sobretitulo", "Estúdio de gestão · demonstração"), elemento("h1", "", titulo), elemento("p", "texto-suave", descricao));
  area.append(textos);
  if (acao) area.append(acao);
  return area;
}
export function tabela(cabecalhos) {
  const caixa = elemento("div", "tabela-rolagem"), tabela2 = elemento("table", "tabela-admin"), thead = elemento("thead"), linha = elemento("tr"), corpo = elemento("tbody");
  cabecalhos.forEach((texto) => {
    const th = elemento("th", "", texto);
    th.scope = "col";
    linha.append(th);
  });
  thead.append(linha);
  tabela2.append(thead, corpo);
  caixa.append(tabela2);
  caixa.tabIndex = 0;
  caixa.setAttribute("role", "region");
  caixa.setAttribute("aria-label", "Tabela com rolagem horizontal, quando necessário");
  return { caixa, corpo, tabela: tabela2 };
}
export function acaoIcone(nome, rotulo, acao) {
  const no = botao("", "botao-icone", acao);
  no.append(icone(nome));
  no.setAttribute("aria-label", rotulo);
  no.title = rotulo;
  return no;
}
export function informarErro(formulario, erro) {
  let area = formulario.querySelector(".erro-formulario");
  if (!area) {
    area = elemento("p", "mensagem-erro erro-formulario");
    area.setAttribute("role", "alert");
    area.tabIndex = -1;
    formulario.append(area);
  }
  area.textContent = erro.message;
  area.focus();
}
