// RNCWEB — loja remota; painel ainda demonstrativo.
import { configuracao } from "../configuracao.js";
import { ler, salvar, remover, observarArmazenamento } from "./armazenamento.js";
import { validarCategoria, validarProduto, validarConfiguracao } from "./validacao.js";
const remoto = configuracao.apiCatalogo;
const painelRemoto = remoto && /^\/admin(?:\/|$)/.test(globalThis.location?.pathname ?? "");
let historicoRemoto=[];
export async function apiAdmin(path, method="GET", dados) {
 const r=await fetch("/api/admin/"+path,{method,cache:"no-store",credentials:"same-origin",...(dados===undefined?{}:{headers:{"Content-Type":"application/json"},body:JSON.stringify(dados)})});
 const d=await r.json();if(!r.ok)throw Error(d.erro||"Falha na operação.");return d;
}
export async function recarregarRepositorio(){carregamento=null;return iniciarRepositorio();}
async function gravarRemoto(path,method,dados){const result=await apiAdmin(path,method,dados);await recarregarRepositorio();return result;}
let origem, carregamento;
export async function iniciarRepositorio() {
  if (!carregamento) carregamento = fetch(remoto ? new URL(painelRemoto ? "/api/admin/catalogo" : "/api/catalogo", import.meta.url) : new URL("../../dados/produtos.json", import.meta.url), {cache: "no-store"}).then(async (resposta) => {
    if (!resposta.ok) throw Error("Não foi possível carregar o catálogo. Atualize a página ou use um servidor estático.");
    const dados = await resposta.json();
    if(painelRemoto)historicoRemoto=dados.alteracoes||[];
    const categorias = dados.categorias.map(validarCategoria);
    origem = { categorias, produtos: dados.produtos.map((produto) => validarProduto(produto, categorias)) };
    return obterCatalogo();
  }).catch((erro) => {
    carregamento = null;
    throw erro;
  });
  return carregamento;
}
export function obterCatalogo() {
  if (!origem) throw Error("O catálogo ainda está carregando.");
  if (remoto) return structuredClone(origem);
  try {
    const categorias = ler("categorias", origem.categorias).map(validarCategoria);
    const produtos = ler("produtos", origem.produtos).map((produto) => validarProduto(produto, categorias));
    if (new Set(produtos.map((p) => p.sku)).size !== produtos.length || new Set(produtos.map((p) => p.id)).size !== produtos.length) throw Error("Catálogo local duplicado.");
    return { categorias, produtos };
  } catch {
    window.dispatchEvent(new CustomEvent("guinho:dados-invalidos"));
    return structuredClone(origem);
  }
}
export function obterConfiguracao() {
  if (remoto) return {...configuracao};
  try {
    return { ...configuracao, ...validarConfiguracao({ ...configuracao, ...ler("configuracao", {}) }) };
  } catch {
    return { ...configuracao };
  }
}
function registrar(descricao) {
  const registros = ler("alteracoes", []);
  salvar("alteracoes", [{ descricao, data: (new Date()).toISOString() }, ...Array.isArray(registros) ? registros : []].slice(0, 30));
  window.dispatchEvent(new CustomEvent("guinho:catalogo-alterado"));
}
export function gravarProduto(dados) {
  if(painelRemoto)return gravarRemoto(dados.id?"produtos/"+encodeURIComponent(dados.id):"produtos",dados.id?"PUT":"POST",dados);
  const { produtos, categorias } = obterCatalogo(), produto = validarProduto(dados, categorias);
  if (!dados.id && produtos.some((item) => item.id === produto.id)) throw Error("Esse produto ou identificador já existe. Edite o cadastro existente.");
  if (produtos.some((item) => item.id !== produto.id && item.sku === produto.sku)) throw Error("Esse SKU já está em uso.");
  const indice = produtos.findIndex((item) => item.id === produto.id);
  if (indice >= 0) produtos[indice] = produto;
  else produtos.push(produto);
  salvar("produtos", produtos);
  registrar((indice >= 0 ? "Produto atualizado: " : "Produto cadastrado: ") + produto.nome);
  return produto;
}
export function excluirProduto(id) {
  if(painelRemoto)return gravarRemoto("produtos/"+encodeURIComponent(id),"DELETE");
  const { produtos } = obterCatalogo();
  salvar("produtos", produtos.filter((item) => item.id !== id));
  registrar("Produto removido do catálogo local.");
}
export function gravarCategoria(dados, idAnterior = "") {
  const { categorias, produtos } = obterCatalogo(), categoria = validarCategoria(dados);
  const indice = categorias.findIndex((item) => item.id === (idAnterior || categoria.id));
  if (categorias.some((item, i) => i !== indice && item.id === categoria.id)) throw Error("Essa categoria já existe.");
  if (indice >= 0) categoria.id = categorias[indice].id;
  if (indice >= 0) categorias[indice] = categoria;
  else categorias.push(categoria);
  salvar("categorias", categorias);
  salvar("produtos", produtos);
  registrar("Categoria atualizada: " + categoria.nome);
}
export function excluirCategoria(id) {
  const { categorias, produtos } = obterCatalogo();
  if (produtos.some((item) => item.categoria === id)) throw Error("Transfira os produtos desta categoria antes de removê-la.");
  salvar("categorias", categorias.filter((item) => item.id !== id));
  registrar("Categoria removida.");
}
export function gravarConfiguracao(dados) {
  const resultado = validarConfiguracao(dados);
  salvar("configuracao", resultado);
  registrar("Configurações locais da loja atualizadas.");
  return resultado;
}
export function importarProdutos(itens) {
  const { produtos, categorias } = obterCatalogo();
  const validados = itens.map((item) => validarProduto(item, categorias));
  if (new Set(validados.map((item) => item.sku)).size !== validados.length) throw Error("Há SKUs repetidos no arquivo.");
  for (const item of validados) {
    const indice = produtos.findIndex((produto) => produto.sku === item.sku);
    if (indice >= 0) produtos[indice] = { ...item, id: produtos[indice].id };
    else {
      if (produtos.some((produto) => produto.id === item.id)) throw Error("Identificador de produto repetido.");
      produtos.push(item);
    }
  }
  salvar("produtos", produtos);
  registrar(`${validados.length} produtos importados localmente.`);
}
export function restaurarCatalogo() {
  remover("produtos");
  remover("categorias");
  registrar("Catálogo demonstrativo restaurado. Carrinho preservado.");
}
export const obterAlteracoes = () => {
  if(painelRemoto)return structuredClone(historicoRemoto);
  const itens = ler("alteracoes", []);
  return Array.isArray(itens) ? itens : [];
};
export function observarCatalogo(acao) {
  window.addEventListener("guinho:catalogo-alterado", acao);
  observarArmazenamento(acao);
}
