// RNCWEB
import assert from "node:assert/strict";
import {setTimeout as pause} from "node:timers/promises";
const base="https://rncweb-guinho-1470450074.renancodando.workers.dev";
async function get(path,status=200){
 const url=new URL(path,base);url.searchParams.set("_validar",process.env.GITHUB_SHA||String(Date.now()));url.searchParams.set("_r",String(Date.now()));
 const r=await fetch(url,{cache:"no-store",headers:{"Cache-Control":"no-cache"},signal:AbortSignal.timeout(15000)});assert.equal(r.status,status,path);return r;
}
let last;
for(let i=0;i<8;i++){
 try{
  assert.match(await (await get("/")).text(),/css\/identidade\.css/);
  assert.match(await (await get("/css/identidade.css")).text(),/comercial-grade/);
  assert.match(await (await get("/admin/")).text(),/css\/identidade\.css/);
  assert.match(await (await get("/js/admin/operacao.js")).text(),/Vendas por dia/);
  assert.doesNotMatch(await (await get("/js/loja/estrutura.js")).text(),/href=["'](?:\.\/|\/)?admin\/?["']/i);
  last=null;break;
 }catch(e){last=e;if(i<7){console.log("Versão visual ainda não disponível em todos os pontos; nova tentativa.");await pause(5000);}}
}
if(last)throw last;
const s=await (await get("/api/saude")).json();assert.equal(s.banco,"conectado");
const c=await (await get("/api/catalogo")).json();assert.ok(Array.isArray(c.produtos)&&Array.isArray(c.categorias));assert.ok(c.produtos.every(p=>p.estoque>=0&&Number.isInteger(p.precoCentavos)));
for(const path of ["/catalogo.html","/carrinho.html"])assert.match(await (await get(path)).text(),/css\/identidade\.css/);
for(const path of ["/api/admin/pedidos","/api/admin/catalogo","/api/admin/indicadores","/api/admin/exportacao"])await get(path,401);
await get("/api/pedidos-demo",405);await get("/api/nao-existe",404);
console.log("Smoke externo: 15 verificações aprovadas. Redesign confirmado. Sem gravação de dados.");
