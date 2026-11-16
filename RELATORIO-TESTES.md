# Relatório de testes — Guinho Celulares

Executado em **16/11/2026**, em servidor HTTP local, com **Chromium 154.0.8037.57**, Playwright, axe-core e **Node 24.19.0**. Os arquivos do site foram servidos com a política de conteúdo declarada para a publicação estática.

## Lógica: 8 testes aprovados

Comando reproduzível, sem instalar bibliotecas:

```sh
node --test testes/logica.test.mjs
```

| Verificação | Resultado |
| --- | --- |
| Conversão monetária para centavos, formatos aceitos e valores inválidos | Aprovado |
| Pedido de referência: 1×11000 + 2×6500 + 3×2500 = 31500 centavos | Aprovado |
| Quantidades inteiras, limites e rejeição de frações, negativos e valores não finitos | Aprovado |
| Mensagem dinâmica, codificação da URL e bloqueio sem WhatsApp ou com item inválido | Aprovado |
| CSV com BOM, acentos, separadores, aspas escapadas e campo com quebra de linha | Aprovado |
| CSV inválido, campos incompletos, preço fracionário em centavos e SKU duplicado | Aprovado |
| Validação de produtos, identificadores, categorias e URLs inseguras | Aprovado |
| Falha de gravação: alteração mantida em memória, sem reler conteúdo antigo | Aprovado |

## Fluxos reais no navegador

- Navegação principal, apresentação com três destaques e acesso às páginas.
- Pesquisa com sugestões, seta do teclado, Enter e abertura do detalhe correto por SKU.
- Filtros de categoria, marca e modelo combinados; busca sem resultados; limpeza de filtros; ordenação por preço.
- Produtos indisponíveis com adição desativada; favoritos mantidos após recarregar.
- Adição de três produtos em quantidades 1, 2 e 3; contador de seis unidades e total de **R$ 315,00**.
- Carrinho lateral e página completa; aumento para **R$ 425,00**, retorno a **R$ 315,00**, rejeição de quantidade fracionária e preservação do foco nos controles.
- Persistência do pedido após recarregar; remoção até o estado vazio e persistência da lista vazia.
- Revisão da mensagem, cópia efetiva para a área de transferência e conferência do texto copiado.
- Configuração local do WhatsApp e da URL pública, com canonical atualizado.
- Abertura do WhatsApp **interceptada pelo teste antes de acessar o serviço**. URL e texto conferidos; nenhum envio realizado. O carrinho permaneceu com os três itens.
- Botões de canais ainda não configurados com explicação contextual, sem contato fictício ativo.
- Entrada demonstrativa, campo de senha desativado e conservação da preferência de painel aberto.
- Cadastro local de produto, edição do preço e atualização do estoque demonstrativo.
- Criação, edição e exclusão de categoria; importação e exclusão de produto.
- Importação por texto e por arquivo CSV, prévia, rejeição de erro e atualização de SKU existente.
- Texto contendo uma tentativa de inserção de HTML exibido literalmente, sem criação de imagem ou execução de evento.
- Exportação real do JSON local e restauração do catálogo, mantendo o carrinho.
- Bloqueio simulado do LocalStorage no navegador, aviso visível e carrinho operando em memória.

Não houve erro JavaScript não tratado nos fluxos aprovados. As requisições normais da aplicação permaneceram na mesma origem, sem CDN, fontes ou serviços externos. O número utilizado nos testes ficou somente no contexto isolado do navegador; a configuração publicada não recebeu telefone fictício.

## Responsividade: 61 enquadramentos aprovados

Larguras: **320, 375, 390, 430, 768, 1024, 1440 e 1920 px**.

| Área | Verificações |
| --- | ---: |
| Homepage | 8 |
| Catálogo | 8 |
| Diálogo de produto | 8 |
| Filtros móveis | 5 |
| Carrinho com revisão | 8 |
| Dashboard | 8 |
| Tabela administrativa | 8 |
| Formulário administrativo | 8 |

Nenhum documento ultrapassou a largura testada. Os diálogos permaneceram dentro da tela. Categorias e tabelas usam rolagem interna quando necessária, preservando conteúdo e ações. O menu móvel, sua abertura e o fechamento por Escape também foram executados.

## Acessibilidade

axe-core foi executado com os conjuntos WCAG 2 A, AA e WCAG 2.1 A, AA. **Zero violações detectadas** nas seis análises:

1. Homepage desktop.
2. Carrinho com revisão da mensagem.
3. Formulário de cadastro de produto.
4. Catálogo em 375 px.
5. Dashboard em 375 px.
6. Homepage em 1024 px.

A busca foi usada pelo teclado; diálogos foram abertos e fechados por Escape; formulários e controles de quantidade foram operados efetivamente. Esse resultado se refere aos fluxos e estados avaliados, sem declarar certificação integral de acessibilidade.

## Animações e recursos

- `prefers-reduced-motion` conferido: animação principal desativada.
- Movimento normal conferido por alteração da matriz de transformação da estrutura CSS.
- Interpolação do ponteiro conferida pelas propriedades aplicadas ao elemento.
- Pausa fora de vista conferida após rolar até o rodapé.
- Nenhuma biblioteca 3D, imagem de produto, fotografia, vídeo ou fonte remota utilizada.
- A validação de funcionamento também ocorreu com a política CSP do projeto aplicada.

## Limites da verificação e da entrega

Os testes de navegador foram executados no Chromium, com larguras emuladas. Firefox, Safari, aparelhos físicos e uma avaliação manual completa com leitores de tela não foram executados. Não foi atribuída pontuação Lighthouse.

A publicação em uma conta Cloudflare não foi executada; as instruções estão no README. O domínio definitivo, o WhatsApp comercial, o Instagram e os demais dados comerciais ainda precisam ser informados pelo proprietário.

O painel é deliberadamente local e não possui autenticação. Não há teste de servidor, banco de dados, reserva, pagamento ou envio automático porque essas funcionalidades não fazem parte do projeto.
