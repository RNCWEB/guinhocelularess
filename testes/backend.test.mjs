// RNCWEB
import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import worker from "../backend/worker.mjs";
const db=new DatabaseSync(":memory:");
db.exec("PRAGMA foreign_keys=ON");
for(const file of ["0001_catalogo.sql","0002_demonstracao.sql","0003_admin.sql","0004_config.sql","0005_operacao.sql","0006_pedidos_demo.sql","0007_checkout_demo.sql"])db.exec(readFileSync(new URL("../migrations/"+file,import.meta.url),"utf8"));
const env={DB:{prepare(sql){let params=[];const st=db.prepare(sql);return {bind(...p){params=p;return this},async first(){return st.get(...params)??null},async all(){return {results:st.all(...params)}},async run(){return st.run(...params)}}},async batch(stmts){db.exec("BEGIN");try{const results=[];for(const s of stmts)results.push(await s.all());db.exec("COMMIT");return results;}catch(e){db.exec("ROLLBACK");throw e;}}},ASSETS:{fetch:()=>new Response("static")}};
const req=(p,method="GET")=>worker.fetch(new Request("https://teste.invalid"+p,{method}),env);
test("schema e dados iniciais",()=>{assert.equal(db.prepare("SELECT count(*) AS n FROM produtos").get().n,27);assert.equal(db.prepare("SELECT count(*) AS n FROM categorias").get().n,9);assert.throws(()=>db.exec("UPDATE produtos SET estoque=-1"));assert.throws(()=>db.exec("UPDATE produtos SET categoria='inexistente'"));});
test("catálogo público preserva o formato da loja",async()=>{const r=await req("/api/catalogo");assert.equal(r.status,200);const d=await r.json();assert.equal(d.categorias.length,9);assert.ok(d.produtos.length>0);assert.ok(d.produtos.every(p=>p.ativo===true && typeof p.especificacoes==="object"));});
test("consulta por ID e rotas inválidas",async()=>{assert.equal((await req("/api/produtos/tela-iphone11")).status,200);assert.equal((await req("/api/produtos/nao-existe")).status,404);assert.equal((await req("/api/nao-existe")).status,404);});
test("escrita pública bloqueada e arquivos encaminhados",async()=>{assert.equal((await req("/api/produtos","POST")).status,405);assert.equal(await (await req("/")).text(),"static");assert.equal((await req("/api/saude")).status,200);});

test("admin sem sessão não pode ler ou gravar",async()=>{assert.equal((await req("/api/admin/catalogo")).status,401);const r=await worker.fetch(new Request("https://teste.invalid/api/admin/produtos",{method:"POST",headers:{origin:"https://teste.invalid","content-type":"application/json"},body:"{}"}),env);assert.equal(r.status,401);});
test("login sem chave configurada falha fechado e origem externa é bloqueada",async()=>{const call=origin=>worker.fetch(new Request("https://teste.invalid/api/admin/login",{method:"POST",headers:{origin,"content-type":"application/json"},body:'{"chave":"teste"}'}),env);assert.equal((await call("https://teste.invalid")).status,503);assert.equal((await call("https://outra.invalid")).status,403);});
test("sessão protegida, CRUD de produto e logout",async()=>{env.GUINHO_ADMIN_KEY="teste-local-apenas-uma-chave-ficticia-32";const call=(path,method,body,cookie)=>worker.fetch(new Request("https://teste.invalid"+path,{method,headers:{origin:"https://teste.invalid","content-type":"application/json",...(cookie?{cookie}:{})},...(body?{body:JSON.stringify(body)}:{})}),env);const login=await call("/api/admin/login","POST",{chave:env.GUINHO_ADMIN_KEY});assert.equal(login.status,200);const header=login.headers.get("set-cookie");assert.match(header,/HttpOnly/);const cookie=header.split(";")[0];assert.equal((await call("/api/admin/catalogo","GET",null,cookie)).status,200);const p={nome:"Teste fictício",sku:"TESTE01",marca:"Demo",modelo:"Demo",categoria:"telas",precoCentavos:1234,estoque:3};assert.equal((await call("/api/admin/produtos","POST",p,cookie)).status,201);assert.equal((await req("/api/produtos/teste01")).status,200);assert.equal((await call("/api/admin/produtos/teste01","PUT",{...p,estoque:4},cookie)).status,200);assert.equal((await call("/api/admin/produtos/teste01","DELETE",null,cookie)).status,200);assert.equal((await call("/api/admin/sair","POST",{},cookie)).status,200);assert.equal((await call("/api/admin/catalogo","GET",null,cookie)).status,401);delete env.GUINHO_ADMIN_KEY;});

