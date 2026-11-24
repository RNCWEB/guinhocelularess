import { obterCatalogo, importarProdutos } from "../dados/repositorio.js";
import { prepararImportacao } from "../dados/csv.js";
import { elemento, botao, moeda } from "../ui/dom.js";
import { icone } from "../ui/icones.js";
import { avisar } from "../ui/avisos.js";
import { cabecalhoPagina, tabela } from "./componentes.js";
export function mostrarImportacao(area) {
  area.append(cabecalhoPagina("Importar catálogo", "Revise o CSV antes de aplicar as mudanças ao catálogo local."));
  const painel = elemento("section", "painel importacao-painel"), entrada = elemento("label", "arquivo-csv");
  entrada.append(icone("importar"), elemento("strong", "", "Escolha seu arquivo CSV"), elemento("span", "texto-suave", "Até 1 MB · máximo de 2.000 linhas"));
  const arquivo = elemento("input");
  arquivo.type = "file";
  arquivo.accept = ".csv,text/csv";
  arquivo.id = "arquivo-csv";
  entrada.append(arquivo);
  painel.append(entrada, elemento("p", "nota-demo", "Cabeçalho obrigatório: nome, sku, marca, modelo, categoria, preco_centavos, estoque. Use centavos inteiros: 11000 representa R$ 110,00. Um SKU existente será atualizado após sua confirmação."));
  const label = elemento("label", "campo", "Ou cole o conteúdo CSV"), texto = elemento("textarea");
  texto.id = "texto-csv";
  texto.rows = 6;
  texto.placeholder = "nome;sku;marca;modelo;categoria;preco_centavos;estoque";
  label.append(texto);
  painel.append(label);
  const acoes = elemento("div", "acoes-dialogo"), validar = botao("Validar e visualizar", "botao", validarTexto), modelo = botao("Baixar CSV de exemplo", "botao secundario", () => {
    const conteudo = "nome;sku;marca;modelo;categoria;preco_centavos;estoque\nTela de demonstração;DEMO-TELA01;Universal;Aplicação técnica;telas;11000;12\nBateria de demonstração;DEMO-BAT01;Universal;Aplicação técnica;baterias;6500;20\n", url = URL.createObjectURL(new Blob(["\uFEFF" + conteudo], { type: "text/csv;charset=utf-8" })), link = elemento("a");
    link.href = url;
    link.download = "guinho-modelo.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  });
  acoes.append(modelo, validar);
  painel.append(acoes);
  area.append(painel);
  const resultado = elemento("section", "importacao-resultado");
  resultado.setAttribute("aria-live", "polite");
  area.append(resultado);
  let previa = null;
  arquivo.addEventListener("change", async () => {
    const file = arquivo.files?.[0];
    if (!file) return;
    try {
      if (file.size > 1e6) throw Error("Use um arquivo de até 1 MB.");
      texto.value = await file.text();
      validarTexto();
    } catch (erro) {
      avisar(erro.message, "erro");
    }
  });
  texto.addEventListener("input", () => {
    previa = null;
    resultado.replaceChildren(elemento("p", "texto-suave", "O conteúdo foi alterado. Valide novamente antes de importar."));
  });
  function validarTexto() {
    resultado.replaceChildren();
    try {
      previa = prepararImportacao(texto.value, obterCatalogo());
      resultado.append(elemento("h2", "", `${previa.produtos.length} ${previa.produtos.length === 1 ? "produto válido" : "produtos válidos"} · ${previa.erros.length} ${previa.erros.length === 1 ? "erro" : "erros"}`));
      if (previa.erros.length) {
        const lista = elemento("ul", "erros-csv");
        previa.erros.slice(0, 30).forEach((erro) => lista.append(elemento("li", "", `Linha ${erro.linha}: ${erro.mensagem}`)));
        resultado.append(lista, elemento("p", "nota-demo", "Nenhuma linha será importada enquanto houver erros."));
      }
      if (previa.produtos.length) {
        const { caixa, corpo } = tabela(["Ação", "Produto", "SKU", "Preço demo", "Estoque demo"]);
        previa.produtos.slice(0, 100).forEach(({ produto, atualiza }) => {
          const tr = elemento("tr");
          [atualiza ? "Atualizar" : "Novo", produto.nome, produto.sku, moeda(produto.precoCentavos), String(produto.estoque)].forEach((valor) => tr.append(elemento("td", "", valor)));
          corpo.append(tr);
        });
        resultado.append(caixa);
        if (previa.produtos.length > 100) resultado.append(elemento("p", "texto-suave", "A prévia mostra as primeiras 100 linhas. A validação incluiu todo o arquivo."));
      }
      const importar = botao("Confirmar importação", "botao", async () => {
        try {
          if (!previa || previa.erros.length) throw Error("Valide o arquivo sem erros antes de importar.");
          const quantidade = previa.produtos.length;
          await importarProdutos(previa.produtos.map((item) => item.produto));
          previa = null;
          resultado.replaceChildren(elemento("div", "painel", `${quantidade} produtos importados neste navegador. O arquivo original do projeto não foi alterado.`));
          avisar("Importação local concluída.");
        } catch (erro) {
          avisar(erro.message, "erro");
        }
      });
      importar.disabled = Boolean(previa.erros.length || !previa.produtos.length);
      resultado.append(importar);
    } catch (erro) {
      previa = null;
      const mensagem = elemento("p", "mensagem-erro", erro.message);
      mensagem.setAttribute("role", "alert");
      resultado.append(mensagem);
    }
  }
}
