const { Pool } = require('pg');

let poolConfig;

if (process.env.DATABASE_URL) {
  // Render 自动注入的 PostgreSQL 连接字符串
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'nursing_home',
    max: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  };
  if (process.env.DB_SSL === 'true') {
    poolConfig.ssl = { rejectUnauthorized: false };
  }
}

const pool = new Pool(poolConfig);

// ----- mysql2 兼容层 -----
// 将 mysql2 的 ? 占位符转换为 pg 的 $1, $2, ...
function pgify(sql, params) {
  if (!params || params.length === 0) return { sql, params: undefined };
  let i = 0;
  const converted = sql.replace(/\?/g, () => `$${++i}`);
  return { sql: converted, params };
}

// 包装 pool.query → 返回 [rows, fields] 以匹配 mysql2 的解构习惯
const origQuery = pool.query.bind(pool);
pool.query = async (sql, params) => {
  if (typeof sql === 'string') {
    const q = pgify(sql, params);
    const result = await origQuery(q.sql, q.params);
    return [result.rows, result.fields];
  }
  // 兼容对象传参形式
  const result = await origQuery(sql);
  return [result.rows, result.fields];
};

// 包装 pool.connect → 提供 mysql2 风格的 getConnection 事务 API
pool.getConnection = async function () {
  const client = await pool.connect();
  const origClientQuery = client.query.bind(client);

  client.query = async (sql, params) => {
    if (typeof sql === 'string') {
      const q = pgify(sql, params);
      const result = await origClientQuery(q.sql, q.params);
      return [result.rows, result.fields];
    }
    const result = await origClientQuery(sql);
    return [result.rows, result.fields];
  };

  client.beginTransaction = () => client.query('BEGIN');
  client.commit = () => client.query('COMMIT');
  client.rollback = () => client.query('ROLLBACK');
  // client.release() 原生已存在
  return client;
};

// 测试连接
pool.query('SELECT 1 AS ok')
  .then(() => console.log('数据库连接成功:', process.env.DB_NAME || 'nursing_home'))
  .catch((err) => console.error('数据库连接失败:', err.message));

module.exports = pool;
