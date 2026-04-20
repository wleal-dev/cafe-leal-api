// Cria as tabelas e insere usuários padrão com senha hasheada
// Uso: node backend/seed.js

require('dotenv').config({ path: __dirname + '/.env' });
const fs   = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const pool   = require('./db');

async function seed() {
  const client = await pool.connect();
  try {
    // 1. Criar tabelas
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(sql);
    console.log('Tabelas criadas com sucesso.');

    // 2. Inserir usuários padrão
    const usuarios = [
      { username: 'admin', senha: 'admin123', nome: 'Administrador', role: 'Gerente'    },
      { username: 'caixa', senha: 'caixa123', nome: 'Caixa',         role: 'Atendente' },
    ];

    for (const u of usuarios) {
      const hash = await bcrypt.hash(u.senha, 10);
      await client.query(
        `INSERT INTO users (username, senha, nome, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (username) DO NOTHING`,
        [u.username, hash, u.nome, u.role]
      );
      console.log(`Usuário "${u.username}" inserido.`);
    }

    console.log('Seed concluído.');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error('Erro no seed:', err.message);
  process.exit(1);
});
