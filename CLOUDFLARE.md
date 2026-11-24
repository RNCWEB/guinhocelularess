# RNCWEB — Fase 1: catálogo demonstrativo no D1
A branch cloudflare-migracao mantém a loja original sem alterações visuais. O nome dedicado do Worker e do D1 é rncweb-guinho-1470450074. Os 27 produtos e nove categorias são exemplos, não estoque real.

## Implantação
O workflow precisa de permissão de Workflows. Os secrets CLOUDFLARE_API_TOKEN e CLOUDFLARE_ACCOUNT_ID devem estar cadastrados. Executar somente na branch cloudflare-migracao, sem pull requests externos.

Com Node 24, execute os testes (node --test testes/logica.test.mjs testes/backend.test.mjs), prepare os assets (node scripts/prepare-cloudflare.mjs), gere o binding D1 (node scripts/provision-cloudflare.mjs), aplique as migrações (npx --yes wrangler@4.166.0 d1 migrations apply DB --remote --config wrangler.deploy.json) e publique (npx --yes wrangler@4.166.0 deploy --config wrangler.deploy.json).

Rotas GET: /api/saude, /api/catalogo, /api/categorias, /api/produtos e /api/produtos/:id. A API não aceita escrita pública. O front público lê o D1 na compilação Cloudflare; a versão estática mantém o JSON original. O painel continua local e demonstrativo; não é uma área autenticada. Não inserir informações reais antes de implementar autenticação e CRUD. Pedidos e controle transacional de estoque ainda não estão implementados.

## Painel compartilhado — fase 2
Configure no Worker a variável do tipo Secret `GUINHO_ADMIN_KEY`, com chave aleatória de pelo menos 32 caracteres. Não publique a chave no código. Sem ela, o login falha fechado. Sessões D1 duram oito horas; cookie HttpOnly Secure SameSite Strict, limite por IP, checagem de origem e consultas parametrizadas. Produtos, preço, estoque demonstrativo e histórico passam pela API. Categorias, importação, configurações compartilhadas e pedidos ainda pendentes; as três seções administrativas não integradas estão desativadas na versão Cloudflare. Não trate como produção antes dos testes completos.

Fase 3: categorias, configurações e importação CSV (até 50 produtos por operação) conectadas ao D1. A configuração comercial fica pública por desenho; não inserir dados pessoais, credenciais ou contatos fictícios de terceiros. Pedidos ainda pendentes.
