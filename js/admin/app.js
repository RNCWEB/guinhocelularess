import { configuracao } from "../configuracao.js";
import { iniciarRepositorio, apiAdmin, recarregarRepositorio } from "../dados/repositorio.js";
import { ler, salvar, remover } from "../dados/armazenamento.js";
import { elemento } from "../ui/dom.js";
import { preencherIcones } from "../ui/icones.js";
import { prepararAvisos, avisar } from "../ui/avisos.js";
import { mostrarPainel } from "./painel.js";
import { mostrarProdutos } from "./produtos.js";
import { mostrarCategorias } from "./categorias.js";
import { mostrarConfiguracoes } from "./configuracoes.js";
import { mostrarImportacao } from "./importacao.js";
prepararAvisos();
preencherIcones();
let secao = "dashboard";
const vistas = { dashboard: "Visão geral", produtos: "Produtos", estoque: "Estoque", categorias: "Categorias", importacao: "Importação CSV", configuracoes: "Configurações" };
function renderizar() {
  const area = document.querySelector("#admin-conteudo");
  area.replaceChildren();
  document.querySelectorAll("[data-admin-secao]").forEach((no) => {
    const ativo = no.dataset.adminSecao === secao;
    no.classList.toggle("ativo", ativo);
    if (ativo) no.setAttribute("aria-current", "page");
    else no.removeAttribute("aria-current");
  });
  document.querySelector("#nome-secao").textContent = vistas[secao];
  if (secao === "dashboard") mostrarPainel(area);
  else if (secao === "produtos" || secao === "estoque") mostrarProdutos(area, renderizar, secao === "estoque");
  else if (secao === "categorias") mostrarCategorias(area, renderizar);
  else if (secao === "configuracoes") mostrarConfiguracoes(area, renderizar);
  else mostrarImportacao(area);
  document.querySelector(".admin-navegacao").classList.remove("aberta");
  document.querySelector("#menu-admin").setAttribute("aria-expanded", "false");
}
function abrir(nome) {
  document.querySelector("#entrada-demo").hidden = true;
  document.querySelector("#admin-app").hidden = false;
  document.querySelector("#nome-administrador").textContent = nome || "Administrador";
  renderizar();
}
async function iniciar() {
  try {
    if(!configuracao.apiCatalogo)await iniciarRepositorio();
    const entrada = document.querySelector("#form-entrada [type=submit]");
    entrada.disabled = false;
    entrada.setAttribute("aria-busy", "false");
    entrada.querySelector("[data-texto-entrada]").textContent = configuracao.apiCatalogo ? "Entrar no painel" : "Entrar na demonstração";
    const senha=document.querySelector("#senha-admin");
    if(configuracao.apiCatalogo){senha.disabled=false;senha.required=true;senha.placeholder="Chave administrativa";document.querySelector("#aviso-login").textContent="Acesso protegido. Use a chave administrativa configurada no Worker.";document.querySelectorAll('[data-admin-secao="categorias"],[data-admin-secao="importacao"],[data-admin-secao="configuracoes"]').forEach(n=>{n.disabled=true;n.title="Integração em desenvolvimento";});try{await apiAdmin("sessao");await recarregarRepositorio();abrir("Administrador");}catch{}}

    const sessao = ler("painel-aberto", null);
    if (!configuracao.apiCatalogo && sessao && typeof sessao.nome === "string") abrir(sessao.nome.slice(0, 50));
    document.querySelector("#form-entrada").addEventListener("submit", async (evento) => {
      evento.preventDefault();
      const nome = document.querySelector("#nome-demo").value.trim().slice(0, 50) || "Administrador";
      if(configuracao.apiCatalogo){entrada.disabled=true;try{await apiAdmin("login","POST",{chave:senha.value});senha.value="";await recarregarRepositorio();}catch(e){avisar(e.message,"erro");return;}finally{entrada.disabled=false;}}else salvar("painel-aberto", { nome });
      abrir(nome);
      document.querySelector("#admin-conteudo h1").focus?.();
    });
    document.querySelectorAll("[data-admin-secao]").forEach((no) => no.addEventListener("click", () => {
      secao = no.dataset.adminSecao;
      renderizar();
    }));
    document.querySelector("#sair-demo").addEventListener("click", async () => {
      if(configuracao.apiCatalogo){try{await apiAdmin("sair","POST",{});}catch(e){avisar(e.message,"erro");return;}}
      remover("painel-aberto");
      document.querySelector("#admin-app").hidden = true;
      document.querySelector("#entrada-demo").hidden = false;
      document.querySelector("#nome-demo").focus();
    });
    document.querySelector("#menu-admin").addEventListener("click", () => {
      const nav = document.querySelector(".admin-navegacao"), abrir2 = !nav.classList.contains("aberta");
      nav.classList.toggle("aberta", abrir2);
      document.querySelector("#menu-admin").setAttribute("aria-expanded", String(abrir2));
    });
    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") {
        document.querySelector(".admin-navegacao").classList.remove("aberta");
        document.querySelector("#menu-admin").setAttribute("aria-expanded", "false");
      }
    });
  } catch (erro) {
    avisar(erro.message, "erro");
    const area = document.querySelector("#entrada-demo");
    area.append(elemento("p", "mensagem-erro", erro.message));
  }
}
iniciar();
