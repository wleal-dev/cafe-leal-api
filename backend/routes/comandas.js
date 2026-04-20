const router = require('express').Router();
const db     = require('../db');

// Helper: busca comanda com itens agregados
async function fetchComanda(id, client) {
  const cli = client || db;
  const { rows } = await cli.query(
    `SELECT
       c.id, c.nome, c.mesa, c.total, c.hora, c.data,
       c.abertura, c.operador, c.status,
       c.parent_id AS "parentId",
       COALESCE(
         json_agg(
           json_build_object(
             'id',    ci.id,
             'nome',  ci.nome,
             'qty',   ci.qty,
             'preco', ci.preco,
             'nota',  ci.nota
           ) ORDER BY ci.id
         ) FILTER (WHERE ci.id IS NOT NULL),
         '[]'
       ) AS itens
     FROM comandas c
     LEFT JOIN comanda_itens ci ON ci.comanda_id = c.id
     WHERE c.id = $1
     GROUP BY c.id`,
    [id]
  );
  return rows[0] || null;
}

// GET /api/comandas
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         c.id, c.nome, c.mesa, c.total, c.hora, c.data,
         c.abertura, c.operador, c.status,
         c.parent_id AS "parentId",
         COALESCE(
           json_agg(
             json_build_object(
               'id',    ci.id,
               'nome',  ci.nome,
               'qty',   ci.qty,
               'preco', ci.preco,
               'nota',  ci.nota
             ) ORDER BY ci.id
           ) FILTER (WHERE ci.id IS NOT NULL),
           '[]'
         ) AS itens
       FROM comandas c
       LEFT JOIN comanda_itens ci ON ci.comanda_id = c.id
       GROUP BY c.id
       ORDER BY c.abertura DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('[GET /comandas]', err.message);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/comandas
// Body: { nome, mesa, itens: [{ nome, qty, preco, nota }], total, hora, data, abertura, operador, parentId? }
router.post('/', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { nome, mesa, itens = [], total, hora, data, abertura, operador, parentId } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome do cliente obrigatório' });

    const { rows } = await client.query(
      `INSERT INTO comandas (nome, mesa, total, hora, data, abertura, operador, status, parent_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'aberta', $8)
       RETURNING id`,
      [nome, mesa || null, total || 0, hora || null, data || null,
       abertura || new Date().toISOString(), operador || null, parentId || null]
    );
    const comandaId = rows[0].id;

    for (const item of itens) {
      await client.query(
        `INSERT INTO comanda_itens (comanda_id, nome, qty, preco, nota)
         VALUES ($1, $2, $3, $4, $5)`,
        [comandaId, item.nome, item.qty, item.preco, item.nota || null]
      );
    }

    await client.query('COMMIT');
    const comanda = await fetchComanda(comandaId);
    res.status(201).json(comanda);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[POST /comandas]', err.message);
    res.status(500).json({ error: 'Erro interno' });
  } finally {
    client.release();
  }
});

// PUT /api/comandas/:id
// Body: { nome?, mesa?, total?, itens?: [...] }
// Substitui todos os itens se itens vier no body
router.put('/:id', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { nome, mesa, total, hora, data, operador, itens } = req.body;

    await client.query(
      `UPDATE comandas
       SET nome     = COALESCE($1, nome),
           mesa     = COALESCE($2, mesa),
           total    = COALESCE($3, total),
           hora     = COALESCE($4, hora),
           data     = COALESCE($5, data),
           operador = COALESCE($6, operador)
       WHERE id = $7`,
      [nome, mesa, total, hora, data, operador, req.params.id]
    );

    if (Array.isArray(itens)) {
      await client.query('DELETE FROM comanda_itens WHERE comanda_id = $1', [req.params.id]);
      for (const item of itens) {
        await client.query(
          `INSERT INTO comanda_itens (comanda_id, nome, qty, preco, nota)
           VALUES ($1, $2, $3, $4, $5)`,
          [req.params.id, item.nome, item.qty, item.preco, item.nota || null]
        );
      }
    }

    await client.query('COMMIT');
    const comanda = await fetchComanda(req.params.id);
    if (!comanda) return res.status(404).json({ error: 'Comanda não encontrada' });
    res.json(comanda);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[PUT /comandas/:id]', err.message);
    res.status(500).json({ error: 'Erro interno' });
  } finally {
    client.release();
  }
});

