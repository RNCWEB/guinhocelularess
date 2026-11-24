import { obterCatalogo, gravarProduto, excluirProduto } from "../dados/repositorio.js";
import { elemento, botao, moeda, precoEmCentavos, normalizarTexto } from "../ui/dom.js";
import { icone } from "../ui/icones.js";
import { criarDialogo, confirmar } from "../ui/dialogos.js";
import { avisar } from "../ui/avisos.js";
import { campo, opcao, cabecalhoPagina, tabela, acaoIcone, informarErro } from "./componentes.js";
export function formularioProduto(produto, atualizar) {
  const painel = criarDialogo(produto ? "Editar produto" : "Novo produto", "dialogo-admin"), form = elemento("form", "form-admin");
  form.id = "form-produto";
  const grade = elemento("div", "form-grade");
  campo(grade, "nome", "Nome do produto", "text", produto?.nome || "", { required: true, maxlength: 100 });
  campo(grade, "sku", "SKU", "text", produto?.sku || "", { required: true, maxlength: 40 });
  campo(grade, "marca", "Marca", "text", produto?.marca || "", { required: true, maxlength: 50 });
  campo(grade, "modelo", "Modelo compatível", "text", produto?.modelo || "", { required: true, maxlength: 80 });
  const categoria = campo(grade, "categoria", "Categoria", "select");
  obterCatalogo().categorias.forEach((item) => opcao(categoria, item.id, item.nome));
  categoria.value = produto?.categoria || obterCatalogo().categorias[0]?.id || "";
  campo(grade, "preco", "Preço demonstrativo (R$)", "text", produto ? (produto.precoCentavos / 100).toFixed(2).replace(".", ",") : "", { required: true, inputmode: "decimal", placeholder: "110,00" });
  campo(grade, "estoque", "Estoque demonstrativo", "number", produto?.estoque ?? 0, { required: true, min: 0, max: 9999, step: 1 });
  const selo = campo(grade, "selo", "Identificação no catálogo", "select");
  ["", "Destaque", "Seleção", "Novidade", "Oferta demo"].forEach((valor) => opcao(selo, valor, valor || "Sem selo"));
  selo.value = produto?.selo || "";
  form.append(grade);
  campo(form, "descricao", "Descrição", "textarea", produto?.descricao || "", { maxlength: 1e3, rows: 3 });
  const marcadores = elemento("div", "form-marcadores");
  for (const [nome, rotulo, marcado] of [["ativo", "Exibir no catálogo", produto?.ativo !== false], ["destaque", "Exibir nos destaques", produto?.destaque || false]]) {
    const label = elemento("label", "campo-checkbox"), input = elemento("input");
    input.type = "checkbox";
    input.name = nome;
    input.checked = marcado;
    label.append(input, document.createTextNode(rotulo));
    marcadores.append(label);
  }
  form.append(marcadores, elemento("p", "nota-demo", "Cadastro local demonstrativo. Nenhum produto é enviado para um servidor."));
  const salvar = elemento("button", "botao", "Salvar produto");
  salvar.type = "submit";
  form.append(salvar);
  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    try {
      const valores = Object.fromEntries(new FormData(form)), valorSelo = valores.selo;
      await gravarProduto({ ...produto, ...valores, id: produto?.id, precoCentavos: precoEmCentavos(valores.preco), estoque: Number(valores.estoque), ativo: form.elements.ativo.checked, destaque: form.elements.destaque.checked, novidade: valorSelo === "Novidade", oferta: valorSelo === "Oferta demo" });
      avisar("Produto salvo localmente.");
      painel.dialogo.close();
      atualizar();
    } catch (erro) {
      informarErro(form, erro);
    }
  });
  painel.conteudo.append(form);
  painel.abrir();
}
function editarPreco(produto, atualizar) {
  const painel = criarDialogo("Editar preço", "dialogo-pequeno"), form = elemento("form", "form-admin");
  form.append(elemento("p", "texto-suave", produto.nome));
  campo(form, "preco", "Preço demonstrativo (R$)", "text", (produto.precoCentavos / 100).toFixed(2).replace(".", ","), { required: true, inputmode: "decimal" });
  const salvar = elemento("button", "botao", "Salvar preço");
  salvar.type = "submit";
  form.append(salvar);
  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    try {
      await gravarProduto({ ...produto, precoCentavos: precoEmCentavos(form.elements.preco.value) });
      painel.dialogo.close();
      avisar("Preço demonstrativo atualizado.");
      atualizar();
    } catch (erro) {
      informarErro(form, erro);
    }
  });
  painel.conteudo.append(form);
  painel.abrir();
}
export function mostrarProdutos(area, atualizar, estoque = false) {
  const novo = botao("Novo produto", "botao", () => formularioProduto(null, atualizar));
  novo.prepend(icone("mais"));
  area.append(cabecalhoPagina(estoque ? "Estoque demonstrativo" : "Produtos", estoque ? "Ajustes locais de quantidade. Nenhuma reserva ou sincronização de estoque real é realizada." : "Cadastre, edite e organize as peças deste navegador.", novo));
  const ferramentas = elemento("div", "admin-ferramentas"), busca = elemento("input");
  busca.type = "search";
  busca.placeholder = "Buscar nome, SKU, marca ou modelo";
  busca.setAttribute("aria-label", "Buscar produtos no painel");
  ferramentas.append(busca, elemento("span", "etiqueta-demo", "Alterações locais"));
  area.append(ferramentas);
  const { caixa, corpo } = tabela(estoque ? ["Produto / SKU", "Categoria", "Quantidade demo", "Situação", "Ajuste"] : ["Produto / SKU", "Marca / Modelo", "Categoria", "Preço demo", "Estoque demo", "Ações"]);
  area.append(caixa);
  function renderizarLinhas() {
    corpo.replaceChildren();
    const { produtos, categorias } = obterCatalogo(), encontrados = produtos.filter((p) => normalizarTexto([p.nome, p.sku, p.marca, p.modelo].join(" ")).includes(normalizarTexto(busca.value)));
    encontrados.forEach((produto) => {
      const linha = elemento("tr"), nome = elemento("td");
      nome.append(elemento("strong", "", produto.nome), elemento("small", "", produto.sku));
      linha.append(nome);
      if (!estoque) {
        const marca = elemento("td");
        marca.append(elemento("span", "", produto.marca), elemento("small", "", produto.modelo));
        linha.append(marca);
      }
      linha.append(elemento("td", "", categorias.find((c) => c.id === produto.categoria)?.nome || "—"));
      if (estoque) {
        const td = elemento("td"), input = elemento("input", "estoque-input");
        input.type = "number";
        input.min = "0";
        input.max = "9999";
        input.step = "1";
        input.required = true;
        input.value = String(produto.estoque);
        input.setAttribute("aria-label", "Estoque demonstrativo de " + produto.nome);
        td.append(input);
        linha.append(td, elemento("td", "", produto.estoque ? "Com saldo demo" : "Sem saldo demo"));
        const acoes = elemento("td");
        acoes.append(botao("Salvar ajuste", "botao secundario botao-pequeno", async () => {
          try {
            if (!input.reportValidity()) return;
            await gravarProduto({ ...produto, estoque: Number(input.value) });
            avisar("Estoque demonstrativo atualizado.");
            renderizarLinhas();
          } catch (erro) {
            avisar(erro.message, "erro");
            input.focus();
          }
        }));
        linha.append(acoes);
      } else {
        linha.append(elemento("td", "preco-tabela", moeda(produto.precoCentavos)), elemento("td", "", String(produto.estoque)));
        const acoes = elemento("td", "acoes-tabela");
        acoes.append(acaoIcone("editar", "Editar " + produto.nome, () => formularioProduto(produto, atualizar)), acaoIcone("etiqueta", "Editar preço de " + produto.nome, () => editarPreco(produto, atualizar)), acaoIcone("lixeira", "Excluir " + produto.nome, () => confirmar("Excluir produto?", produto.nome + " será removido do catálogo.", async () => {
          try{await excluirProduto(produto.id);}catch(e){avisar(e.message,"erro");return;}
          avisar("Produto excluído localmente.");
          atualizar();
        })));
        linha.append(acoes);
      }
      corpo.append(linha);
    });
    if (!encontrados.length) {
      const linha = elemento("tr"), td = elemento("td", "tabela-vazia", "Nenhum produto encontrado.");
      td.colSpan = estoque ? 5 : 6;
      linha.append(td);
      corpo.append(linha);
    }
  }
  busca.addEventListener("input", renderizarLinhas);
  renderizarLinhas();
}
