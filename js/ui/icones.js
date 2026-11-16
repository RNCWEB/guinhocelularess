const formas = {
  inicio: "m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10",
  busca: "M20 20l-5-5M17 10A7 7 0 1 1 3 10a7 7 0 0 1 14 0",
  sacola: "M3 7h18l-2 15H5ZM8 8V5a4 4 0 0 1 8 0v3",
  carrinho: "M1 3h3l3 13h12l3-10H5M9 21h.01M18 21h.01",
  grade: "M3 3h6v6H3Zm12 0h6v6h-6ZM3 15h6v6H3Zm12 0h6v6h-6Z",
  tela: "M7 2h10v20H7ZM10 5h4m-3 14h2",
  bateria: "M6 3h12v19H6ZM9 1h6m-2 6-4 6h5l-2 5",
  conector: "M5 8h14a4 4 0 0 1 0 8H5a4 4 0 0 1 0-8Zm0 3h14M6 13h12",
  chip: "M6 6h12v12H6ZM9 9h6v6H9ZM9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4",
  flex: "M4 21v-6h6V9h5V3h5v5h-5v8h-5v5ZM7 18h1m9-12h1",
  camera: "M3 7h5l2-3h5l2 3h4v14H3ZM17 13a5 5 0 1 1-10 0 5 5 0 0 1 10 0",
  carcaca: "M6 2h12v20H6ZM8 5h3v5H8Zm0 8h8M14 5h2",
  fone: "M3 14v-3a9 9 0 0 1 18 0v3M3 12h4v9H3ZM17 12h4v9h-4ZM17 21c0 2-2 2-4 2",
  ferramenta: "m4 21 10-10a6 6 0 0 0 7-7l-4 4-3-3 4-4a6 6 0 0 0-7 7L1 18ZM4 3l17 18",
  engrenagem: "m9 2-.6 3-2.7 1.6L3 6l-2 4 2.4 2-.1 3L1 17l2 4 3-.5L8.5 22l.5 3h6l.6-3 2.5-1.6 3 .6 2-4-2.3-2 .1-3L23 10l-2-4-3 .5L15.5 5 15 2ZM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  escudo: "m12 2 9 4v7c0 5-9 9-9 9s-9-4-9-9V6Zm-4 10 3 3 5-6",
  envio: "M1 6h13v12H1Zm13 5h5l4 5v2h-9M5 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6m14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  pessoa: "M17 6a5 5 0 1 0-10 0 5 5 0 0 0 10 0M3 23v-3a9 9 0 0 1 18 0v3",
  whatsapp: "M20 17a9 9 0 1 0-16 1L2 22l5-2a9 9 0 0 0 13-3ZM8 6c-2 5 3 10 8 10l1-3-3-1-1 1-3-3 1-1Z",
  instagram: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0m2-6h.01",
  seta: "M3 12h18m-6-6 6 6-6 6",
  baixo: "m6 9 6 6 6-6",
  fechar: "m5 5 14 14M5 19 19 5",
  mais: "M12 4v16M4 12h16",
  menos: "M4 12h16",
  check: "m5 12 5 5L20 6",
  coracao: "M12 21S2 15 2 8a5 5 0 0 1 10-2 5 5 0 0 1 10 2c0 7-10 13-10 13Z",
  filtro: "M3 6h18M3 12h18M3 18h18M8 3v6m8 0v6M9 15v6",
  raio: "m13 1-9 13h7l-1 9L21 9h-8Z",
  etiqueta: "M2 3h10l10 10-9 9L2 11Zm4 4h.01",
  estrela: "m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z",
  relogio: "M12 6v7l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  email: "M2 4h20v16H2Zm0 0 10 9L22 4",
  mapa: "M20 9c0 6-8 13-8 13S4 15 4 9a8 8 0 0 1 16 0ZM15 9a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
  copiar: "M8 8h13v14H8ZM3 16H1V1h13v3",
  lixeira: "M3 6h18M9 6V2h6v4M5 6l1 16h12l1-16M10 10v8m4-8v8",
  editar: "m3 17 12-14 6 5L8 22H2Zm11-13 6 5",
  caixa: "m12 2 10 5v11l-10 5-10-5V7Zm0 10v11M2 7l10 5 10-5M7 5l10 5",
  grafico: "M3 3v18h19M7 16l4-5 4 2 6-8",
  importar: "M12 16V2m-5 5 5-5 5 5M3 14v8h18v-8",
  configuracao: "M4 7h16M4 17h16M8 3v8m8 2v8",
  sair: "M10 3H3v18h7m4-4 5-5-5-5M8 12h13",
  menu: "M3 6h18M3 12h18M3 18h18",
  alerta: "m12 2 11 20H1Zm0 6v6m0 4h.01"
};
export function icone(nome, classe = "") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", nome === "engrenagem" ? "0 0 26 27" : "0 0 24 24");
  svg.setAttribute("class", "icone " + classe);
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.65");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(svg.namespaceURI, "path");
  path.setAttribute("d", formas[nome] || formas.caixa);
  svg.append(path);
  return svg;
}
export function preencherIcones(raiz = document) {
  raiz.querySelectorAll("[data-icone]").forEach((no) => no.replaceChildren(icone(no.dataset.icone)));
}
