require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const path    = require('path');

const auth           = require('./middleware/auth');
const rotasAuth      = require('./routes/auth');
const rotasCategorias = require('./routes/categorias');
const rotasProdutos  = require('./routes/produtos');
const rotasComandas  = require('./routes/comandas');
const rotasHistorico = require('./routes/historico');
const rotasFornecedores = require('./routes/fornecedores');
const rotasCompras   = require('./routes/compras');
const rotasSaidas    = require('./routes/saidas');
const rotasConfiguracoes = require('./routes/configuracoes');
const rotasBackup        = require('./routes/backup');

const app  = express();
const PORT = process.env.PORT || 3000;

// Body parser — limite 10mb para suportar foto base64 em compras
app.use(express.json({ limit: '10mb' }));

// Serve arquivos estáticos do frontend (index.html, app.js, styles.css, logo.png)
app.use(express.static(path.join(__dirname, '..')));

// ── Rotas públicas ──────────────────────────────────────────
app.use('/api/auth', rotasAuth);

// ── Rotas protegidas (JWT obrigatório) ──────────────────────
app.use('/api/categorias',    auth, rotasCategorias);
app.use('/api/produtos',      auth, rotasProdutos);
app.use('/api/comandas',      auth, rotasComandas);
app.use('/api/historico',     auth, rotasHistorico);
app.use('/api/fornecedores',  auth, rotasFornecedores);
app.use('/api/compras',       auth, rotasCompras);
app.use('/api/saidas',        auth, rotasSaidas);
app.use('/api/configuracoes', auth, rotasConfiguracoes);
app.use('/api/backup',       auth, rotasBackup);

// Fallback → SPA (qualquer rota não-API devolve index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Café Leal rodando na porta ${PORT}`);
  });
}

module.exports = app;
