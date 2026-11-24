import { configuracao } from "../configuracao.js";
import { elemento, botao, moeda, memorizarFocoLista } from "../ui/dom.js";
import { icone } from "../ui/icones.js";
import { avisar, copiarTexto } from "../ui/avisos.js";
import { confirmar } from "../ui/dialogos.js";
import { obterLinhas, calcularTotais, criarMensagem, linkPedido, esvaziarCarrinho } from "./carrinho.js";
import { linhaCarrinho, estadoVazio } from "./painel-carrinho.js";
let revisando = false, pedidoDemo=null, enviandoDemo=false;
function renderizar() {
  const area = document.querySelector("#conteudo-carrinho"), restaurarFoco = memorizarFocoLista(area), linhas = obterLinhas();
  area.replaceChildren();
  if (!linhas.length) {
    area.append(estadoVazio());
    restaurarFoco();
    return;
  }
  const grade = elemento("div", "carrinho-layout"), principal = elemento("div", "carrinho-itens"), cabecalho = elemento("div", "carrinho-itens-cabecalho");
  cabecalho.append(elemento("h2", "", `${calcularTotais(linhas).quantidade} ${calcularTotais(linhas).quantidade === 1 ? "item" : "itens"} na sua lista`), botao("Esvaziar lista", "link-texto", () => confirmar("Esvaziar seu carrinho?", "Todos os itens serão removidos desta lista. Isso não altera o catálogo.", esvaziarCarrinho)));
  principal.append(cabecalho);
  linhas.forEach((item) => principal.append(linhaCarrinho(item)));
  const continuar = elemento("a", "continuar-comprando", "Continuar comprando");
  continuar.href = "catalogo.html";
  continuar.prepend(icone("seta"));
  principal.append(continuar);
  const resumo = elemento("aside", "painel resumo-pedido");
  resumo.append(elemento("p", "sobretitulo", "Seu pedido, com clareza"), elemento("h2", "", "Resumo da lista"));
  const subtotal = elemento("div", "resumo-linha");
  subtotal.append(elemento("span", "", "Subtotal"), elemento("strong", "", moeda(calcularTotais(linhas).total)));
  const frete = elemento("div", "resumo-linha");
  frete.append(elemento("span", "", "Frete e disponibilidade"), elemento("span", "texto-suave", "A confirmar"));
  const total = elemento("div", "resumo-total");
  total.append(elemento("span", "", "Total estimado"), elemento("strong", "", moeda(calcularTotais(linhas).total)));
  const revisar = botao(revisando ? "Mensagem pronta para revisão" : "Revisar pedido", "botao botao-largo", () => {
    revisando = true;
    renderizar();
    document.querySelector("#mensagem-pedido").focus();
  });
  revisar.prepend(icone("check"));
  resumo.append(subtotal, frete, total, elemento("p", "nota-demo", "Catálogo demonstrativo. Os valores, a disponibilidade e as condições reais dependem da confirmação da equipe."), revisar);
  grade.append(principal, resumo);
  area.append(grade);
  const revisao = elemento("section", "revisao-pedido painel");
  revisao.id = "revisao-pedido";
  revisao.hidden = !revisando;
  const titulo = elemento("h2", "", "Revise sua mensagem"), label = elemento("label", "campo", "Mensagem que será aberta no WhatsApp"), mensagem = elemento("textarea");
  mensagem.id = "mensagem-pedido";
  mensagem.readOnly = true;
  mensagem.rows = 10;
  mensagem.value = criarMensagem(linhas);
  label.append(mensagem);
  const acoes = elemento("div", "revisao-acoes"), copiar = botao("Copiar mensagem", "botao secundario", () => copiarTexto(mensagem.value));
  copiar.prepend(icone("copiar"));
  const url = linkPedido(linhas), enviar = botao("Confirmar pelo WhatsApp", "botao");
  enviar.prepend(icone("whatsapp"));
  enviar.disabled = !url;
  enviar.addEventListener("click", () => {
    const destino = linkPedido();
    if (!destino) {
      avisar("Confira o número da loja e a disponibilidade dos itens.", "erro");
      return;
    }
    const link = elemento("a");
    link.href = destino;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.append(link);
    link.click();
    link.remove();
    avisar("Mensagem preparada no WhatsApp. Seu carrinho foi mantido.");
  });
  acoes.append(copiar, enviar);
  if(configuracao.apiCatalogo){
    const itens=linhas.map(i=>({produto_id:i.id,quantidade:i.quantidade})).sort((a,b)=>a.produto_id.localeCompare(b.produto_id)),chave=JSON.stringify(itens);
    if(!pedidoDemo||pedidoDemo.chave!==chave){
      let anterior=null;try{anterior=JSON.parse(sessionStorage.getItem("guinho:pedido-demo")||"null");}catch{}
      pedidoDemo=anterior?.chave===chave?anterior:{chave,id:crypto.randomUUID(),enviado:false};
    }
    const status=elemento("p","nota-demo",pedidoDemo.enviado?"Pedido fictício registrado: "+pedidoDemo.id:"Não é uma compra real. Nenhum pagamento, contato ou dado pessoal será solicitado.");
    status.setAttribute("role","status");
    const simular=botao(pedidoDemo.enviado?"Pedido simulado":"Registrar pedido demonstrativo","botao",async()=>{
      if(enviandoDemo||pedidoDemo.enviado)return;
      enviandoDemo=true;simular.disabled=true;const atual=pedidoDemo;
      try{
        try{sessionStorage.setItem("guinho:pedido-demo",JSON.stringify(atual));}catch{}
        const resposta=await fetch("/api/pedidos-demo",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:atual.id,itens})}),d=await resposta.json();
        if(!resposta.ok)throw Error(d.erro||"Não foi possível simular.");
        atual.enviado=true;try{sessionStorage.setItem("guinho:pedido-demo",JSON.stringify(atual));}catch{}
        avisar("Pedido fictício registrado no painel.");
      }catch(e){avisar(e.message,"erro");}finally{enviandoDemo=false;renderizar();}
    });
    simular.disabled=enviandoDemo||pedidoDemo.enviado||linhas.some(i=>!i.valido)||linhas.length>20;
    acoes.append(simular);revisao.append(status);
  }
  revisao.append(titulo, elemento("p", "texto-suave", "Confira cada item. Você confirma o envio dentro do WhatsApp; o site não envia mensagens automaticamente."), label, acoes);
  if (!url) revisao.append(elemento("p", "mensagem-erro", linhas.some((item) => !item.valido) ? "Há itens indisponíveis ou acima do estoque demonstrativo. Ajuste sua lista antes de confirmar." : "O WhatsApp comercial ainda não foi configurado. Você já pode revisar e copiar a mensagem."));
  revisao.append(elemento("p", "nota-demo", "O carrinho não é apagado após abrir ou copiar a mensagem."));
  area.append(revisao);
  document.querySelector("#etapa-revisao").classList.toggle("ativo", revisando);
  restaurarFoco();
}
export function iniciarPagina() {
  renderizar();
  window.addEventListener("guinho:carrinho-alterado", renderizar);
  window.addEventListener("guinho:atualizar-pagina", renderizar);
}
