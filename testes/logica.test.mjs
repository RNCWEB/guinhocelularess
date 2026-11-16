import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {precoEmCentavos,quantidadeValida,numeroWhatsapp} from '../js/ui/dom.js';
import {calcularTotais,criarMensagem,linkPedido} from '../js/loja/carrinho.js';
import {lerCSV,prepararImportacao} from '../js/dados/csv.js';
import {validarProduto,validarConfiguracao,identificador} from '../js/dados/validacao.js';
import {ler,salvar,remover} from '../js/dados/armazenamento.js';

const catalogo=JSON.parse(await readFile(new URL('../dados/produtos.json',import.meta.url),'utf8'));
const linhas=[{...catalogo.produtos[0],quantidade:1,valido:true},{...catalogo.produtos[1],quantidade:2,valido:true},{...catalogo.produtos[2],quantidade:3,valido:true}];

test('Os preços são convertidos diretamente para centavos inteiros',()=>{
  assert.equal(precoEmCentavos('1.234,56'),123456);
  assert.equal(precoEmCentavos('110,00'),11000);
  assert.equal(precoEmCentavos('0.29'),29);
  for(const entrada of ['-1','12,345','1e3','abc','0','1000000,01'])assert.throws(()=>precoEmCentavos(entrada));
});

test('O pedido de referência soma exatamente R$ 315,00 e seis unidades',()=>{
  assert.deepEqual(calcularTotais(linhas),{quantidade:6,total:31500});
  assert.equal(calcularTotais([{quantidade:3,precoCentavos:10},{quantidade:1,precoCentavos:20}]).total,50);
});

test('Quantidades fracionárias, negativas e acima do limite são rejeitadas',()=>{
  for(const entrada of [0,-1,1.5,'',NaN,Infinity,1000])assert.throws(()=>quantidadeValida(entrada));
  assert.equal(quantidadeValida('3',3),3);
  assert.throws(()=>quantidadeValida(4,3));
});

test('O WhatsApp usa apenas os itens escolhidos e a mensagem codificada',()=>{
  const config={nome:'Guinho & Peças',whatsapp:'(15) 99999-8888'};
  const mensagem=criarMensagem(linhas,config),url=linkPedido(linhas,config);
  assert.equal(new URL(url).hostname,'wa.me');
  assert.equal(new URL(url).pathname,'/5515999998888');
  assert.equal(new URL(url).searchParams.get('text'),mensagem);
  assert.match(mensagem,/Total estimado: R\$\s315,00/);
  assert.match(mensagem,/2x Bateria/);
  assert.ok(!mensagem.includes(catalogo.produtos[3].sku));
  assert.equal(linkPedido(linhas,{...config,whatsapp:''}),'');
  assert.equal(linkPedido([{...linhas[0],valido:false}],config),'');
  assert.equal(numeroWhatsapp('javascript:alert(1)'), '');
});

test('CSV aceita BOM, acentos, aspas escapadas e quebras dentro de campos',()=>{
  const csv='\ufeffnome;sku;marca;modelo;categoria;preco_centavos;estoque\n"Tela; edição ""A""\nsegunda linha";NOVA-01;Universal;Técnico;telas;11000;2\n';
  assert.equal(lerCSV(csv)[0].nome,'Tela; edição "A"\nsegunda linha');
  const previa=prepararImportacao(csv,catalogo);
  assert.equal(previa.erros.length,0);
  assert.equal(previa.produtos[0].produto.precoCentavos,11000);
  assert.ok(previa.produtos[0].produto.nome.includes('edição'));
});

test('Importação bloqueia preços inválidos, campos incorretos e SKUs duplicados',()=>{
  const cabecalho='nome,sku,marca,modelo,categoria,preco_centavos,estoque\n';
  assert.equal(prepararImportacao(cabecalho+'Teste,SKU-TESTE,Universal,Modelo,telas,12.5,2',catalogo).erros.length,1);
  assert.equal(prepararImportacao(cabecalho+'Teste,SKU-TESTE,Universal,Modelo,telas,1200,2\nOutro,SKU-TESTE,Universal,Modelo,telas,1200,2',catalogo).erros.length,1);
  assert.throws(()=>lerCSV(cabecalho+'"Campo sem fim,SKU'));
  assert.throws(()=>lerCSV(cabecalho+'Poucos,campos'));
});

test('Dados de entrada são validados e canais inseguros são rejeitados',()=>{
  const produto=catalogo.produtos[0];
  for(const item of catalogo.produtos)assert.equal(item.id,identificador(item.id));
  assert.throws(()=>validarProduto({...produto,precoCentavos:10.5},catalogo.categorias));
  assert.throws(()=>validarProduto({...produto,estoque:-1},catalogo.categorias));
  assert.throws(()=>validarProduto({...produto,categoria:'inexistente'},catalogo.categorias));
  assert.throws(()=>validarConfiguracao({nome:'Guinho',instagram:'javascript:alert(1)'}));
  assert.throws(()=>validarConfiguracao({nome:'Guinho',whatsapp:'abc'}));
  assert.equal(validarProduto({...produto,nome:'<img src=x onerror=alert(1)>'},catalogo.categorias).nome,'<img src=x onerror=alert(1)>');
});

test('Falhas de gravação preservam as alterações em memória, sem reler valores antigos',()=>{
  globalThis.localStorage={getItem:()=>JSON.stringify({versao:'anterior'}),setItem:()=>{throw Error('QuotaExceededError');},removeItem:()=>{throw Error('SecurityError');}};
  assert.equal(salvar('teste-quota',{versao:'nova'}),false);
  assert.deepEqual(ler('teste-quota',{}),{versao:'nova'});
  remover('teste-quota');
  assert.deepEqual(ler('teste-quota',{padrao:true}),{padrao:true});
  delete globalThis.localStorage;
});
