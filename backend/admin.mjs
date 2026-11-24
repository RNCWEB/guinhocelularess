// RNCWEB
import { validarProduto } from "../js/dados/validacao.js";
const encoder=new TextEncoder();
const digest=async s=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(s))),b=>b.toString(16).padStart(2,"0")).join("");
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
const json=(body,status=200,extra={})=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","x-robots-tag":"noindex",...extra}});
const cookie=(value,age)=>"__Host-guinho_session="+value+"; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age="+age;
const session=r=>r.headers.get("cookie")?.match(/(?:^|;\s*)__Host-guinho_session=([a-f0-9]{64})(?:;|$)/)?.[1];
const now=()=>Math.floor(Date.now()/1000);
const decode=r=>({...r,ativo:!!r.ativo,destaque:!!r.destaque,novidade:!!r.novidade,oferta:!!r.oferta,especificacoes:JSON.parse(r.especificacoes)});
async function body(r){
 if(!r.headers.get("content-type")?.toLowerCase().startsWith("application/json"))throw fail("JSON obrigatório.",415);
 const reader=r.body?.getReader();if(!reader)throw fail("Dados ausentes.");
 let n=0,chunks=[];for(;;){const {done,value}=await reader.read();if(done)break;n+=value.byteLength;if(n>32768){await reader.cancel();throw fail("Dados acima do limite.",413)}chunks.push(value)}
 const b=new Uint8Array(n);let offset=0;for(const c of chunks){b.set(c,offset);offset+=c.byteLength}
 try{const d=JSON.parse(new TextDecoder().decode(b));if(!d||typeof d!=="object"||Array.isArray(d))throw Error();return d}catch{throw fail("JSON inválido.")}
}
const fields=["id","sku","nome","marca","modelo","categoria","precoCentavos","estoque","ativo","destaque","novidade","oferta","selo","descricao","especificacoes"];
const vals=p=>fields.map(k=>k==="especificacoes"?JSON.stringify(p[k]):typeof p[k]==="boolean"?Number(p[k]):p[k]);
const audit=(db,s)=>db.prepare("INSERT INTO historico_admin(descricao) VALUES (?)").bind(s);
export async function admin(r,env){
 const db=env.DB,path=new URL(r.url).pathname,method=r.method;
 try{
  if(method!=="GET"&&r.headers.get("origin")!==new URL(r.url).origin)throw fail("Origem não autorizada.",403);
  if(path==="/api/admin/login"&&method==="POST"){
   if(typeof env.GUINHO_ADMIN_KEY!=="string"||env.GUINHO_ADMIN_KEY.length<32)throw fail("Acesso administrativo ainda não configurado.",503);
   const d=await body(r),ip=await digest(r.headers.get("CF-Connecting-IP")||"local"),minute=Math.floor(now()/60);
   await db.prepare("DELETE FROM limite_login WHERE janela<?").bind(minute-10).run();
   const limit=await db.prepare("INSERT INTO limite_login(chave,janela,tentativas) VALUES(?,?,1) ON CONFLICT(chave) DO UPDATE SET tentativas=CASE WHEN janela=excluded.janela THEN tentativas+1 ELSE 1 END, janela=excluded.janela RETURNING tentativas").bind(ip,minute).first();
   if(limit.tentativas>5)throw fail("Muitas tentativas. Tente em um minuto.",429);
   const a=await digest(typeof d.chave==="string"?d.chave:""),b=await digest(env.GUINHO_ADMIN_KEY);let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
   if(diff)throw fail("Credencial inválida.",401);
   const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,"0")).join("");
   await db.batch([db.prepare("DELETE FROM sessoes_admin WHERE expira<=?").bind(now()),db.prepare("INSERT INTO sessoes_admin(hash,expira) VALUES(?,?)").bind(await digest(token),now()+28800)]);
   return json({ok:true},200,{"set-cookie":cookie(token,28800)});
  }
  const token=session(r);
  if(!token||!await db.prepare("SELECT 1 FROM sessoes_admin WHERE hash=? AND expira>?").bind(await digest(token),now()).first())throw fail("Entre no painel para continuar.",401);
  if(path==="/api/admin/sessao"&&method==="GET")return json({ok:true});
  if(path==="/api/admin/sair"&&method==="POST"){await db.prepare("DELETE FROM sessoes_admin WHERE hash=?").bind(await digest(token)).run();return json({ok:true},200,{"set-cookie":cookie("",0)});}
  if(path==="/api/admin/catalogo"&&method==="GET"){
   const [c,p,h]=await db.batch([db.prepare("SELECT id,nome,icone FROM categorias ORDER BY rowid"),db.prepare("SELECT * FROM produtos ORDER BY rowid"),db.prepare("SELECT descricao,data FROM historico_admin ORDER BY id DESC LIMIT 30")]);
   return json({categorias:c.results,produtos:p.results.map(decode),alteracoes:h.results.map(x=>({...x,data:x.data.replace(" ","T")+"Z"}))});
  }
  const match=path.match(/^\/api\/admin\/produtos\/([a-z0-9-]{1,80})$/);
  if((path==="/api/admin/produtos"&&method==="POST")||(match&&method==="PUT")){
   const d=await body(r),cats=(await db.prepare("SELECT id,nome,icone FROM categorias").all()).results;let p;
   try{p=validarProduto({...d,id:match?match[1]:undefined},cats)}catch(e){throw fail(e.message)}
   if(match&&!await db.prepare("SELECT id FROM produtos WHERE id=?").bind(p.id).first())throw fail("Produto não encontrado.",404);
   const st=match?db.prepare("UPDATE produtos SET "+fields.slice(1).map(k=>k+"=?").join(",")+" WHERE id=?").bind(...vals(p).slice(1),p.id):db.prepare("INSERT INTO produtos ("+fields.join(",")+") VALUES ("+fields.map(()=>"?").join(",")+")").bind(...vals(p));
   await db.batch([st,audit(db,(match?"Produto atualizado: ":"Produto cadastrado: ")+p.nome)]);return json(p,match?200:201);
  }
  if(match&&method==="DELETE"){await db.batch([db.prepare("DELETE FROM produtos WHERE id=?").bind(match[1]),audit(db,"Produto removido: "+match[1])]);return json({ok:true})}
  return json({erro:"Rota inexistente."},404);
 }catch(e){if(e.status)return json({erro:e.message},e.status);if(/constraint|UNIQUE|FOREIGN KEY/i.test(e.message||""))return json({erro:"Registro duplicado ou relacionado."},409);return json({erro:"Operação temporariamente indisponível."},503)}
}
