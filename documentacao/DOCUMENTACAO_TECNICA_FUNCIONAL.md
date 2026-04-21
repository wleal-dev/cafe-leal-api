# DOCUMENTACAO TECNICA FUNCIONAL
## Cafe Leal

## 1. Visao geral tecnica

O sistema e uma aplicacao web de pagina unica servida por um backend Express.

### Stack atual
- frontend: HTML, CSS e JavaScript vanilla
- backend: Node.js + Express
- autenticacao: JWT
- banco de dados: PostgreSQL

### Arquivos centrais
- `index.html`: estrutura das telas e modais
- `styles.css`: estilo do frontend
- `app.js`: estado da aplicacao, renderizacao e chamadas para API
- `backend/server.js`: bootstrap do servidor e registro das rotas
- `backend/schema.sql`: estrutura principal do banco

## 2. Arquitetura funcional

### Frontend
O frontend concentra:
- login e manutencao de sessao
- navegacao por abas
- renderizacao dinamica de comandas, relatorios, compras e financeiro
- interacao com a API via `fetch`

### Backend
O backend concentra:
- autenticacao
- autorizacao por token
- persistencia dos dados
- regras de acesso por perfil
- importacao e exportacao de backup

### Banco de dados
O banco centraliza os dados operacionais e administrativos. Isso elimina a dependencia de armazenamento local no navegador e permite consistencia entre sessoes.

## 3. Autenticacao e autorizacao

### Fluxo de login
1. O frontend envia usuario e senha para `POST /api/auth/login`.
2. O backend valida as credenciais na tabela `users`.
3. O backend retorna token JWT e dados do usuario.
4. O token e salvo em `localStorage` na chave `cl_token`.
5. Chamadas futuras para a API incluem o header `Authorization: Bearer <token>`.

### Sessao
- `GET /api/auth/me` reidrata a sessao ao recarregar a pagina.
- se a API retornar `401`, o frontend executa logout.

### Perfis
- `Gerente`: acesso completo
- `Atendente`: acesso operacional restrito

### Areas restritas no frontend
As paginas `Produtos`, `Compras` e `Financeiro` sao exibidas apenas para gerente.

## 4. Modulos funcionais

### 4.1 Nova comanda

Responsabilidades:
- receber nome do cliente e mesa
- adicionar itens manualmente
- adicionar produtos pre-cadastrados
- calcular o total da comanda
- enviar a abertura para o backend

Regras principais:
- o nome do cliente deve ser informado
- a comanda deve ter ao menos um item
- o total e a soma de `qty * preco` dos itens

Endpoint relacionado:
- `POST /api/comandas`

### 4.2 Comandas abertas

Responsabilidades:
- listar comandas em aberto
- filtrar por cliente ou mesa
- editar itens
- fechar comanda
- cancelar comanda

Operacoes observadas no frontend:
- edicao de item da comanda
- modal de fechamento
- selecao de forma de pagamento
- cancelamento com confirmacao

Endpoints relacionados:
- `GET /api/comandas`
- `PUT /api/comandas/:id`
- `DELETE /api/comandas/:id`
- `POST /api/comandas/:id/fechar`
- `POST /api/comandas/:id/cancelar`

### 4.3 Desconto no fechamento

O fluxo de desconto existe no modal de fechamento.

Caracteristicas:
- suporta desconto percentual ou em valor
- exige verificacao de senha de gerente
- recalcula total final antes da confirmacao

Endpoint de apoio:
- `POST /api/auth/verificar-senha`

### 4.4 Caixa do dia

Responsabilidades:
- consolidar valor vendido
- mostrar quantidade de fechadas e abertas
- listar historico operacional

Fontes de dados:
- comandas abertas
- historico de comandas fechadas ou canceladas

Endpoint relacionado:
- `GET /api/historico`

### 4.5 Relatorios

Indicadores gerados no frontend a partir dos dados carregados:
- hora de pico
- produto estrela
- tempo medio de permanencia
- ranking de vendas
- ultimas comandas fechadas

Dependencias:
- historico
- itens do historico

### 4.6 Produtos e categorias

Responsabilidades:
- cadastrar categorias
- cadastrar produtos
- editar e excluir produtos
- disponibilizar os produtos no fluxo de abertura de comanda

Endpoints:
- `GET /api/categorias`
- `POST /api/categorias`
- `PUT /api/categorias/:id`
- `DELETE /api/categorias/:id`
- `GET /api/produtos`
- `POST /api/produtos`
- `PUT /api/produtos/:id`
- `DELETE /api/produtos/:id`

