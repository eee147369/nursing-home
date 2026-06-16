const pool = require('../db');
const express = require('express');
const router = express.Router();

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [[{ nurseCount }]] = await pool.query('SELECT COUNT(*) AS "nurseCount" FROM nurse_info');
    const [[{ elderCount }]] = await pool.query('SELECT COUNT(*) AS "elderCount" FROM relative_user');
    const [[{ orderCount }]] = await pool.query("SELECT COUNT(*) AS \"orderCount\" FROM hiring_order WHERE service_type NOT IN ('已完成', '已取消')");
    const [[{ projectCount }]] = await pool.query('SELECT COUNT(*) AS "projectCount" FROM care_project');

    // Order status distribution
    const [statusDist] = await pool.query(
      'SELECT service_type AS status, COUNT(*) AS count FROM hiring_order GROUP BY service_type'
    );

    // Recent orders
    const [recentOrders] = await pool.query(
      `SELECT h.order_id, h.service_type, h.order_time, r.elder_name, n.nurse_user
       FROM hiring_order h
       LEFT JOIN relative_user r ON h.elder_id = r.relative_id
       LEFT JOIN nurse_info n ON h.nurse_user = n.nurse_user
       ORDER BY h.order_time DESC LIMIT 5`
    );

    res.json({ nurseCount, elderCount, orderCount, projectCount, statusDist, recentOrders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
