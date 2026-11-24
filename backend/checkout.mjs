// RNCWEB
import { operacao } from "./operacao.mjs";
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
async function ler(r){
 if(!r.headers.get("content-type")?.toLowerCase().startsWith("application/json"))throw fail("JSON obrigatório.",415);
 const reader=r.body?.getReader();if(!reader)throw fail("Dados ausentes.");
 const chunks=[];let size=0;for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>8192){await reader.cancel();throw fail("Dados acima do limite.",413)}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.byteLength}
 try{const d=JSON.parse(new TextDecoder().decode(bytes));if(!d||typeof d!=="object"||Array.isArray(d))throw Error();return d}catch{throw fail("JSON inválido.")}
}
async function limite(db,key,janela,max){
 const r=await db.prepare("INSERT INTO limite_pedido_publico(chave,janela,tentativas) VALUES(?,?,1) ON CONFLICT(chave) DO UPDATE SET tentativas=CASE WHEN janela=excluded.janela THEN tentativas+1 ELSE 1 END,janela=excluded.janela RETURNING tentativas").bind(key,janela).first();
 if(r.tentativas>max)throw fail("Limite de demonstrações atingido. Tente mais tarde.",429);
}
export async function checkout(request,env){
 const json=(d,status=200)=>new Response(JSON.stringify(d),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","x-robots-tag":"noindex"}});
 try{
 if(request.method!=="POST")return json({erro:"Método não permitido."},405);
 if(request.headers.get("origin")!==new URL(request.url).origin)throw fail("Origem não autorizada.",403);
 if(typeof env.GUINHO_ADMIN_KEY!=="string"||env.GUINHO_ADMIN_KEY.length<32)throw fail("Demonstração temporariamente indisponível.",503);
 const d=await ler(request);
 if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(d.id??"")||!Array.isArray(d.itens)||!d.itens.length||d.itens.length>20)throw fail("Pedido demonstrativo inválido.");
 const ids=new Set();for(const i of d.itens){if(typeof i?.produto_id!=="string"||!/^[a-z0-9-]{1,80}$/.test(i.produto_id)||ids.has(i.produto_id)||!Number.isSafeInteger(i.quantidade)||i.quantidade<1||i.quantidade>999)throw fail("Item inválido.");ids.add(i.produto_id)}
 const db=env.DB,janela=Math.floor(Date.now()/3600000),ip=request.headers.get("CF-Connecting-IP");
 if(!ip)throw fail("Demonstração temporariamente indisponível.",503);
 const encoder=new TextEncoder(),key=await crypto.subtle.importKey("raw",encoder.encode(env.GUINHO_ADMIN_KEY),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const signature=await crypto.subtle.sign("HMAC",key,encoder.encode("checkout:"+janela+":"+ip));
 const hash=Array.from(new Uint8Array(signature),x=>x.toString(16).padStart(2,"0")).join("");
 await limite(db,"global",janela,30);
 await limite(db,hash,janela,3);
 await db.prepare("DELETE FROM limite_pedido_publico WHERE janela<?").bind(janela-1).run();
 const data={id:d.id,cliente:"Pedido do catálogo (demo)",itens:d.itens.map(i=>({produto_id:i.produto_id,quantidade:i.quantidade}))};
 try{const op=await operacao(db,"/api/admin/pedidos","POST",async()=>data);return json({id:op.body.id,demonstracao:true},op.status||200)}catch(e){
 if(/UNIQUE constraint.*pedidos\.id/i.test(e.message||""))return json({id:d.id,demonstracao:true},200);throw e;
 }
 }catch(e){return json({erro:e.status?e.message:"Demonstração temporariamente indisponível."},e.status||503);}
}
