// RNCWEB
import assert from "node:assert/strict";
const base="https://rncweb-guinho-1470450074.renancodando.workers.dev";
async function get(path,status=200){
 const r=await fetch(base+path,{cache:"no-store",signal:AbortSignal.timeout(15000)});assert.equal(r.status,status,path);return r;
}
const s=await (await get("/api/saude")).json();assert.equal(s.banco,"conectado");
const c=await (await get("/api/catalogo")).json();assert.ok(Array.isArray(c.produtos)&&Array.isArray(c.categorias));assert.ok(c.produtos.every(p=>p.estoque>=0&&Number.isInteger(p.precoCentavos)));
assert.match(await (await get("/")).text(),/Guinho/i);
assert.match(await (await get("/admin/")).text(),/senha-admin/);
assert.match(await (await get("/js/admin/operacao.js")).text(),/mostrarPedidos/);
for(const path of ["/api/admin/pedidos","/api/admin/catalogo","/api/admin/indicadores","/api/admin/exportacao"])await get(path,401);
await get("/api/pedidos-demo",405);
await get("/api/nao-existe",404);
console.log("Smoke externo: 11 verificações aprovadas. Sem gravação de dados.");
