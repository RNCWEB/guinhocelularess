// RNCWEB
const headers={"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","x-robots-tag":"noindex"};
const json=(body,status=200,extra={})=>new Response(JSON.stringify(body),{status,headers:{...headers,...extra}});
export function produtoPublico(row) {
  return {...row,ativo:!!row.ativo,destaque:!!row.destaque,novidade:!!row.novidade,oferta:!!row.oferta,especificacoes:JSON.parse(row.especificacoes)};
}
export default {
  async fetch(request,env) {
    const path=new URL(request.url).pathname;
    if (!path.startsWith("/api/")) return env.ASSETS.fetch(request);
    if (request.method!=="GET") return json({erro:"Método não permitido."},405,{allow:"GET"});
    try {
      if (path==="/api/saude") {
        await env.DB.prepare("SELECT COUNT(*) AS total FROM categorias").first();
        return json({status:"ok",catalogo:"demonstrativo",banco:"conectado"});
      }
      if (path==="/api/catalogo") {
        const [categorias,produtos]=await env.DB.batch([
          env.DB.prepare("SELECT id,nome,icone FROM categorias ORDER BY rowid"),
          env.DB.prepare("SELECT * FROM produtos WHERE ativo=1 ORDER BY rowid")
        ]);
        return json({versao:1,categorias:categorias.results,produtos:produtos.results.map(produtoPublico)});
      }
      if (path==="/api/categorias") {
        const result=await env.DB.prepare("SELECT id,nome,icone FROM categorias ORDER BY rowid").all();
        return json(result.results);
      }
      if (path==="/api/produtos") {
        const result=await env.DB.prepare("SELECT * FROM produtos WHERE ativo=1 ORDER BY rowid").all();
        return json(result.results.map(produtoPublico));
      }
      const match=path.match(/^\/api\/produtos\/([a-z0-9-]{1,80})$/);
      if (match) {
        const p=await env.DB.prepare("SELECT * FROM produtos WHERE id=? AND ativo=1").bind(match[1]).first();
        return p?json(produtoPublico(p)):json({erro:"Produto não encontrado."},404);
      }
      return json({erro:"Rota inexistente."},404);
    } catch {
      return json({erro:"Catálogo temporariamente indisponível."},503);
    }
  }
};
