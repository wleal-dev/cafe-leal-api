# INDICE DE DOCUMENTACAO
## Cafe Leal

Este diretorio concentra a documentacao funcional e tecnica do sistema atual do Cafe Leal.

## Documentos

### 1. `SUMARIO_EXECUTIVO.md`
Leitura rapida para entendimento do produto.

Contem:
- visao geral do sistema
- modulos principais
- perfis de acesso
- fluxos operacionais
- resumo da arquitetura

### 2. `DOCUMENTACAO_TECNICA_FUNCIONAL.md`
Referencia completa do comportamento do sistema.

Contem:
- arquitetura frontend + backend
- modulos funcionais
- regras de negocio
- persistencia de dados
- API disponivel
- estrutura principal do banco

### 3. `GUIA_IMPLEMENTACAO.md`
Guia pratico para executar, configurar e evoluir o projeto.

Contem:
- requisitos
- instalacao
- estrutura de pastas
- banco de dados
- scripts e inicializacao
- checklist para manutencao

## Ordem recomendada

1. Ler `SUMARIO_EXECUTIVO.md`
2. Consultar `DOCUMENTACAO_TECNICA_FUNCIONAL.md`
3. Usar `GUIA_IMPLEMENTACAO.md` para setup e evolucao

## Quando usar cada arquivo

- Quer entender rapidamente o produto: `SUMARIO_EXECUTIVO.md`
- Quer saber como uma funcionalidade funciona: `DOCUMENTACAO_TECNICA_FUNCIONAL.md`
- Quer rodar o projeto ou fazer manutencao: `GUIA_IMPLEMENTACAO.md`

## Escopo desta documentacao

Esta documentacao foi atualizada para refletir o sistema atualmente implementado no repositorio:
- frontend estatico em `index.html`, `app.js` e `styles.css`
- backend Node.js com Express em `backend/`
- persistencia em PostgreSQL
- autenticacao via JWT
- modulos de comandas, produtos, compras, financeiro e backup
