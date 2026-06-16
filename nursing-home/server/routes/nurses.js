const pool = require('../db');
const express = require('express');
const router = express.Router();

// List all with order count
router.get('/', async (req, res) => {
  const { search, gender } = req.query;
  let sql = `
    SELECT n.*, COUNT(rel.rel_id) AS order_count
    FROM nurse_info n
    LEFT JOIN nurse_order_rel rel ON n.nurse_user = rel.nurse_user
    WHERE 1=1
  `;
  const params = [];
  if (search) {
    sql += ' AND (n.nurse_user LIKE ? OR n.nurse_phone LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (gender) {
    sql += ' AND n.nurse_gender = ?';
    params.push(gender);
  }
  sql += ' GROUP BY n.nurse_user ORDER BY n.nurse_user';
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
    const [rows] = await pool.query('SELECT * FROM nurse_info WHERE nurse_user = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: '护工不存在' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create
router.post('/', async (req, res) => {
  const { nurse_user, nurse_age, nurse_gender, nurse_photo, nurse_phone } = req.body;
  try {
    await pool.query(
      'INSERT INTO nurse_info (nurse_user, nurse_age, nurse_gender, nurse_photo, nurse_phone) VALUES (?, ?, ?, ?, ?)',
      [nurse_user, nurse_age, nurse_gender, nurse_photo || null, nurse_phone]
    );
    res.status(201).json({ nurse_user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  const { nurse_age, nurse_gender, nurse_photo, nurse_phone } = req.body;
  try {
    await pool.query(
      'UPDATE nurse_info SET nurse_age = ?, nurse_gender = ?, nurse_photo = ?, nurse_phone = ? WHERE nurse_user = ?',
      [nurse_age, nurse_gender, nurse_photo || null, nurse_phone, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM nurse_info WHERE nurse_user = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
