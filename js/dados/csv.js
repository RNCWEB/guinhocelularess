import { validarProduto, identificador } from "./validacao.js";
import { normalizarTexto } from "../ui/dom.js";
export function lerCSV(texto) {
  if (typeof texto !== "string" || texto.length > 1e6) throw Error("Use um CSV de até 1 MB.");
  texto = texto.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  let primeiraLinha = "", entreAspas = false;
  for (const caractere of texto) {
    if (caractere === '"') entreAspas = !entreAspas;
    if (caractere === "\n" && !entreAspas) break;
    primeiraLinha += caractere;
  }
  const separador = (primeiraLinha.match(/;/g) || []).length > (primeiraLinha.match(/,/g) || []).length ? ";" : ",";
  const linhas = [];
  let linha = [], campo = "", aspas = false, fechouAspas = false;
  function concluirCampo() {
    linha.push(campo);
    campo = "";
    fechouAspas = false;
  }
  function concluirLinha() {
    concluirCampo();
    if (linha.some((valor) => valor.trim())) linhas.push(linha);
    linha = [];
  }
  for (let i = 0; i < texto.length; i++) {
    const caractere = texto[i];
    if (aspas) {
      if (caractere === '"' && texto[i + 1] === '"') {
        campo += '"';
        i++;
      } else if (caractere === '"') {
        aspas = false;
        fechouAspas = true;
      } else campo += caractere;
    } else if (caractere === '"') {
      if (campo.trim() || fechouAspas) throw Error("Aspas em posição inválida no CSV.");
      campo = "";
      aspas = true;
    } else if (caractere === separador) concluirCampo();
    else if (caractere === "\n") concluirLinha();
    else if (fechouAspas && caractere.trim()) throw Error("Há conteúdo inesperado depois de um campo entre aspas.");
    else if (!fechouAspas) campo += caractere;
    if (linhas.length > 2001) throw Error("Importe no máximo 2.000 produtos por arquivo.");
  }
  if (aspas) throw Error("Há um campo com aspas não fechadas no CSV.");
  if (campo || linha.length) concluirLinha();
  if (linhas.length < 2) throw Error("O CSV precisa ter um cabeçalho e pelo menos um produto.");
  const cabecalho = linhas.shift().map((valor) => normalizarTexto(valor).replace(/\s+/g, "_"));
  if (new Set(cabecalho).size !== cabecalho.length) throw Error("O cabeçalho contém colunas repetidas.");
  const obrigatorios = ["nome", "sku", "marca", "modelo", "categoria", "preco_centavos", "estoque"];
  if (obrigatorios.some((nome) => !cabecalho.includes(nome))) throw Error("Use as colunas: " + obrigatorios.join(", ") + ".");
  return linhas.map((valores, indice) => {
    if (valores.length !== cabecalho.length) throw Error(`A linha ${indice + 2} tem um número incorreto de colunas.`);
    const registro = {};
    cabecalho.forEach((nome, i) => Object.defineProperty(registro, nome, { value: valores[i].trim(), enumerable: true }));
    return registro;
  });
}
export function prepararImportacao(texto, catalogo) {
  const registros = lerCSV(texto), produtos = [], erros = [], vistos = new Set();
  registros.forEach((registro, i) => {
    try {
      if (!/^\d+$/.test(registro.preco_centavos) || !/^\d+$/.test(registro.estoque)) throw Error("Preço em centavos e estoque precisam ser números inteiros.");
      const categoria = catalogo.categorias.find((item) => item.id === registro.categoria || normalizarTexto(item.nome) === normalizarTexto(registro.categoria));
      const existente = catalogo.produtos.find((item) => item.sku === registro.sku.toUpperCase());
      if (vistos.has(registro.sku.toUpperCase())) throw Error("SKU repetido neste arquivo.");
      vistos.add(registro.sku.toUpperCase());
      const produto = validarProduto({ ...existente, id: existente?.id || identificador(registro.sku), nome: registro.nome, sku: registro.sku, marca: registro.marca, modelo: registro.modelo, categoria: categoria?.id || registro.categoria, precoCentavos: Number(registro.preco_centavos), estoque: Number(registro.estoque), descricao: registro.descricao || existente?.descricao || "Produto demonstrativo importado localmente.", ativo: true }, catalogo.categorias);
      produtos.push({ produto, atualiza: Boolean(existente) });
    } catch (erro) {
      erros.push({ linha: i + 2, mensagem: erro.message });
    }
  });
  return { produtos, erros, total: registros.length };
}
