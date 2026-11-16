# Guinho Celulares

Loja comercial estática, com identidade preta e vermelha, composição espacial e estrutura tridimensional construída em CSS. HTML, CSS e JavaScript nativos, sem frameworks, fotos, vídeos, fontes remotas ou bibliotecas gráficas.

Criado por **renancodando**.

## Abrir e editar

Abra esta pasta pelo comando **Arquivo → Abrir → Pasta** do Visual Studio. Não há instalação, compilação, solução ou arquivo `.esproj` necessário.

Para visualizar localmente, execute na raiz:

```sh
python3 -m http.server 8080
```

No Windows, também é possível usar `py -m http.server 8080`.

- Início: `http://localhost:8080/`
- Catálogo: `http://localhost:8080/catalogo.html`
- Carrinho: `http://localhost:8080/carrinho.html`
- Painel demonstrativo: `http://localhost:8080/admin/`

Use HTTP ou HTTPS. Abrir o HTML diretamente por `file://` impede o carregamento normal dos módulos e do JSON em alguns navegadores.

## O que funciona

- Homepage com placas metálicas em CSS 3D, resposta ao cursor, iluminação, camadas, animações e apresentação com três destaques selecionáveis.
- Navegação por categorias, marcas e modelos; pesquisa com sugestões e operação por teclado.
- Catálogo com 27 produtos demonstrativos e nove categorias. Busca por nome, SKU, marca e compatibilidade; filtros combinados, ordenação, paginação, favoritos e detalhes em diálogo.
- Carrinho com adição, remoção, quantidades, subtotais e total em centavos inteiros. A lista persiste no navegador, inclusive depois de abrir o WhatsApp.
- Revisão e cópia da mensagem do pedido. A abertura do WhatsApp usa os itens efetivamente selecionados e `encodeURIComponent()`. O cliente confirma o envio no aplicativo.
- Painel local com dashboard calculado a partir do catálogo, cadastro e edição de produtos, preços, estoque demonstrativo, categorias, configurações e histórico de alterações.
- Importação CSV por arquivo ou texto, com validação, prévia e confirmação. SKUs existentes são atualizados. Arquivos com erros não são importados parcialmente.
- Exportação do catálogo local em JSON e restauração dos exemplos, preservando carrinho e configurações.
- Diálogos com teclado, Escape e retorno de foco; estados vazios e erros; tratamento de falhas de armazenamento; redução de movimento e pausa das animações fora de vista.

## Configuração comercial

O arquivo [js/configuracao.js](js/configuracao.js) centraliza nome, marca, WhatsApp, Instagram, e-mail, endereço, cidade, horário e endereço público.

O WhatsApp começa vazio, pois o número comercial não foi fornecido. Preencha `whatsapp` com o DDD e o número real, com ou sem o prefixo `55`. Não existe um número fictício ativo. Enquanto ele estiver vazio, o pedido pode ser revisado e copiado, e a confirmação pelo WhatsApp fica indisponível com uma explicação visível.

Informe o endereço completo do Instagram em `instagram`. Sem esse dado, o botão abre uma explicação contextual. `urlPublica` habilita canonical e Open Graph com a URL informada.

As configurações alteradas no painel são **sobreposições locais**, válidas apenas naquele navegador. Elas não modificam `js/configuracao.js`, não atualizam o GitHub e não são compartilhadas com visitantes. Para publicar os dados da empresa, altere o arquivo de configuração e envie uma nova versão.

## Dados demonstrativos e persistência

[dados/produtos.json](dados/produtos.json) contém o catálogo inicial. `precoCentavos` é sempre inteiro; `estoque` representa uma quantidade demonstrativa. Os selos de oferta e novidade são exemplos identificados na interface. Não há avaliações, depoimentos, promoções reais ou condições comerciais inventadas.

Carrinho, favoritos, alterações no catálogo, categorias, configurações e histórico usam chaves `guinho.v1.*` no LocalStorage. Limpar os dados do navegador apaga essas informações. Nenhuma senha é salva. Quando a gravação é bloqueada ou fica sem espaço, a aplicação avisa e mantém as alterações em memória durante aquela página, sem afirmar que foram persistidas.

