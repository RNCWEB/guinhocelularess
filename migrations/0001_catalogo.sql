-- RNCWEB
CREATE TABLE categorias (
  id TEXT PRIMARY KEY NOT NULL,
  nome TEXT NOT NULL,
  icone TEXT NOT NULL
);
CREATE TABLE produtos (
  id TEXT PRIMARY KEY NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  categoria TEXT NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  precoCentavos INTEGER NOT NULL CHECK(typeof(precoCentavos)='integer' AND precoCentavos BETWEEN 1 AND 100000000),
  estoque INTEGER NOT NULL CHECK(typeof(estoque)='integer' AND estoque BETWEEN 0 AND 9999),
  ativo INTEGER NOT NULL CHECK(ativo IN (0,1)),
  destaque INTEGER NOT NULL CHECK(destaque IN (0,1)),
  novidade INTEGER NOT NULL CHECK(novidade IN (0,1)),
  oferta INTEGER NOT NULL CHECK(oferta IN (0,1)),
  selo TEXT NOT NULL DEFAULT '',
  descricao TEXT NOT NULL DEFAULT '',
  especificacoes TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(especificacoes))
);
CREATE INDEX produtos_categoria ON produtos(categoria, ativo);
