# GUIA DE IMPLEMENTACAO
## Cafe Leal

## 1. Requisitos

Para executar o projeto localmente, considere:
- Node.js instalado
- PostgreSQL acessivel
- arquivo `backend/.env` configurado

## 2. Estrutura do projeto

```text
/
|-- index.html
|-- app.js
|-- styles.css
|-- logo.png
|-- documentacao/
`-- backend/
    |-- server.js
    |-- db.js
    |-- schema.sql
    |-- seed.js
    |-- migrar.js
    |-- reset-db.js
    |-- package.json
    |-- middleware/
    `-- routes/
```

## 3. Variaveis de ambiente

O backend depende de `backend/.env`.

Campos esperados:
- `DATABASE_URL`: string de conexao com o PostgreSQL
- `PORT`: porta opcional do servidor
- chave JWT, se o ambiente atual do projeto a utilizar nesse arquivo

Observacao:
O arquivo existe no projeto, mas valores sensiveis nao devem entrar na documentacao nem no versionamento publico.

## 4. Instalacao

Entre na pasta `backend` e instale as dependencias:

```powershell
npm install
```

Dependencias principais:
- `express`
- `pg`
- `jsonwebtoken`
- `bcrypt`
- `dotenv`

## 5. Banco de dados

O schema base fica em `backend/schema.sql`.

Tabelas principais:
- `users`
- `categorias`
- `produtos`
- `comandas`
- `comanda_itens`
- `historico`
- `historico_itens`
- `fornecedores`
- `compras`
- `saidas`
- `configuracoes`

### Inicializacao sugerida

1. Criar o banco no PostgreSQL.
2. Aplicar `backend/schema.sql`.
3. Executar o seed, se necessario.

Exemplo de script disponivel:

```powershell
npm run seed
```

Tambem existem utilitarios locais:
- `migrar.js`
- `reset-db.js`

Use esses scripts com cautela em ambientes com dados reais.

## 6. Execucao

### Desenvolvimento

```powershell
npm run dev
```

### Producao local

```powershell
npm start
```

O servidor Express:
- expoe a API em `/api`
- serve os arquivos estaticos do frontend a partir da raiz do projeto
- devolve `index.html` para rotas nao-API

## 7. Fluxo de inicializacao do sistema

1. O usuario acessa a aplicacao no navegador.
2. O frontend carregado e `index.html`.
3. `app.js` tenta restaurar a sessao com o token salvo.
4. Com sessao valida, o frontend busca os dados principais da API.
5. As paginas sao renderizadas conforme o perfil e o estado atual.

## 8. Como adicionar ou alterar um modulo

### Backend

Passos recomendados:
1. criar ou atualizar a tabela no banco
2. ajustar `schema.sql`
3. criar rota em `backend/routes/`
4. proteger a rota com o middleware `auth` se necessario
5. registrar a rota em `backend/server.js`

### Frontend

Passos recomendados:
1. criar a estrutura HTML da tela ou secao
2. adicionar funcoes em `app.js`
3. conectar a nova tela com `showPage()`, se for uma nova aba
4. atualizar renderizacoes e estados em memoria
5. validar acesso por perfil em `updateAccessControls()`

## 9. Padrao das rotas atuais

O projeto segue um padrao simples:
- `GET` para listagem e leitura
- `POST` para criacao
- `PUT` para edicao
- `DELETE` para remocao

Rotas com acao especifica:
- `POST /api/comandas/:id/fechar`
- `POST /api/comandas/:id/cancelar`
- `POST /api/auth/verificar-senha`

## 10. Cuidados importantes

- o frontend depende do backend; a documentacao antiga baseada apenas em `localStorage` nao vale mais para a aplicacao atual
- `app.js` concentra bastante regra de interface e calculo; alteracoes precisam ser testadas com cuidado
- `compras.foto` armazena base64, o que aumenta payload e tamanho no banco
- o backend converte `NUMERIC` do PostgreSQL para `float` em `backend/db.js`
- perfis de acesso impactam tanto a navegacao quanto as operacoes disponiveis

## 11. Checklist de manutencao

- confirmar se a mudanca afeta frontend, backend ou ambos
- revisar se ha reflexo em permissao de gerente e atendente
- validar se as consultas e payloads continuam compativeis com o schema
- revisar o impacto em relatorios e financeiro quando houver mudanca em comandas
- manter esta documentacao alinhada sempre que houver novo modulo ou fluxo

## 12. Arquivos que merecem leitura primeiro

- `backend/server.js`
- `backend/schema.sql`
- `backend/routes/auth.js`
- `backend/routes/comandas.js`
- `app.js`

Esses arquivos explicam quase todo o fluxo principal do sistema.