// DELETE /api/comandas/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM comandas WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /comandas/:id]', err.message);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/comandas/:id/fechar
// Body: { desconto, descontoPercentual, totalFinal, formaPagamento }
router.post('/:id/fechar', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const comanda = await fetchComanda(req.params.id, client);
    if (!comanda) return res.status(404).json({ error: 'Comanda não encontrada' });

    const { desconto = 0, descontoPercentual = 0, totalFinal, formaPagamento } = req.body;
    if (!formaPagamento) return res.status(400).json({ error: 'Forma de pagamento obrigatória' });

    const agora = new Date();
    const horaFechamento = agora.toTimeString().slice(0, 5);
    const dataFechamento = agora.toLocaleDateString('pt-BR');

    // Inserir no histórico
    const { rows: histRows } = await client.query(
      `INSERT INTO historico
         (nome, mesa, total, hora, data, abertura, operador, status,
          hora_fechamento, data_fechamento, fechamento,
          desconto, desconto_percentual, total_final, forma_pagamento)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'fechada',$8,$9,$10,$11,$12,$13,$14)
       RETURNING id`,
      [
        comanda.nome, comanda.mesa, comanda.total,
        comanda.hora, comanda.data, comanda.abertura, comanda.operador,
        horaFechamento, dataFechamento, agora.toISOString(),
        desconto, descontoPercentual,
        totalFinal != null ? totalFinal : comanda.total,
        formaPagamento,
      ]
    );
    const historicoId = histRows[0].id;

    // Copiar itens para historico_itens
    for (const item of comanda.itens) {
      await client.query(
        `INSERT INTO historico_itens (historico_id, nome, qty, preco, nota)
         VALUES ($1, $2, $3, $4, $5)`,
        [historicoId, item.nome, item.qty, item.preco, item.nota || null]
      );
    }

    // Remover comanda (cascade remove comanda_itens)
    await client.query('DELETE FROM comandas WHERE id = $1', [req.params.id]);

    await client.query('COMMIT');
    res.json({ ok: true, historicoId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[POST /comandas/:id/fechar]', err.message);
    res.status(500).json({ error: 'Erro interno' });
  } finally {
    client.release();
  }
});

// POST /api/comandas/:id/cancelar
router.post('/:id/cancelar', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const comanda = await fetchComanda(req.params.id, client);
    if (!comanda) return res.status(404).json({ error: 'Comanda não encontrada' });

    const agora = new Date();
    const horaFechamento = agora.toTimeString().slice(0, 5);
    const dataFechamento = agora.toLocaleDateString('pt-BR');

    const { rows: histRows } = await client.query(
      `INSERT INTO historico
         (nome, mesa, total, hora, data, abertura, operador, status,
          hora_fechamento, data_fechamento, fechamento,
          desconto, desconto_percentual, total_final, forma_pagamento)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'cancelada',$8,$9,$10,0,0,$11,'Cancelada')
       RETURNING id`,
      [
        comanda.nome, comanda.mesa, comanda.total,
        comanda.hora, comanda.data, comanda.abertura, comanda.operador,
        horaFechamento, dataFechamento, agora.toISOString(),
        comanda.total,
      ]
    );
    const historicoId = histRows[0].id;

    for (const item of comanda.itens) {
      await client.query(
        `INSERT INTO historico_itens (historico_id, nome, qty, preco, nota)
         VALUES ($1, $2, $3, $4, $5)`,
        [historicoId, item.nome, item.qty, item.preco, item.nota || null]
      );
    }

    await client.query('DELETE FROM comandas WHERE id = $1', [req.params.id]);

    await client.query('COMMIT');
    res.json({ ok: true, historicoId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[POST /comandas/:id/cancelar]', err.message);
    res.status(500).json({ error: 'Erro interno' });
  } finally {
    client.release();
  }
});

module.exports = router;
