const pool = require('../db');
const express = require('express');
const router = express.Router();

// List all
router.get('/', async (req, res) => {
  const { status, search } = req.query;
  let sql = `
    SELECT h.*, r.elder_name, r.elder_age, r.elder_gender,
           STRING_AGG(rel.nurse_user, ',') AS assigned_nurses
    FROM hiring_order h
    LEFT JOIN relative_user r ON h.elder_id = r.relative_id
    LEFT JOIN nurse_order_rel rel ON h.order_id = rel.order_id
    WHERE 1=1
  `;
  const params = [];
  if (status) {
    sql += ' AND h.service_type = ?';
    params.push(status);
  }
  if (search) {
    sql += ' AND (h.order_id LIKE ? OR r.elder_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += ' GROUP BY h.order_id ORDER BY h.order_time DESC';
  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT h.*, r.elder_name, r.elder_age, r.elder_gender
       FROM hiring_order h
       LEFT JOIN relative_user r ON h.elder_id = r.relative_id
       WHERE h.order_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: '订单不存在' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create
router.post('/', async (req, res) => {
  const { nurse_user, elder_id, service_type, order_time, service_time, service_end, assigned_nurses } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      'INSERT INTO hiring_order (nurse_user, elder_id, service_type, order_time, service_time, service_end) VALUES (?, ?, ?, ?, ?, ?) RETURNING order_id',
      [nurse_user || '', elder_id, service_type || '待接单', order_time || new Date(), service_time || null, service_end || null]
    );
    const orderId = rows[0].order_id;
    if (assigned_nurses && Array.isArray(assigned_nurses)) {
      for (const nurse of assigned_nurses) {
        await conn.query('INSERT INTO nurse_order_rel (order_id, nurse_user) VALUES (?, ?)', [orderId, nurse]);
      }
    }
    await conn.commit();
    res.status(201).json({ order_id: orderId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Update
router.put('/:id', async (req, res) => {
  const { nurse_user, elder_id, service_type, service_time, service_end, assigned_nurses } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'UPDATE hiring_order SET nurse_user = ?, elder_id = ?, service_type = ?, service_time = ?, service_end = ? WHERE order_id = ?',
      [nurse_user || '', elder_id, service_type, service_time || null, service_end || null, req.params.id]
    );
    if (assigned_nurses !== undefined) {
      await conn.query('DELETE FROM nurse_order_rel WHERE order_id = ?', [req.params.id]);
      if (Array.isArray(assigned_nurses)) {
        for (const nurse of assigned_nurses) {
          await conn.query('INSERT INTO nurse_order_rel (order_id, nurse_user) VALUES (?, ?)', [req.params.id, nurse]);
        }
      }
    }
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Update status only
router.patch('/:id/status', async (req, res) => {
  const { service_type } = req.body;
  try {
    await pool.query('UPDATE hiring_order SET service_type = ? WHERE order_id = ?', [service_type, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM nurse_order_rel WHERE order_id = ?', [req.params.id]);
    await conn.query('DELETE FROM hiring_order WHERE order_id = ?', [req.params.id]);
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
