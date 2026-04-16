import { Router } from 'express';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public: create lead from contact form
router.post('/', async (req, res) => {
  const { name, phone, service, message, source, utm_source, utm_medium, utm_campaign } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  const { rows } = await pool.query(
    `INSERT INTO leads (name, phone, service, message, source, utm_source, utm_medium, utm_campaign)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, created_at`,
    [name, phone, service || null, message || null, source || 'website', utm_source || null, utm_medium || null, utm_campaign || null]
  );

  res.status(201).json({ success: true, id: rows[0].id });
});

// Admin: get all leads
router.get('/', authMiddleware, async (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;

  let query = 'SELECT * FROM leads';
  const params = [];

  if (status) {
    params.push(status);
    query += ` WHERE status = $${params.length}`;
  }

  query += ' ORDER BY created_at DESC';
  params.push(parseInt(limit));
  query += ` LIMIT $${params.length}`;
  params.push(parseInt(offset));
  query += ` OFFSET $${params.length}`;

  const { rows } = await pool.query(query, params);

  const countQuery = status
    ? 'SELECT COUNT(*) FROM leads WHERE status = $1'
    : 'SELECT COUNT(*) FROM leads';
  const countParams = status ? [status] : [];
  const { rows: countRows } = await pool.query(countQuery, countParams);

  res.json({ leads: rows, total: parseInt(countRows[0].count) });
});

// Admin: update lead status/notes
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const fields = [];
  const params = [];

  if (status) {
    params.push(status);
    fields.push(`status = $${params.length}`);
  }
  if (notes !== undefined) {
    params.push(notes);
    fields.push(`notes = $${params.length}`);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  fields.push('updated_at = NOW()');
  params.push(parseInt(id));

  const { rows } = await pool.query(
    `UPDATE leads SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  res.json(rows[0]);
});

export default router;
