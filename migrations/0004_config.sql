-- RNCWEB
CREATE TABLE config_loja (id INTEGER PRIMARY KEY CHECK(id=1), dados TEXT NOT NULL CHECK(json_valid(dados)));
