// RNCWEB
const erro=(message,status=400)=>Object.assign(new Error(message),{status});
const idOk=s=>typeof s==="string"&&/^[a-z0-9-]{1,80}$/.test(s);
const audit=(db,s)=>db.prepare("INSERT INTO historico_admin(descricao) VALUES (?)").bind(s);
export async function operacao(db,path,method,ler){
 if(path==="/api/admin/pedidos"&&method==="GET"){
  const [p,i]=await db.batch([db.prepare("SELECT * FROM pedidos ORDER BY criado DESC,id DESC LIMIT 100"),db.prepare("SELECT i.* FROM pedido_itens i JOIN (SELECT id FROM pedidos ORDER BY criado DESC,id DESC LIMIT 100) p ON p.id=i.pedido_id")]);
  return {body:p.results.map(p=>({...p,itens:i.results.filter(i=>i.pedido_id===p.id)}))};
 }
 if(path==="/api/admin/pedidos"&&method==="POST"){
  const d=await ler();if(!Array.isArray(d.itens)||!d.itens.length||d.itens.length>20)throw erro("Selecione de 1 a 20 produtos.");
  const cliente=String(d.cliente??"").trim().slice(0,100);if(!cliente)throw erro("Informe o nome fictício.");
  const id=d.id;if(!idOk(id)||id.length!==36)throw erro("Identificador inválido.");
  const existente=await db.prepare("SELECT id FROM pedidos WHERE id=?").bind(id).first();if(existente)return {body:{id,repetido:true}};
  const ids=new Set(),stmts=[db.prepare("INSERT INTO pedidos(id,cliente) VALUES(?,?)").bind(id,cliente)];
  for(const i of d.itens){if(!idOk(i?.produto_id)||ids.has(i.produto_id)||!Number.isSafeInteger(i.quantidade)||i.quantidade<1||i.quantidade>999)throw erro("Item inválido ou repetido.");ids.add(i.produto_id);
   const p=await db.prepare("SELECT id,nome,sku,precoCentavos,ativo,estoque FROM produtos WHERE id=?").bind(i.produto_id).first();if(!p||!p.ativo||p.estoque<i.quantidade)throw erro("Produto indisponível ou estoque insuficiente.",409);
   stmts.push(db.prepare("INSERT INTO pedido_itens(pedido_id,produto_id,nome,sku,quantidade,preco,custo) VALUES(?,?,?,?,?,?,?)").bind(id,p.id,p.nome,p.sku,i.quantidade,p.precoCentavos,Math.round(p.precoCentavos*.6)));
  }
  await db.batch([...stmts,audit(db,"Pedido demonstrativo criado: "+id)]);return {body:{id},status:201};
 }
 const m=path.match(/^\/api\/admin\/pedidos\/([a-z0-9-]{1,80})$/);
 if(m&&method==="PATCH"){
  const d=await ler();if(!["concluido","cancelado"].includes(d.status))throw erro("Status inválido.");
  const p=await db.prepare("SELECT status FROM pedidos WHERE id=?").bind(m[1]).first();if(!p)throw erro("Pedido não encontrado.",404);
  if(p.status===d.status)return {body:{ok:true}};
  try{await db.batch([db.prepare("UPDATE pedidos SET status=?,atualizado=CURRENT_TIMESTAMP WHERE id=?").bind(d.status,m[1]),audit(db,"Pedido "+d.status+": "+m[1])]);}catch(e){if(/estoque insuficiente|transicao invalida|pedido vazio|CHECK constraint/i.test(e.message))throw erro("Operação incompatível com o status ou estoque disponível.",409);throw e}
  return {body:{ok:true}};
 }
 if(path==="/api/admin/indicadores"&&method==="GET"){
  const [v,s,b,t,m]=await db.batch([
   db.prepare("SELECT COALESCE(SUM(i.preco*i.quantidade),0) faturamento,COALESCE(SUM(i.custo*i.quantidade),0) custo,COUNT(DISTINCT p.id) vendas FROM pedidos p JOIN pedido_itens i ON p.id=i.pedido_id WHERE p.status='concluido'"),
   db.prepare("SELECT status,COUNT(*) total FROM pedidos GROUP BY status"),
   db.prepare("SELECT id,nome,estoque FROM produtos WHERE ativo=1 AND estoque<=5 ORDER BY estoque,nome LIMIT 30"),
   db.prepare("SELECT i.nome,SUM(i.quantidade) quantidade FROM pedido_itens i JOIN pedidos p ON p.id=i.pedido_id WHERE p.status='concluido' GROUP BY i.produto_id,i.nome ORDER BY quantidade DESC LIMIT 8"),
   db.prepare("SELECT * FROM estoque_movimentos ORDER BY id DESC LIMIT 50")]);
  const x=v.results[0];return {body:{...x,lucroEstimado:x.faturamento-x.custo,ticketMedio:x.vendas?Math.round(x.faturamento/x.vendas):0,status:s.results,baixo:b.results,ranking:t.results,movimentos:m.results}};
 }
 if(path==="/api/admin/exportacao"&&method==="GET"){
  const tables=["categorias","produtos","pedidos","pedido_itens","estoque_movimentos","config_loja","historico_admin"];const results=await db.batch(tables.map(t=>db.prepare("SELECT * FROM "+t)));
  return {body:{versao:1,exportado:new Date().toISOString(),demonstracao:true,...Object.fromEntries(tables.map((t,i)=>[t,results[i].results]))}};
 }
 return null;
}
