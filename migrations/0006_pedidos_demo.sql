-- RNCWEB: exemplos sem pessoas reais, sem pagamentos.
INSERT INTO pedidos(id,cliente,criado) SELECT 'demo-0001','Assistência Exemplo 01',datetime('now','-5 days') WHERE EXISTS(SELECT 1 FROM produtos WHERE id='tela-iphone11' AND ativo=1 AND estoque>=2);
INSERT INTO pedido_itens(pedido_id,produto_id,nome,sku,quantidade,preco,custo)
 SELECT 'demo-0001',id,nome,sku,2,precoCentavos,round(precoCentavos*0.6) FROM produtos WHERE id='tela-iphone11' AND EXISTS(SELECT 1 FROM pedidos WHERE id='demo-0001');
UPDATE pedidos SET status='concluido' WHERE id='demo-0001';
INSERT INTO pedidos(id,cliente,criado) SELECT 'demo-0002','Assistência Exemplo 02',datetime('now','-2 days') WHERE EXISTS(SELECT 1 FROM produtos WHERE id='tela-iphone11' AND ativo=1 AND estoque>=1);
INSERT INTO pedido_itens(pedido_id,produto_id,nome,sku,quantidade,preco,custo)
 SELECT 'demo-0002',id,nome,sku,1,precoCentavos,round(precoCentavos*0.6) FROM produtos WHERE id='tela-iphone11' AND EXISTS(SELECT 1 FROM pedidos WHERE id='demo-0002');
INSERT INTO pedidos(id,cliente,criado) SELECT 'demo-0003','Assistência Exemplo 03',datetime('now','-1 days') WHERE EXISTS(SELECT 1 FROM produtos WHERE id='tela-iphone11' AND ativo=1 AND estoque>=1);
INSERT INTO pedido_itens(pedido_id,produto_id,nome,sku,quantidade,preco,custo)
 SELECT 'demo-0003',id,nome,sku,1,precoCentavos,round(precoCentavos*0.6) FROM produtos WHERE id='tela-iphone11' AND EXISTS(SELECT 1 FROM pedidos WHERE id='demo-0003');
UPDATE pedidos SET status='cancelado' WHERE id='demo-0003';
