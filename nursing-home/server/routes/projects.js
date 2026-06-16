const pool = require('../db');
const express = require('express');
const router = express.Router();

// List all
router.get('/', async (req, res) => {
  const { type } = req.query;
  let sql = 'SELECT * FROM care_project WHERE 1=1';
  const params = [];
  if (type) {
    sql += ' AND project_type = ?';
    params.push(type);
  }
  sql += ' ORDER BY project_id';
  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get types
router.get('/types', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT project_type FROM care_project ORDER BY project_type');
    res.json(rows.map((r) => r.project_type));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM care_project WHERE project_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: '项目不存在' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create
router.post('/', async (req, res) => {
  const { project_name, project_type, project_img } = req.body;
  try {
    const [rows] = await pool.query(
      'INSERT INTO care_project (project_name, project_type, project_img) VALUES (?, ?, ?) RETURNING project_id',
      [project_name, project_type, project_img || null]
    );
    res.status(201).json({ project_id: rows[0].project_id, project_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  const { project_name, project_type, project_img } = req.body;
  try {
    await pool.query(
      'UPDATE care_project SET project_name = ?, project_type = ?, project_img = ? WHERE project_id = ?',
      [project_name, project_type, project_img || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM care_project WHERE project_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
