// RNCWEB
import { cp, mkdir, rm, readFile, writeFile } from "node:fs/promises";
const raiz=new URL("../",import.meta.url), destino=new URL("dist/",raiz);
await rm(destino,{recursive:true,force:true});
await mkdir(destino,{recursive:true});
for(const caminho of ["index.html","catalogo.html","carrinho.html","404.html","robots.txt","_headers","admin","ativos","css","dados","js"]) {
  await cp(new URL(caminho,raiz),new URL(caminho,destino),{recursive:true});
}
const arquivo=new URL("js/configuracao.js",destino);
const texto=await readFile(arquivo,"utf8");
if(!texto.includes("apiCatalogo: false")) throw Error("Marcador de API ausente.");
await writeFile(arquivo,texto.replace("apiCatalogo: false","apiCatalogo: true"));
console.log("RNCWEB: arquivos públicos preparados em dist.");
