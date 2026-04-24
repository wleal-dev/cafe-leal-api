require('dotenv').config({ path: __dirname + '/.env' });

// Valida força mínima do JWT_SECRET antes de subir o servidor (V-05)
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET ausente ou fraco (mínimo 32 caracteres).');
}

const express = require('express');
const helmet  = require('helmet');
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
const rotasCaixas        = require('./routes/caixas');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:     ["'self'", 'data:'],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
}));

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
app.use('/api/caixas',       auth, rotasCaixas);

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
