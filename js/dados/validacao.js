// JSON, CSV e LocalStorage passam pela mesma validação antes de chegar à interface.
import { normalizarTexto, enderecoSeguro, numeroWhatsapp } from "../ui/dom.js";
export const textoLimpo = (valor, limite = 120) => String(valor ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, limite);
export const identificador = (valor) => normalizarTexto(valor).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
export function validarCategoria(dados) {
  const nome = textoLimpo(dados.nome, 50), id = identificador(dados.id || nome);
  if (nome.length < 2 || !id) throw Error("Informe o nome da categoria.");
  const icones = ["tela", "bateria", "conector", "chip", "flex", "camera", "carcaca", "fone", "ferramenta", "caixa"];
  return { id, nome, icone: icones.includes(dados.icone) ? dados.icone : "caixa" };
}
export function validarProduto(dados, categorias) {
  const produto = {
    id: identificador(dados.id || dados.sku),
    nome: textoLimpo(dados.nome, 100),
    sku: textoLimpo(dados.sku, 40).toUpperCase(),
    marca: textoLimpo(dados.marca, 50),
    modelo: textoLimpo(dados.modelo, 80),
    categoria: identificador(dados.categoria),
    precoCentavos: Number(dados.precoCentavos),
    estoque: Number(dados.estoque),
    ativo: dados.ativo !== false,
    destaque: dados.destaque === true,
    novidade: dados.novidade === true,
    oferta: dados.oferta === true,
    selo: textoLimpo(dados.selo, 24),
    descricao: textoLimpo(dados.descricao, 1e3),
    especificacoes: {}
  };
  if (!produto.id || produto.nome.length < 2) throw Error("Informe o nome e o identificador do produto.");
  if (!/^[A-Z0-9][A-Z0-9._-]{1,39}$/.test(produto.sku)) throw Error("O SKU precisa ter de 2 a 40 letras, números, pontos, traços ou sublinhados.");
  if (!produto.marca || !produto.modelo) throw Error("Informe a marca e o modelo compatível.");
  if (!categorias.some((categoria) => categoria.id === produto.categoria)) throw Error("Selecione uma categoria existente.");
  if (!Number.isSafeInteger(produto.precoCentavos) || produto.precoCentavos < 1 || produto.precoCentavos > 1e8) throw Error("O preço em centavos é inválido.");
  if (!Number.isSafeInteger(produto.estoque) || produto.estoque < 0 || produto.estoque > 9999) throw Error("Use um estoque demonstrativo inteiro entre 0 e 9999.");
  if (dados.especificacoes && typeof dados.especificacoes === "object" && !Array.isArray(dados.especificacoes)) {
    Object.entries(dados.especificacoes).slice(0, 8).forEach(([chave, valor]) => {
      const rotulo = textoLimpo(chave, 60);
      if (rotulo) Object.defineProperty(produto.especificacoes, rotulo, { value: textoLimpo(valor, 150), enumerable: true });
    });
  }
  return produto;
}
export function validarConfiguracao(dados) {
  const chaves = ["nome", "complemento", "assinatura", "descricao", "whatsapp", "instagram", "email", "endereco", "cidade", "horario", "urlPublica"];
  const resultado = {};
  chaves.forEach((chave) => resultado[chave] = textoLimpo(dados[chave], chave === "descricao" ? 400 : 160));
  if (!resultado.nome) throw Error("Informe o nome da loja.");
  if (resultado.whatsapp && !numeroWhatsapp(resultado.whatsapp)) throw Error("Informe um WhatsApp brasileiro com DDD.");
  for (const chave of ["instagram", "urlPublica"]) {
    if (resultado[chave] && !enderecoSeguro(resultado[chave])) throw Error("Use um endereço HTTP ou HTTPS válido em " + chave + ".");
  }
  if (resultado.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resultado.email)) throw Error("Informe um e-mail válido.");
  return resultado;
}
