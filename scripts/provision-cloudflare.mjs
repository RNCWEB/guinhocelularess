// RNCWEB
import { readFile,writeFile } from "node:fs/promises";
const token=process.env.CLOUDFLARE_API_TOKEN, account=process.env.CLOUDFLARE_ACCOUNT_ID;
if (!token || !/^[a-f0-9]{32}$/i.test(account??"")) throw Error("Secrets ausentes ou inválidos.");
const name="rncweb-guinho-1470450074";
const base="https://api.cloudflare.com/client/v4/accounts/"+account+"/d1/database";
async function cf(url,options={}) {
  const response=await fetch(url,{...options,headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},signal:AbortSignal.timeout(30000)});
  const data=await response.json();
  if (!response.ok || !data.success) throw Error("Cloudflare D1: HTTP "+response.status+"; códigos "+(data.errors??[]).map(x=>x.code).join(","));
  return data.result;
}
const listed=await cf(base+"?name="+encodeURIComponent(name)+"&per_page=100");
if (!Array.isArray(listed)) throw Error("Resposta D1 inesperada.");
const matches=listed.filter(d=>d.name===name);
if (matches.length>1) throw Error("Nome D1 ambíguo.");
const db=matches[0]??await cf(base,{method:"POST",body:JSON.stringify({name})});
if (db.name!==name || !/^[a-f0-9-]{36}$/i.test(db.uuid??"")) throw Error("ID D1 inválido.");
const config=JSON.parse((await readFile("wrangler.jsonc","utf8")).replace(/^\/\/ RNCWEB\r?\n/,""));
config.d1_databases=[{binding:"DB",database_name:name,database_id:db.uuid,migrations_dir:"migrations"}];
await writeFile("wrangler.deploy.json",JSON.stringify(config,null,2)+"\n");
console.log("Banco dedicado do Guinho localizado ou criado.");
