# RNCWEB — Migração Cloudflare

Esta branch mantém o front-end demonstrativo intacto e prepara apenas sua hospedagem em Workers Static Assets. Não cria banco D1, API nem autenticação; o painel continua sendo uma demonstração local.

## Publicação pelo painel

Em Workers & Pages, crie um Worker importando o repositório guinhocelulares. Selecione a branch cloudflare-migracao como branch de produção do novo Worker. Use a raiz do repositório, comando de build `node scripts/prepare-cloudflare.mjs` e comando de deploy `npx wrangler deploy`. Autorize o acesso do Cloudflare ao repositório. O nome do Worker deve coincidir com wrangler.jsonc; se já existir um Worker com esse nome, use um nome livre no painel e no arquivo.

O build copia somente arquivos públicos para dist. Não publica código de infraestrutura, relatórios ou testes. Não há domínio próprio obrigatório. A publicação original na Vercel permanece na branch main.

## CLI alternativa

```sh
node scripts/prepare-cloudflare.mjs
npx wrangler login
npx wrangler deploy
```

Depois de publicar, valide /, /catalogo.html, /carrinho.html, /admin/, CSS, carregamento do JSON e um endereço inexistente. A próxima fase é adicionar um binding D1 e uma API com autorização real.
