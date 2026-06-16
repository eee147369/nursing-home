const pool = require('../db');
const express = require('express');
const router = express.Router();

// List all
router.get('/', async (req, res) => {
  const { search } = req.query;
  let sql = 'SELECT * FROM relative_user WHERE 1=1';
  const params = [];
  if (search) {
    sql += ' AND (relative_name LIKE ? OR relative_phone LIKE ? OR elder_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  sql += ' ORDER BY relative_id';
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
    const [rows] = await pool.query('SELECT * FROM relative_user WHERE relative_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: '亲属不存在' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create
router.post('/', async (req, res) => {
  const { relative_name, relative_phone, elder_name, elder_age, elder_gender } = req.body;
  try {
    const [rows] = await pool.query(
      'INSERT INTO relative_user (relative_name, relative_phone, elder_name, elder_age, elder_gender) VALUES (?, ?, ?, ?, ?) RETURNING relative_id',
      [relative_name, relative_phone, elder_name, elder_age, elder_gender]
    );
    res.status(201).json({ relative_id: rows[0].relative_id, relative_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  const { relative_name, relative_phone, elder_name, elder_age, elder_gender } = req.body;
  try {
    await pool.query(
      'UPDATE relative_user SET relative_name = ?, relative_phone = ?, elder_name = ?, elder_age = ?, elder_gender = ? WHERE relative_id = ?',
      [relative_name, relative_phone, elder_name, elder_age, elder_gender, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM relative_user WHERE relative_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
