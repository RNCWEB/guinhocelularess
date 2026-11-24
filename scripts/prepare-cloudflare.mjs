// RNCWEB
import { cp, mkdir, rm } from "node:fs/promises";
const raiz = new URL("../", import.meta.url);
const destino = new URL("dist/", raiz);
await rm(destino, { recursive: true, force: true });
await mkdir(destino, { recursive: true });
for (const caminho of ["index.html", "catalogo.html", "carrinho.html", "404.html", "robots.txt", "_headers", "admin", "ativos", "css", "dados", "js"]) {
  await cp(new URL(caminho, raiz), new URL(caminho, destino), { recursive: true });
}
console.log("RNCWEB: arquivos públicos preparados em dist.");