### 4.7 Compras e fornecedores

Responsabilidades:
- registrar compras
- cadastrar e manter fornecedores
- armazenar dados fiscais e observacoes
- manter comprovante em foto base64

Campos relevantes de compra:
- data
- fornecedor
- cnpj
- nf
- valor
- pagamento
- status
- categoria
- itens
- observacoes
- foto

Endpoints:
- `GET /api/compras`
- `POST /api/compras`
- `PUT /api/compras/:id`
- `DELETE /api/compras/:id`
- `GET /api/fornecedores`
- `POST /api/fornecedores`
- `PUT /api/fornecedores/:id`
- `DELETE /api/fornecedores/:id`

### 4.8 Financeiro e saidas

Responsabilidades:
- consolidar entradas do historico
- exibir compras e saidas
- registrar saidas avulsas
- usar configuracoes como budget semanal

Endpoints:
- `GET /api/saidas`
- `POST /api/saidas`
- `DELETE /api/saidas/:id`
- `GET /api/configuracoes`
- `PUT /api/configuracoes`

### 4.9 Backup

Responsabilidades:
- exportar dados do sistema
- importar snapshot de restauracao

Endpoint observado:
- `POST /api/backup/importar`

O frontend tambem possui fluxo de exportacao de backup.

## 5. Modelo de dados principal

### `users`
- usuarios do sistema
- senha armazenada com hash bcrypt
- controle de role e status ativo

### `categorias`
- agrupamento dos produtos

### `produtos`
- catalogo usado na operacao da comanda
- ligado a categoria

### `comandas`
- cabecalho das comandas em aberto

### `comanda_itens`
- itens vinculados a uma comanda aberta

### `historico`
- snapshot das comandas finalizadas ou canceladas
- armazena forma de pagamento, desconto e total final

### `historico_itens`
- itens relacionados ao historico

### `fornecedores`
- cadastro de parceiros e mercados

### `compras`
- entradas de custos e abastecimento

### `saidas`
- retiradas ou despesas avulsas

### `configuracoes`
- configuracoes chave-valor, como `budget_semanal` e `mesas`

## 6. Regras de negocio observadas

- paginas gerenciais nao ficam disponiveis para atendente
- qualquer chamada sem token valido gera logout no frontend
- preco e valor monetario sao tratados como numericos no backend
- fotos de compras sao aceitas porque o body parser suporta ate 10 MB
- comandas abertas e historico ficam em tabelas separadas
- fechamento e cancelamento removem a comanda da area de abertas e registram o snapshot no historico
- desconto depende de validacao de senha de gerente

## 7. Rotas da API

### Publicas
- `POST /api/auth/login`

### Protegidas
- `GET /api/auth/me`
- `POST /api/auth/verificar-senha`
- `GET/POST/PUT/DELETE /api/categorias`
- `GET/POST/PUT/DELETE /api/produtos`
- `GET/POST/PUT/DELETE /api/comandas`
- `POST /api/comandas/:id/fechar`
- `POST /api/comandas/:id/cancelar`
- `GET/DELETE /api/historico`
- `GET/POST/PUT/DELETE /api/compras`
- `GET/POST/PUT/DELETE /api/fornecedores`
- `GET/POST/DELETE /api/saidas`
- `GET/PUT /api/configuracoes`
- rotas de backup em `/api/backup`

## 8. Persistencia e estado no frontend

Estado em memoria no `app.js`:
- `currentUser`
- `itensComanda`
- `comandas`
- `historico`
- `produtos`
- `categorias`
- `compras`
- `fornecedores`
- `saidas`
- `budgetSemanal`
- `config`

Persistencia no navegador:
- `cl_token` em `localStorage` para autenticacao

Observacao:
A persistencia principal de negocio nao fica mais no navegador. Ela esta no PostgreSQL.

## 9. Bootstrap da aplicacao

1. O servidor Express sobe e publica os arquivos estaticos do frontend.
2. O frontend verifica se ja existe token salvo.
3. Se existir, chama `GET /api/auth/me`.
4. Em seguida executa `carregarDados()` com chamadas paralelas para os modulos principais.
5. A interface e inicializada e atualizada conforme a pagina ativa.

## 10. Pontos de manutencao

- qualquer mudanca em regra de acesso deve ser refletida no frontend e no backend
- mudancas no schema exigem atualizar `backend/schema.sql` e, se necessario, scripts de migracao
- novos modulos devem seguir o padrao de rota protegida por JWT
- alteracoes em compras devem considerar o limite de payload por conta da foto em base64
