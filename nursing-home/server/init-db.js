const { Pool } = require('pg');

async function init() {
  // 先连接到默认 postgres 数据库，创建目标数据库
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres',
  });

  const DB_NAME = process.env.DB_NAME || 'nursing_home';

  try {
    const { rows } = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DB_NAME]
    );
    if (rows.length === 0) {
      await adminPool.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`✓ 数据库 "${DB_NAME}" 创建成功`);
    } else {
      console.log(`→ 数据库 "${DB_NAME}" 已存在`);
    }
  } finally {
    await adminPool.end();
  }

  // 连接到目标数据库执行 DDL + 种子数据
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: DB_NAME,
  });

  try {
    // ==================== DDL ====================
    console.log('正在创建表...');

    // 先删除旧表（如果有）
    await pool.query('DROP TABLE IF EXISTS nurse_order_rel CASCADE');
    await pool.query('DROP TABLE IF EXISTS hiring_order CASCADE');
    await pool.query('DROP TABLE IF EXISTS care_project CASCADE');
    await pool.query('DROP TABLE IF EXISTS relative_user CASCADE');
    await pool.query('DROP TABLE IF EXISTS nurse_info CASCADE');
    await pool.query('DROP TABLE IF EXISTS admin CASCADE');

    // admin
    await pool.query(`
      CREATE TABLE admin (
        admin_id SERIAL PRIMARY KEY,
        username VARCHAR(32) NOT NULL,
        password VARCHAR(64) NOT NULL
      )
    `);
    console.log('  ✓ admin');

    // nurse_info
    await pool.query(`
      CREATE TABLE nurse_info (
        nurse_user VARCHAR(20) PRIMARY KEY,
        nurse_age SMALLINT NOT NULL,
        nurse_gender VARCHAR(2) NOT NULL,
        nurse_photo VARCHAR(255) DEFAULT NULL,
        nurse_phone CHAR(11) NOT NULL
      )
    `);
    console.log('  ✓ nurse_info');

    // relative_user
    await pool.query(`
      CREATE TABLE relative_user (
        relative_id SERIAL PRIMARY KEY,
        relative_name VARCHAR(20) NOT NULL,
        relative_phone CHAR(11) NOT NULL UNIQUE,
        elder_name VARCHAR(20) NOT NULL,
        elder_age VARCHAR(10) NOT NULL,
        elder_gender VARCHAR(10) NOT NULL
      )
    `);
    console.log('  ✓ relative_user');

    // hiring_order
    await pool.query(`
      CREATE TABLE hiring_order (
        order_id SERIAL PRIMARY KEY,
        nurse_user VARCHAR(32) NOT NULL DEFAULT '',
        elder_id INT NOT NULL,
        service_type VARCHAR(40) DEFAULT '待接单',
        order_time TIMESTAMP DEFAULT NULL,
        service_time TIMESTAMP DEFAULT NULL,
        service_end TIMESTAMP DEFAULT NULL
      )
    `);
    console.log('  ✓ hiring_order');

    // care_project
    await pool.query(`
      CREATE TABLE care_project (
        project_id SERIAL PRIMARY KEY,
        project_name VARCHAR(20) NOT NULL,
        project_type VARCHAR(20) NOT NULL,
        project_img VARCHAR(255) DEFAULT NULL
      )
    `);
    console.log('  ✓ care_project');

    // nurse_order_rel
    await pool.query(`
      CREATE TABLE nurse_order_rel (
        rel_id SERIAL,
        order_id INT NOT NULL,
        nurse_user VARCHAR(10) NOT NULL,
        PRIMARY KEY (order_id, nurse_user)
      )
    `);
    console.log('  ✓ nurse_order_rel');

    // ==================== 种子数据 ====================
    console.log('正在插入测试数据...');

    // Admin
    await pool.query(`
      INSERT INTO admin (admin_id, username, password) VALUES
        (1, 'admin', '123456'),
        (2, 'superadmin', 'admin888')
      ON CONFLICT (admin_id) DO NOTHING
    `);
    await pool.query(`SELECT setval('admin_admin_id_seq', (SELECT MAX(admin_id) FROM admin))`);

    // Nurses
    await pool.query(`
      INSERT INTO nurse_info (nurse_user, nurse_age, nurse_gender, nurse_photo, nurse_phone) VALUES
        ('nurse_zhang', 32, '女', 'https://api.dicebear.com/8.x/avataaars/svg?seed=zhang', '13800138001'),
        ('nurse_li', 28, '女', 'https://api.dicebear.com/8.x/avataaars/svg?seed=li', '13800138002'),
        ('nurse_wang', 35, '男', 'https://api.dicebear.com/8.x/avataaars/svg?seed=wang', '13800138003'),
        ('nurse_zhao', 30, '女', 'https://api.dicebear.com/8.x/avataaars/svg?seed=zhao', '13800138004'),
        ('nurse_chen', 40, '男', 'https://api.dicebear.com/8.x/avataaars/svg?seed=chen', '13800138005')
      ON CONFLICT (nurse_user) DO NOTHING
    `);

    // Relatives
    await pool.query(`
      INSERT INTO relative_user (relative_id, relative_name, relative_phone, elder_name, elder_age, elder_gender) VALUES
        (1, '赵建国', '13900139001', '赵大爷', '78', '男'),
        (2, '李明华', '13900139002', '李奶奶', '82', '女'),
        (3, '王磊', '13900139003', '王大爷', '75', '男'),
        (4, '张秀英', '13900139004', '张奶奶', '71', '女'),
        (5, '刘强', '13900139005', '刘大爷', '80', '男'),
        (6, '孙丽', '13900139006', '孙奶奶', '85', '女')
      ON CONFLICT (relative_id) DO NOTHING
    `);
    await pool.query(`SELECT setval('relative_user_relative_id_seq', (SELECT MAX(relative_id) FROM relative_user))`);

    // Orders
    await pool.query(`
      INSERT INTO hiring_order (order_id, nurse_user, elder_id, service_type, order_time, service_time, service_end) VALUES
        (1, 'nurse_zhang', 1, '已完成', '2026-05-01 08:00:00', '2026-05-01 08:30:00', '2026-05-01 12:00:00'),
        (2, 'nurse_li', 2, '服务中', '2026-05-15 09:00:00', '2026-05-15 09:00:00', NULL),
        (3, '', 3, '待接单', '2026-05-20 10:00:00', NULL, NULL),
        (4, 'nurse_wang', 4, '已接单', '2026-05-22 14:00:00', '2026-05-25 08:00:00', NULL),
        (5, 'nurse_zhang', 5, '已完成', '2026-05-10 07:00:00', '2026-05-10 07:30:00', '2026-05-10 18:00:00'),
        (6, 'nurse_zhao', 6, '服务中', '2026-05-18 08:00:00', '2026-05-18 08:00:00', NULL),
        (7, '', 1, '待接单', '2026-05-25 16:00:00', NULL, NULL)
      ON CONFLICT (order_id) DO NOTHING
    `);
    await pool.query(`SELECT setval('hiring_order_order_id_seq', (SELECT MAX(order_id) FROM hiring_order))`);

    // Nurse-order relations
    await pool.query(`
      INSERT INTO nurse_order_rel (order_id, nurse_user) VALUES
        (1, 'nurse_zhang'),
        (2, 'nurse_li'),
        (4, 'nurse_wang'),
        (5, 'nurse_zhang'),
        (6, 'nurse_zhao')
    `);

    // Care projects
    await pool.query(`
      INSERT INTO care_project (project_id, project_name, project_type, project_img) VALUES
        (1, '晨间护理', '日常照料', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop'),
        (2, '康复训练', '康复护理', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop'),
        (3, '药物管理', '医疗护理', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop'),
        (4, '营养配餐', '日常照料', 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop'),
        (5, '血压监测', '医疗护理', 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=400&h=300&fit=crop'),
        (6, '心理疏导', '康复护理', 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=400&h=300&fit=crop')
      ON CONFLICT (project_id) DO NOTHING
    `);
    await pool.query(`SELECT setval('care_project_project_id_seq', (SELECT MAX(project_id) FROM care_project))`);

    console.log('\n✓ 数据库初始化成功!');
  } catch (err) {
    console.error('初始化失败:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

init().catch((err) => {
  console.error(err);
  process.exit(1);
});
