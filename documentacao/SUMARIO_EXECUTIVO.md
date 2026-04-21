# SUMARIO EXECUTIVO
## Cafe Leal

## Visao geral

O Cafe Leal e um sistema web para operacao de cafeteria com foco em comandas, fechamento de caixa e controle basico de compras.

Hoje o projeto nao e mais um app apenas em `localStorage`. A implementacao atual funciona com:
- frontend web estatico
- backend Node.js + Express
- banco PostgreSQL
- autenticacao com JWT

## Objetivo do sistema

O sistema foi construido para centralizar a operacao diaria do negocio em uma unica interface:
- abrir e acompanhar comandas
- fechar ou cancelar comandas
- cadastrar produtos e categorias
- registrar compras e fornecedores
- acompanhar saidas e indicadores financeiros
- exportar e importar backup dos dados

## Modulos principais

### Login e controle de acesso
- login por usuario e senha
- sessao baseada em token
- perfis `Gerente` e `Atendente`
- areas restritas para gerenciamento

### Nova comanda
- cadastro de cliente e mesa
- inclusao manual de itens
- selecao rapida de produtos por categoria
- calculo automatico do total

### Comandas abertas
- listagem de comandas ativas
- busca por cliente ou mesa
- edicao de itens
- fechamento com forma de pagamento
- cancelamento de comanda
- desconto com validacao de gerente

### Caixa do dia
- total vendido no dia
- quantidade de comandas fechadas
- quantidade de comandas em aberto
- historico operacional

### Relatorios
- hora de pico
- produto mais vendido
- tempo medio de permanencia
- movimentacao por hora
- ultimas comandas fechadas

### Produtos
- cadastro de categorias
- cadastro, edicao e exclusao de produtos
- uso dos produtos diretamente na abertura de comandas

### Compras
- registro de compras
- cadastro de fornecedores
- classificacao por categoria, pagamento e status
- suporte a observacoes e foto comprovante

### Financeiro
- visao consolidada de entradas e saidas
- registro de saidas avulsas
- acompanhamento semanal
- configuracao de budget semanal

### Backup
- exportacao de backup
- importacao de dados para restauracao do ambiente

## Perfis de acesso

### Gerente
- acesso completo ao sistema
- acessa produtos, compras e financeiro
- pode limpar historico
- pode aplicar desconto com validacao

### Atendente
- opera fluxo de login, comandas, caixa e relatorios
- nao acessa paginas gerenciais

## Arquitetura resumida

```text
Browser
  -> index.html + styles.css + app.js
  -> chamadas fetch para /api/*

Express
  -> rotas de autenticacao
  -> rotas protegidas por JWT
  -> serve frontend estatico

PostgreSQL
  -> users
  -> categorias
  -> produtos
  -> comandas + comanda_itens
  -> historico + historico_itens
  -> fornecedores
  -> compras
  -> saidas
  -> configuracoes
```

## Fluxo principal do usuario

1. Usuario faz login.
2. Sistema carrega categorias, produtos, comandas, historico, compras, fornecedores, saidas e configuracoes.
3. Operador abre nova comanda e adiciona itens.
4. Comanda fica disponivel na listagem de abertas.
5. No fechamento, a comanda vai para historico com forma de pagamento e totais finais.
6. Caixa e relatorios sao atualizados a partir do historico e dos demais registros.

## Diferenca importante em relacao a documentacao antiga

A documentacao anterior descrevia um sistema offline-first com persistencia local no navegador. O codigo atual do projeto utiliza backend, banco relacional e rotas protegidas, entao a referencia correta passa a ser esta versao atualizada.
