import { elemento, botao, enderecoSeguro, numeroWhatsapp } from "../ui/dom.js";
import { preencherIcones, icone } from "../ui/icones.js";
import { obterCatalogo, obterConfiguracao } from "../dados/repositorio.js";
import { criarDialogo } from "../ui/dialogos.js";
import { copiarTexto } from "../ui/avisos.js";
export function montarEstrutura() {
  const topo = document.querySelector("#cabecalho-loja");
  topo.innerHTML = `<div class="barra-info"><div class="container"><span><i data-icone="raio"></i> Distribuidor de peças e acessórios para celulares</span><div><span><i data-icone="whatsapp"></i> Pedidos pelo WhatsApp</span><span><i data-icone="escudo"></i> Disponibilidade a confirmar</span></div></div></div>
  <header class="cabecalho"><div class="container cabecalho-principal"><a href="index.html" class="marca" aria-label="Guinho, início"><span class="marca-simbolo" aria-hidden="true"></span><span><strong data-nome-loja>Guinho</strong><b data-complemento>Celulares</b><small data-assinatura>Peças e acessórios</small></span></a>
  <form class="pesquisa-global" role="search" action="catalogo.html"><label class="sr-only" for="pesquisa-global">Buscar produto, modelo, marca ou código</label><i data-icone="busca"></i><input id="pesquisa-global" name="busca" type="search" placeholder="Buscar produto, modelo, marca ou código..." autocomplete="off" role="combobox" aria-expanded="false" aria-controls="sugestoes-busca" aria-autocomplete="list"><kbd>/</kbd><div class="sugestoes" id="sugestoes-busca" role="listbox" hidden></div></form>
  <div class="cabecalho-atalhos"><button class="atalho atendimento-atalho" type="button" aria-label="Falar com a equipe do Guinho" data-contato><i data-icone="fone"></i><span><strong>Atendimento</strong><small>Fale com a equipe</small></span></button><a class="atalho conta-atalho" href="admin/"><i data-icone="pessoa"></i><span><strong>Painel da loja</strong><small>Painel de gestão</small></span></a><a class="atalho atalho-carrinho" href="carrinho.html" data-abrir-carrinho><span class="carrinho-icone"><i data-icone="carrinho"></i><b data-contador-carrinho>0</b></span><span><strong>Carrinho</strong><small data-total-carrinho>R$ 0,00</small></span></a><button class="botao-icone menu-mobile" type="button" aria-label="Abrir navegação" aria-expanded="false" aria-controls="navegacao"><i data-icone="menu"></i></button></div></div>
  <div class="faixa-navegacao"><nav class="container navegacao" id="navegacao" aria-label="Navegação principal"><a href="index.html" data-nav="inicio"><i data-icone="inicio"></i>Início</a><a href="catalogo.html" data-nav="catalogo"><i data-icone="grade"></i>Catálogo</a><details class="nav-grupo" data-menu="categorias"><summary><i data-icone="sacola"></i>Categorias<i data-icone="baixo"></i></summary><div class="nav-opcoes"></div></details><details class="nav-grupo" data-menu="marcas"><summary><i data-icone="escudo"></i>Marcas<i data-icone="baixo"></i></summary><div class="nav-opcoes"></div></details><details class="nav-grupo" data-menu="modelos"><summary><i data-icone="tela"></i>Modelos<i data-icone="baixo"></i></summary><div class="nav-opcoes"></div></details><a href="catalogo.html?ofertas=1"><i data-icone="etiqueta"></i>Ofertas<small class="nav-selo">Demo</small></a><a href="catalogo.html?novidades=1"><i data-icone="estrela"></i>Novidades</a><a href="index.html#sobre"><i data-icone="relogio"></i>Sobre nós</a><a href="index.html#contato"><i data-icone="email"></i>Contato</a><a class="conta-mobile" href="admin/"><i data-icone="pessoa"></i>Painel demonstrativo</a></nav></div></header>`;
  document.querySelector("#rodape-loja").innerHTML = `<footer class="rodape"><div class="container rodape-grade"><div><a class="marca" href="index.html"><span class="marca-simbolo" aria-hidden="true"></span><span><strong data-nome-loja>Guinho</strong><b data-complemento>Celulares</b><small data-assinatura>Peças e acessórios</small></span></a><p>O próximo reparo começa com a peça certa. Explore o catálogo e monte sua lista.</p></div><div><h2>Explore</h2><a href="catalogo.html">Catálogo completo</a><a href="catalogo.html?novidades=1">Novidades</a><a href="catalogo.html?favoritos=1">Meus favoritos</a><a href="carrinho.html">Meu carrinho</a></div><div><h2>Atendimento</h2><button type="button" data-contato>Fale com a equipe</button><button type="button" data-instagram>Instagram</button><a href="index.html#sobre">Sobre o Guinho</a><a href="admin/">Painel demonstrativo</a></div><div><h2>Antes de pedir</h2><p>Os valores e estoques deste catálogo são demonstrativos. Disponibilidade, frete e condições são confirmados pela equipe.</p></div></div><div class="container rodape-base"><span>© <span data-ano></span> <span data-nome-loja>Guinho</span>. Peças e acessórios.</span><span>Desenvolvido por <strong>RNCWEB</strong></span><span class="modo-demo">Catálogo demonstrativo</span></div></footer><button class="whatsapp-flutuante" type="button" aria-label="Falar com a equipe pelo WhatsApp" data-contato><span data-icone="whatsapp"></span><span>Fale conosco<strong>pelo WhatsApp</strong></span></button>`;
  preencherIcones();
  const botaoMenu = document.querySelector(".menu-mobile"), nav = document.querySelector("#navegacao");
  function fecharMenu() {
    botaoMenu.setAttribute("aria-expanded", "false");
    nav.classList.remove("aberto");
  }
  botaoMenu.addEventListener("click", () => {
    const abrir = botaoMenu.getAttribute("aria-expanded") !== "true";
    botaoMenu.setAttribute("aria-expanded", String(abrir));
    nav.classList.toggle("aberto", abrir);
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", fecharMenu));
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      fecharMenu();
      document.querySelectorAll(".nav-grupo[open]").forEach((no) => no.open = false);
    }
  });
  document.addEventListener("click", (evento) => {
    if (!evento.target.closest(".cabecalho")) {
      fecharMenu();
      document.querySelectorAll(".nav-grupo[open]").forEach((no) => no.open = false);
    }
  });
  document.querySelectorAll(".nav-grupo").forEach((grupo) => grupo.addEventListener("toggle", () => {
    if (grupo.open) document.querySelectorAll(".nav-grupo").forEach((outro) => {
      if (outro !== grupo) outro.open = false;
    });
  }));
  document.querySelector(`[data-nav="${document.body.dataset.pagina === "inicio" ? "inicio" : "catalogo"}"]`)?.setAttribute("aria-current", "page");
  document.querySelectorAll("[data-contato]").forEach((botao2) => botao2.addEventListener("click", abrirContato));
  document.querySelectorAll("[data-instagram]").forEach((botao2) => botao2.addEventListener("click", () => abrirCanal("instagram")));
  document.querySelectorAll("[data-ano]").forEach((no) => no.textContent = String((new Date()).getFullYear()));
}
export function preencherEstrutura() {
  const config = obterConfiguracao(), { categorias, produtos } = obterCatalogo();
  atualizarMetadados(config);
  document.querySelector("#cabecalho-loja .marca")?.setAttribute("aria-label", config.nome + ", início");
  for (const [atributo, chave] of [["data-nome-loja", "nome"], ["data-complemento", "complemento"], ["data-assinatura", "assinatura"]]) document.querySelectorAll("[" + atributo + "]").forEach((no) => no.textContent = config[chave]);
  const opcoes = { categorias: categorias.map((item) => [item.nome, "categoria", item.id]), marcas: [...new Set(produtos.map((item) => item.marca))].sort().map((valor) => [valor, "marca", valor]), modelos: [...new Set(produtos.filter((p) => p.ativo).map((item) => item.modelo))].sort().map((valor) => [valor, "modelo", valor]) };
  for (const [grupo, itens] of Object.entries(opcoes)) {
    const lista = document.querySelector(`[data-menu="${grupo}"] .nav-opcoes`);
    lista.replaceChildren();
    itens.forEach(([nome, parametro, valor]) => {
      const link = elemento("a", "", nome);
      link.href = "catalogo.html?" + new URLSearchParams({ [parametro]: valor });
      lista.append(link);
    });
  }
}
export function abrirCanal(canal, mensagem = "") {
  const config = obterConfiguracao();
  const url = canal === "instagram" ? enderecoSeguro(config.instagram) : numeroWhatsapp(config.whatsapp) ? "https://wa.me/" + numeroWhatsapp(config.whatsapp) + "?text=" + encodeURIComponent(mensagem || "Olá! Gostaria de conversar com a equipe do " + config.nome + ".") : "";
  if (url) {
    const link2 = elemento("a");
    link2.href = url;
    link2.target = "_blank";
    link2.rel = "noopener noreferrer";
    document.body.append(link2);
    link2.click();
    link2.remove();
    return;
  }
  const painel = criarDialogo(canal === "instagram" ? "Instagram do Guinho" : "Atendimento do Guinho", "dialogo-pequeno");
  painel.conteudo.append(elemento("p", "texto-suave", "O canal comercial ainda não foi informado nesta demonstração. Você pode explorar o catálogo, montar seu pedido e copiar a mensagem."));
  const link = elemento("a", "botao", "Explorar catálogo");
  link.href = "catalogo.html";
  painel.conteudo.append(link);
  painel.abrir();
}
export function abrirContato() {
  const config = obterConfiguracao(), painel = criarDialogo("Vamos conversar?", "dialogo-pequeno");
  painel.conteudo.append(elemento("p", "texto-suave", "Fale sobre a peça, o modelo ou sua lista de reposição. Os valores e a disponibilidade são confirmados no atendimento."));
  const dados = elemento("div", "canais-contato");
  if (config.cidade || config.endereco) dados.append(elemento("p", "", [config.endereco, config.cidade].filter(Boolean).join(" · ")));
  if (config.horario) dados.append(elemento("p", "", config.horario));
  if (config.email) {
    const email = elemento("a", "", config.email);
    email.href = "mailto:" + config.email;
    dados.append(email);
  }
  dados.append(botao("Falar pelo WhatsApp", "botao", () => abrirCanal("whatsapp")), botao("Ver Instagram", "botao secundario", () => abrirCanal("instagram")));
  if (!config.whatsapp) dados.append(elemento("p", "nota-demo", "WhatsApp ainda não configurado. Nenhum contato fictício está ativo."));
  painel.conteudo.append(dados);
  painel.abrir();
}

function atualizarMetadados(config) {
  const pagina = document.body.dataset.pagina;
  const rotulo = pagina === "catalogo" ? "Catálogo" : pagina === "carrinho" ? "Meu carrinho" : "Peças e acessórios";
  document.title = config.nome + " " + config.complemento + " — " + rotulo;
  if (pagina === "inicio") document.querySelector('meta[name="description"]').content = config.descricao;
  const tituloSocial = document.querySelector('meta[property="og:title"]');
  if (tituloSocial) tituloSocial.content = document.title;
  if (!config.urlPublica) return;
  const base = new URL(config.urlPublica);
  base.search = ""; base.hash = "";
  if (!base.pathname.endsWith("/")) base.pathname += "/";
  const url = new URL(pagina === "inicio" ? "" : pagina, base).href;
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.append(canonical); }
  canonical.href = url;
  let social = document.querySelector('meta[property="og:url"]');
  if (!social) { social = document.createElement("meta"); social.setAttribute("property", "og:url"); document.head.append(social); }
  social.content = url;
}
