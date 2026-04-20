const router  = require('express').Router();
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const db      = require('../db');
const auth    = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { user, pass } = req.body;
    if (!user || !pass) {
      return res.status(400).json({ error: 'Usuário e senha obrigatórios' });
    }

    const { rows } = await db.query(
      'SELECT * FROM users WHERE username = $1 AND ativo = TRUE',
      [user.toLowerCase()]
    );
    const found = rows[0];

    if (!found || !(await bcrypt.compare(pass, found.senha))) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }

    const payload = {
      id:       found.id,
      username: found.username,
      nome:     found.nome,
      role:     found.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({
      token,
      user: { nome: found.nome, role: found.role, username: found.username },
    });
  } catch (err) {
    console.error('[POST /auth/login]', err.message);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  res.json({
    nome:     req.user.nome,
    role:     req.user.role,
    username: req.user.username,
  });
});

// POST /api/auth/verificar-senha  (confirmar senha do gerente para desconto)
router.post('/verificar-senha', auth, async (req, res) => {
  try {
    const { pass } = req.body;
    if (!pass) return res.status(400).json({ error: 'Senha obrigatória' });
    const { rows } = await db.query(
      "SELECT senha FROM users WHERE role = 'Gerente' AND ativo = TRUE LIMIT 1"
    );
    if (!rows[0] || !(await bcrypt.compare(pass, rows[0].senha))) {
      return res.status(401).json({ error: 'Senha do gerente incorreta' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('[POST /auth/verificar-senha]', err.message);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