test("categorias, configuração compartilhada e importação autenticadas",async()=>{env.GUINHO_ADMIN_KEY="teste-local-apenas-uma-chave-ficticia-32";const call=(path,method,body,cookie)=>worker.fetch(new Request("https://teste.invalid"+path,{method,headers:{origin:"https://teste.invalid","content-type":"application/json",...(cookie?{cookie}:{})},...(body?{body:JSON.stringify(body)}:{})}),env);const login=await call("/api/admin/login","POST",{chave:env.GUINHO_ADMIN_KEY});assert.equal(login.status,200);const cookie=login.headers.get("set-cookie").split(";")[0];assert.equal((await call("/api/admin/categorias","POST",{nome:"Teste categoria",icone:"caixa"},cookie)).status,201);assert.equal((await call("/api/admin/configuracao","PUT",{nome:"Guinho demo"},cookie)).status,200);assert.equal((await (await req("/api/catalogo")).json()).configuracao.nome,"Guinho demo");const p={nome:"Importado fictício",sku:"IMPORT01",marca:"Demo",modelo:"Demo",categoria:"teste-categoria",precoCentavos:1234,estoque:3};assert.equal((await call("/api/admin/importacao","POST",{produtos:[p]},cookie)).status,200);assert.equal((await call("/api/admin/categorias/teste-categoria","DELETE",null,cookie)).status,409);assert.equal((await call("/api/admin/produtos/import01","DELETE",null,cookie)).status,200);assert.equal((await call("/api/admin/categorias/teste-categoria","DELETE",null,cookie)).status,200);await call("/api/admin/sair","POST",{},cookie);delete env.GUINHO_ADMIN_KEY;});

test("pedido: baixa atômica, repetição, estorno e bloqueio de estoque",async()=>{
env.GUINHO_ADMIN_KEY="teste-local-apenas-uma-chave-ficticia-32";
const call=(path,method,body,cookie)=>worker.fetch(new Request("https://teste.invalid"+path,{method,headers:{origin:"https://teste.invalid","content-type":"application/json",...(cookie?{cookie}:{}),"CF-Connecting-IP":"test-orders"},...(body?{body:JSON.stringify(body)}:{})}),env);
assert.equal((await req("/api/admin/pedidos")).status,401);
const l=await call("/api/admin/login","POST",{chave:env.GUINHO_ADMIN_KEY});assert.equal(l.status,200);const cookie=l.headers.get("set-cookie").split(";")[0],id=crypto.randomUUID(),prod="tela-iphone11",stock=()=>db.prepare("SELECT estoque FROM produtos WHERE id=?").get(prod).estoque,initial=stock();
const payload={id,cliente:"Exemplo",itens:[{produto_id:prod,quantidade:2}]};
assert.equal((await call("/api/admin/pedidos","POST",payload,cookie)).status,201);
assert.equal((await call("/api/admin/pedidos","POST",payload,cookie)).status,200);assert.equal(stock(),initial);
assert.equal((await call("/api/admin/pedidos/"+id,"PATCH",{status:"concluido"},cookie)).status,200);assert.equal(stock(),initial-2);
assert.equal((await call("/api/admin/pedidos/"+id,"PATCH",{status:"concluido"},cookie)).status,200);assert.equal(stock(),initial-2);
assert.equal((await call("/api/admin/pedidos/"+id,"PATCH",{status:"cancelado"},cookie)).status,200);assert.equal(stock(),initial);
assert.equal((await call("/api/admin/pedidos/"+id,"PATCH",{status:"concluido"},cookie)).status,409);
assert.equal((await call("/api/admin/pedidos","POST",{...payload,id:crypto.randomUUID(),itens:[{produto_id:prod,quantidade:999}]},cookie)).status,409);
const dashboard=await call("/api/admin/indicadores","GET",null,cookie);assert.equal(dashboard.status,200);assert.ok((await dashboard.json()).vendas>=1);
const backup=await call("/api/admin/exportacao","GET",null,cookie);assert.equal(backup.status,200);assert.equal("sessoes_admin" in await backup.json(),false);
await call("/api/admin/sair","POST",{},cookie);delete env.GUINHO_ADMIN_KEY;
});

test("checkout público limitado, sem dados pessoais e preço calculado pelo servidor",async()=>{
env.GUINHO_ADMIN_KEY="teste-local-apenas-uma-chave-ficticia-32";
const id=crypto.randomUUID(),p="tela-iphone11",antes=db.prepare("SELECT estoque,precoCentavos FROM produtos WHERE id=?").get(p);
const payload={id,cliente:"nao armazenar",itens:[{produto_id:p,quantidade:1,preco:1}],status:"concluido"};
const call=(data,origin="https://teste.invalid")=>worker.fetch(new Request("https://teste.invalid/api/pedidos-demo",{method:"POST",headers:{origin,"content-type":"application/json","CF-Connecting-IP":"test-public-checkout"},body:JSON.stringify(data)}),env);
assert.equal((await call(payload,"https://outra.invalid")).status,403);
assert.equal((await call(payload)).status,201);
assert.equal((await call(payload)).status,200);
assert.equal(db.prepare("SELECT COUNT(*) n FROM pedidos WHERE id=?").get(id).n,1);
assert.equal(db.prepare("SELECT cliente,status FROM pedidos WHERE id=?").get(id).cliente,"Pedido do catálogo (demo)");
assert.equal(db.prepare("SELECT status FROM pedidos WHERE id=?").get(id).status,"pendente");
assert.equal(db.prepare("SELECT preco FROM pedido_itens WHERE pedido_id=?").get(id).preco,antes.precoCentavos);
assert.equal(db.prepare("SELECT estoque FROM produtos WHERE id=?").get(p).estoque,antes.estoque);
assert.equal((await call({...payload,id:crypto.randomUUID()})).status,201);
assert.equal((await call({...payload,id:crypto.randomUUID()})).status,429);
assert.equal((await req("/api/pedidos-demo")).status,405);
delete env.GUINHO_ADMIN_KEY;
});
