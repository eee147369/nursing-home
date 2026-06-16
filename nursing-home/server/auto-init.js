/**
 * 自动初始化数据库（启动时检测表是否存在，不存在则创建）
 * 解决 Render 免费计划没有 Shell 的问题
 */
const { Pool } = require('pg');

async function autoInit() {
  const poolConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'nursing_home',
      };

  const pool = new Pool(poolConfig);

  try {
    // 检查 admin 表是否存在
    const check = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'admin'
      )`
    );

    if (check.rows[0].exists) {
      console.log('[自动初始化] 数据库已初始化，跳过');
      await pool.end();
      return;
    }

    console.log('[自动初始化] 数据库为空，开始创建表...');

    // ============ 创建表 ============
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin (
        admin_id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(50) NOT NULL,
        admin_level INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS nurse_info (
        nurse_user VARCHAR(50) PRIMARY KEY,
        nurse_age INTEGER NOT NULL,
        nurse_gender VARCHAR(10),
        nurse_photo TEXT,
        nurse_phone VARCHAR(20)
      );
      CREATE TABLE IF NOT EXISTS relative_user (
        relative_id SERIAL PRIMARY KEY,
        relative_name VARCHAR(50) NOT NULL,
        relative_password VARCHAR(50) NOT NULL,
        relative_phone VARCHAR(20),
        elder_name VARCHAR(50),
        elder_condition TEXT,
        elder_room VARCHAR(20)
      );
      CREATE TABLE IF NOT EXISTS hiring_order (
        order_id SERIAL PRIMARY KEY,
        order_status VARCHAR(20) DEFAULT '待接单',
        order_info TEXT,
        relative_id INTEGER REFERENCES relative_user(relative_id),
        total_price NUMERIC(10,2),
        create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS care_project (
        project_id SERIAL PRIMARY KEY,
        project_name VARCHAR(100) NOT NULL,
        project_type VARCHAR(50),
        project_img TEXT
      );
      CREATE TABLE IF NOT EXISTS nurse_order_rel (
        rel_id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES hiring_order(order_id),
        nurse_user VARCHAR(50) REFERENCES nurse_info(nurse_user)
      );
    `);

    console.log('[自动初始化] 表创建完成，插入种子数据...');

    // ============ 种子数据 ============
    await pool.query(`
      INSERT INTO admin (username, password, admin_level) VALUES
        ('admin', '123456', 1),
        ('superadmin', 'admin888', 2)
      ON CONFLICT (username) DO NOTHING;

      INSERT INTO nurse_info (nurse_user, nurse_age, nurse_gender, nurse_phone) VALUES
        ('nurse_wang', 28, '女', '13800138001'),
        ('nurse_li', 32, '女', '13800138002'),
        ('nurse_zhang', 35, '男', '13800138003'),
        ('nurse_zhao', 26, '女', '13800138004'),
        ('nurse_liu', 40, '女', '13800138005')
      ON CONFLICT (nurse_user) DO NOTHING;

      INSERT INTO care_project (project_name, project_type) VALUES
        ('基础生活护理', '生活照料'),
        ('康复理疗', '医疗护理'),
        ('心理疏导', '精神慰藉'),
        ('夜间陪护', '特殊护理'),
        ('用药管理', '医疗护理')
      ON CONFLICT DO NOTHING;
    `);

    // 同步序列
    await pool.query(`SELECT setval('admin_admin_id_seq', COALESCE((SELECT MAX(admin_id) FROM admin), 1))`);
    await pool.query(`SELECT setval('care_project_project_id_seq', COALESCE((SELECT MAX(project_id) FROM care_project), 1))`);

    console.log('[自动初始化] ✅ 完成！');
    await pool.end();
  } catch (err) {
    console.error('[自动初始化] ❌ 失败:', err.message);
    await pool.end();
  }
}

module.exports = autoInit;