Produtos retirados do catálogo não são apagados automaticamente do carrinho. A lista indica a indisponibilidade e exige revisão antes de preparar a confirmação. Preços alterados localmente são recalculados com o catálogo atual.

## Painel: demonstração, sem autenticação

A tela de entrada é somente visual. O nome de exibição abre a demonstração; o campo de senha é desativado. A indicação de painel aberto apenas conserva a preferência de interface. **Isso não protege o acesso aos dados.**

Não há back-end, banco de dados, autenticação real, estoque compartilhado, reserva, pagamento, envio de mensagem automático ou sincronização entre dispositivos. O pedido só se torna uma conversa quando o usuário abre o WhatsApp e confirma o envio.

## Importação CSV

Cabeçalho obrigatório, separado por vírgula ou ponto e vírgula:

```csv
nome;sku;marca;modelo;categoria;preco_centavos;estoque
Peça demonstrativa;DEMO-01;Universal;Aplicação técnica;telas;11000;12
```

`11000` representa R$ 110,00. Use inteiros para preço e estoque. A categoria deve existir e pode ser identificada pelo nome ou código. A coluna opcional `descricao` é aceita. Aspas escapadas, campos entre aspas, quebras de linha e BOM UTF-8 são tratados. Limites: 1 MB e 2.000 produtos por arquivo. O painel fornece um modelo para download.

## Organização

| Local | Responsabilidade |
| --- | --- |
| `index.html`, `catalogo.html`, `carrinho.html` | Páginas públicas da loja |
| `admin/index.html` | Entrada e estrutura do painel demonstrativo |
| `css/` | Base, componentes, loja, páginas, painel e adaptação responsiva |
| `js/configuracao.js` | Configuração comercial publicada |
| `js/dados/` | Persistência, validação, catálogo e importação CSV |
| `js/ui/` | DOM seguro, SVGs próprios, diálogos, avisos e animações |
| `js/loja/` | Catálogo, pesquisa, produtos, carrinho, mensagem e página inicial |
| `js/admin/` | Telas e ações do painel local |
| `dados/produtos.json` | Exemplos de produtos e categorias |
| `testes/logica.test.mjs` | Testes essenciais com o executor nativo do Node |

As telas usam a fronteira de dados em `js/dados/repositorio.js`. Uma futura API pode substituir essa camada sem reconstruir os componentes visuais. Textos de produtos, CSV e configurações são renderizados como texto, sem interpretação como HTML. Ícones vêm de caminhos SVG internos, e URLs comerciais passam por validação.

## Publicar no Cloudflare Pages

O site funciona em hospedagem estática e não utiliza Functions, D1, R2 ou serviços pagos. Nenhuma hospedagem ou serviço foi contratado pelo projeto.

1. Em **Workers & Pages**, escolha **Create application → Pages → Import an existing Git repository**.
2. Conecte este repositório e selecione a branch `main`.
3. Escolha **None** como framework, `exit 0` como comando de build e `.` como diretório de saída. O `index.html` está na raiz; não há compilação.
4. Mantenha o diretório raiz do projeto no padrão e inicie a publicação pelo plano gratuito.
5. Após obter o endereço, informe a URL em `js/configuracao.js` e publique a alteração.

Também é possível usar **Direct Upload**, enviando os HTML e as pastas `css`, `js`, `dados`, `ativos` e `admin`, além de `_headers`, `robots.txt` e `404.html`. Não envie `.git`, arquivos de trabalho, relatórios ou a pasta de testes.

O arquivo `_headers` declara os cabeçalhos para o Pages. A página `404.html` preserva uma saída clara para endereços inexistentes. Referência de configuração: [documentação oficial para HTML estático](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/).

As páginas começam com `noindex,nofollow` e `robots.txt` bloqueado porque o catálogo ainda é demonstrativo. Para uma loja real indexável, substitua os exemplos por informações verificadas, configure os contatos e a URL pública e revise essas diretivas de indexação.

## Verificações

Com Node 22 ou mais recente, opcionalmente execute:

```sh
node --test testes/logica.test.mjs
```

Node é usado somente pelos testes, não pela loja. Os testes no navegador, tamanhos avaliados e limites de verificação estão registrados em [RELATORIO-TESTES.md](RELATORIO-TESTES.md).
