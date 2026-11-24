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

// Ajusta os textos da versão conectada sem redesenhar as telas.
const textos={
"admin/index.html":[["Painel demonstrativo · acesso local","Painel demonstrativo · acesso protegido"],["Explore uma prévia do futuro painel da loja, com produtos, estoque e configurações locais.","Gerencie produtos e preços fictícios compartilhados no banco."],["Workspace local","Workspace D1"],["Sair da demonstração","Sair do painel"],["Somente neste navegador.<br>Sem autenticação real.","Dados demonstrativos no D1."],["Demonstração local","Demonstração conectada"],["Esta é uma demonstração local. Não há login seguro, banco de dados, pedidos reais ou estoque sincronizado.","Catálogo demonstrativo conectado ao D1. Pedidos, categorias e importação ainda em desenvolvimento."],["renancodando","RNCWEB"]],
"js/admin/produtos.js":[["Cadastro local demonstrativo. Nenhum produto é enviado para um servidor.","Cadastro demonstrativo compartilhado no D1."],["Cadastre, edite e organize as peças deste navegador.","Cadastre, edite e organize as peças demonstrativas."],["Ajustes locais de quantidade. Nenhuma reserva ou sincronização de estoque real é realizada.","Ajustes de estoque demonstrativo compartilhados. Sem reservas comerciais."],["Alterações locais","Alterações no banco"],["Produto salvo localmente.","Produto salvo no D1."],["Produto excluído localmente.","Produto excluído do D1."]],
"js/admin/painel.js":[["Uma visão dos dados demonstrativos armazenados neste navegador.","Uma visão dos dados demonstrativos compartilhados no D1."],["No catálogo local","No catálogo compartilhado"],["Registro deste navegador","Registro do banco"]]};
for(const [path,pares] of Object.entries(textos)){const url=new URL(path,destino);let s=await readFile(url,"utf8");for(const [a,b] of pares)s=s.replaceAll(a,b);await writeFile(url,s);}
