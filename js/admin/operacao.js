// RNCWEB
import { apiAdmin, obterCatalogo, recarregarRepositorio } from "../dados/repositorio.js";
import { elemento, botao, moeda } from "../ui/dom.js";
import { avisar } from "../ui/avisos.js";
import { campo, opcao, tabela, cabecalhoPagina } from "./componentes.js";
const labels={pendente:"Pendente",concluido:"Concluído",cancelado:"Cancelado"};
const sum=(p,k)=>p.itens.reduce((s,i)=>s+i.quantidade*i[k],0);
const td=(r,v)=>r.append(elemento("td","",String(v)));
const data=s=>new Date(s.replace(" ","T")+"Z").toLocaleString("pt-BR");
async function tarefa(button,fn){button.disabled=true;try{await fn()}catch(e){avisar(e.message,"erro")}finally{button.disabled=false}}
export async function mostrarPedidos(area,atualizar){
 area.append(cabecalhoPagina("Pedidos demonstrativos","Crie e conclua vendas fictícias. A conclusão baixa o estoque; o cancelamento estorna. Nenhuma cobrança é realizada."));
 const box=elemento("section","painel"),form=elemento("form","form-admin"),grade=elemento("div","form-grade");
 campo(form,"cliente","Cliente fictício","text","Assistência Exemplo",{required:true,maxlength:100});
 const linhas=elemento("div","form-admin"),produtos=obterCatalogo().produtos.filter(p=>p.ativo&&p.estoque>0);
 const add=()=>{if(linhas.children.length>=20)return;const row=elemento("div","form-grade"),select=campo(row,"produto","Produto","select");produtos.forEach(p=>opcao(select,p.id,p.nome+" · "+moeda(p.precoCentavos)+" · "+p.estoque+" un."));select.required=true;campo(row,"quantidade","Quantidade","number",1,{required:true,min:1,max:999,step:1});const del=botao("Remover item","botao discreto",()=>{if(linhas.children.length>1)row.remove()});row.append(del);linhas.append(row);};
 add();form.append(linhas,botao("Adicionar item","botao secundario",add));const submit=elemento("button","botao","Registrar pedido fictício");submit.type="submit";submit.disabled=!produtos.length;form.append(submit);box.append(form);area.append(box);
 let id=crypto.randomUUID();
 form.addEventListener("submit",e=>{e.preventDefault();tarefa(submit,async()=>{const itens=[...linhas.children].map(r=>({produto_id:r.querySelector("select").value,quantidade:Number(r.querySelector('input[type="number"]').value)}));await apiAdmin("pedidos","POST",{id,cliente:form.elements.cliente.value,itens});id=crypto.randomUUID();await recarregarRepositorio();avisar("Pedido registrado.");atualizar();});});
 const lista=elemento("section","painel");lista.append(elemento("h2","","Últimos pedidos"));area.append(lista);
 try{const pedidos=await apiAdmin("pedidos");if(!lista.isConnected)return;
 const {caixa,corpo}=tabela(["Pedido / cliente","Itens","Total","Situação","Ações"]);lista.append(caixa);
 for(const p of pedidos){const r=elemento("tr");td(r,p.cliente+" · "+data(p.criado));td(r,p.itens.map(i=>i.quantidade+"× "+i.nome).join("; "));td(r,moeda(sum(p,"preco")));td(r,labels[p.status]);const a=elemento("td","acoes-tabela");
 for(const [status,label] of [["concluido","Concluir"],["cancelado","Cancelar"]]){if(status==="concluido"&&p.status!=="pendente"||status==="cancelado"&&p.status==="cancelado")continue;const b=botao(label,"botao secundario botao-pequeno",()=>{if(!window.confirm(label+" este pedido fictício?"))return;tarefa(b,async()=>{await apiAdmin("pedidos/"+p.id,"PATCH",{status});await recarregarRepositorio();avisar("Pedido atualizado.");atualizar();});});a.append(b);}r.append(a);corpo.append(r);}
 if(!pedidos.length)lista.append(elemento("p","texto-suave","Nenhum pedido registrado."));
 }catch(e){if(lista.isConnected)lista.append(elemento("p","mensagem-erro",e.message));}
}
export async function mostrarIndicadores(area){
 const box=elemento("section","painel");box.append(elemento("h2","","Desempenho comercial fictício"),elemento("p","texto-suave","Receita e ticket de pedidos concluídos. Custo estimado em 60% do preço registrado; margem bruta estimada, não lucro líquido."));area.append(box);
 try{const d=await apiAdmin("indicadores");if(!box.isConnected)return;
 const cards=elemento("div","admin-indicadores");for(const [label,value] of [["Faturamento",moeda(d.faturamento)],["Custo estimado",moeda(d.custo)],["Margem bruta estimada",moeda(d.lucroEstimado)],["Ticket médio",moeda(d.ticketMedio)],["Vendas concluídas",d.vendas]]){const c=elemento("article","indicador");c.append(elemento("span","",label),elemento("strong","",value));cards.append(c);}box.append(cards);
 const pedidos=await apiAdmin("pedidos");if(!box.isConnected)return;
 const painel=elemento("div","comercial-grade"),vendas=elemento("section","comercial-bloco"),situacao=elemento("section","comercial-bloco");
 vendas.append(elemento("h2","","Vendas por dia"),elemento("p","texto-suave","Últimos 14 dias · pedidos concluídos entre os 100 mais recentes, por data de criação."));
 const hoje=new Date(),dias=Array.from({length:14},(_,i)=>{const dia=new Date(hoje);dia.setDate(hoje.getDate()-13+i);const key=dia.toISOString().slice(0,10);return {key,total:pedidos.filter(p=>p.status==="concluido"&&p.criado.slice(0,10)===key).reduce((s,p)=>s+sum(p,"preco"),0)}}),maior=Math.max(1,...dias.map(d=>d.total));
 const chart=elemento("div","vendas-grafico");chart.setAttribute("role","group");chart.setAttribute("aria-label","Receita diária demonstrativa");
 for(const dia of dias){const coluna=elemento("div","vendas-coluna"),track=elemento("div","vendas-trilho"),bar=elemento("span","vendas-barra");bar.style.height=Math.max(dia.total?3:0,dia.total/maior*100)+"%";track.append(bar);const texto=dia.key.slice(8)+"/"+dia.key.slice(5,7);coluna.append(track,elemento("small","",texto));coluna.title=texto+": "+moeda(dia.total);coluna.setAttribute("aria-label",coluna.title);chart.append(coluna);}vendas.append(chart);
 vendas.append(elemento("strong","vendas-total",moeda(dias.reduce((s,d)=>s+d.total,0))));
 situacao.append(elemento("h2","","Situação dos pedidos"),elemento("p","texto-suave","Todos os pedidos registrados na demonstração."));
 const total=d.status.reduce((s,p)=>s+p.total,0);situacao.append(elemento("strong","vendas-total",String(total)));
 const segmentos=elemento("div","situacao-trilho");for(const status of ["concluido","pendente","cancelado"]){const n=d.status.find(x=>x.status===status)?.total||0;const part=elemento("span","situacao-"+status);part.style.flex=String(n);segmentos.append(part);}situacao.append(segmentos);
 for(const status of ["concluido","pendente","cancelado"]){const linha=elemento("div","situacao-legenda"),label=elemento("span");label.append(elemento("i","situacao-"+status),document.createTextNode(labels[status]));linha.append(label,elemento("strong","",String(d.status.find(x=>x.status===status)?.total||0)));situacao.append(linha);}
 painel.append(vendas,situacao);box.append(painel);
 const recent=elemento("section","comercial-bloco");recent.append(elemento("h2","","Pedidos recentes"));const rt=tabela(["Cliente","Data","Total","Status"]);for(const pedido of pedidos.slice(0,5)){const tr=elemento("tr");td(tr,pedido.cliente);td(tr,data(pedido.criado));td(tr,moeda(sum(pedido,"preco")));const cell=elemento("td");cell.append(elemento("span","status-pedido status-"+pedido.status,labels[pedido.status]));tr.append(cell);rt.corpo.append(tr);}recent.append(rt.caixa);box.append(recent);
 const max=Math.max(1,...d.ranking.map(x=>x.quantidade));box.append(elemento("h2","","Produtos mais vendidos"));for(const x of d.ranking){const row=elemento("div","categoria-barra"),label=elemento("div"),bar=elemento("span","barra"),fill=elemento("i");label.append(elemento("span","",x.nome),elemento("b","",x.quantidade));fill.style.width=(x.quantidade/max*100)+"%";bar.append(fill);row.append(label,bar);box.append(row);}
 box.append(elemento("h2","","Estoque baixo (até 5 unidades)"));for(const x of d.baixo)box.append(elemento("p","texto-suave",x.nome+" — "+x.estoque+" un."));if(!d.baixo.length)box.append(elemento("p","texto-suave","Nenhum alerta."));
 box.append(elemento("h2","","Movimentações recentes"));const {caixa,corpo}=tabela(["Produto","Antes","Depois","Data"]);for(const x of d.movimentos){const tr=elemento("tr");for(const v of [x.nome,x.anterior,x.atual,data(x.data)])td(tr,v);corpo.append(tr);}box.append(caixa);
 const exp=botao("Exportar backup JSON","botao secundario",()=>tarefa(exp,async()=>{const d=await apiAdmin("exportacao"),url=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:"application/json"})),a=elemento("a");a.href=url;a.download="guinho-backup-demo.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}));box.append(exp);
 }catch(e){if(box.isConnected)box.append(elemento("p","mensagem-erro",e.message));}
}
