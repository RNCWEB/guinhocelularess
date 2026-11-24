-- RNCWEB
CREATE TABLE pedidos (
 id TEXT PRIMARY KEY NOT NULL,
 cliente TEXT NOT NULL CHECK(length(cliente) BETWEEN 1 AND 100),
 status TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente','concluido','cancelado')),
 criado TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 atualizado TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE pedido_itens (
 pedido_id TEXT NOT NULL REFERENCES pedidos(id) ON DELETE RESTRICT,
 produto_id TEXT NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
 nome TEXT NOT NULL,
 sku TEXT NOT NULL,
 quantidade INTEGER NOT NULL CHECK(typeof(quantidade)='integer' AND quantidade BETWEEN 1 AND 999),
 preco INTEGER NOT NULL CHECK(preco BETWEEN 1 AND 100000000),
 custo INTEGER NOT NULL CHECK(custo BETWEEN 0 AND 100000000),
 PRIMARY KEY(pedido_id,produto_id)
);
CREATE TABLE estoque_movimentos (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 produto_id TEXT NOT NULL,
 nome TEXT NOT NULL,
 anterior INTEGER NOT NULL,
 atual INTEGER NOT NULL,
 data TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX pedidos_status ON pedidos(status,criado);
CREATE INDEX movimentos_produto ON estoque_movimentos(produto_id,id);
CREATE TRIGGER registrar_estoque AFTER UPDATE OF estoque ON produtos
WHEN OLD.estoque<>NEW.estoque BEGIN
 INSERT INTO estoque_movimentos(produto_id,nome,anterior,atual) VALUES(NEW.id,NEW.nome,OLD.estoque,NEW.estoque);
END;
CREATE TRIGGER item_pedido_guard BEFORE INSERT ON pedido_itens BEGIN
 SELECT CASE WHEN (SELECT status FROM pedidos WHERE id=NEW.pedido_id)<>'pendente' THEN RAISE(ABORT,'pedido fechado') END;
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM produtos WHERE id=NEW.produto_id AND ativo=1) THEN RAISE(ABORT,'produto indisponivel') END;
END;
CREATE TRIGGER pedido_transicao BEFORE UPDATE OF status ON pedidos
WHEN OLD.status<>NEW.status BEGIN
 SELECT CASE WHEN NOT ((OLD.status='pendente' AND NEW.status IN ('concluido','cancelado')) OR (OLD.status='concluido' AND NEW.status='cancelado')) THEN RAISE(ABORT,'transicao invalida') END;
 SELECT CASE WHEN NEW.status='concluido' AND NOT EXISTS(SELECT 1 FROM pedido_itens WHERE pedido_id=OLD.id) THEN RAISE(ABORT,'pedido vazio') END;
 SELECT CASE WHEN NEW.status='concluido' AND EXISTS(
 SELECT 1 FROM pedido_itens i JOIN produtos p ON p.id=i.produto_id WHERE i.pedido_id=OLD.id AND (p.ativo=0 OR p.estoque<i.quantidade)
 ) THEN RAISE(ABORT,'estoque insuficiente') END;
END;
CREATE TRIGGER pedido_baixa AFTER UPDATE OF status ON pedidos
WHEN OLD.status='pendente' AND NEW.status='concluido' BEGIN
 UPDATE produtos SET estoque=estoque-(SELECT quantidade FROM pedido_itens WHERE pedido_id=NEW.id AND produto_id=produtos.id)
 WHERE id IN (SELECT produto_id FROM pedido_itens WHERE pedido_id=NEW.id);
END;
CREATE TRIGGER pedido_estorno AFTER UPDATE OF status ON pedidos
WHEN OLD.status='concluido' AND NEW.status='cancelado' BEGIN
 UPDATE produtos SET estoque=estoque+(SELECT quantidade FROM pedido_itens WHERE pedido_id=NEW.id AND produto_id=produtos.id)
 WHERE id IN (SELECT produto_id FROM pedido_itens WHERE pedido_id=NEW.id);
END;
-- Histórico fictício; não altera o catálogo se já tiver sido personalizado.
