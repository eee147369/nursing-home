const pool = require('../db');
const express = require('express');
const router = express.Router();

// List all
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT admin_id, username FROM admin ORDER BY admin_id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password]);
    if (rows.length === 0) return res.status(401).json({ error: '用户名或密码错误' });
    res.json({ id: rows[0].admin_id, username: rows[0].username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create
router.post('/', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query('INSERT INTO admin (username, password) VALUES (?, ?) RETURNING admin_id', [username, password]);
    res.status(201).json({ admin_id: rows[0].admin_id, username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update password
router.put('/:id', async (req, res) => {
  const { password } = req.body;
  try {
    await pool.query('UPDATE admin SET password = ? WHERE admin_id = ?', [password, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM admin WHERE admin_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
