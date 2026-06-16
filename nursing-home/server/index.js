const express = require('express');
const cors = require('cors');
const path = require('path');
const autoInit = require('./auto-init');

const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const nurseRoutes = require('./routes/nurses');
const relativeRoutes = require('./routes/relatives');
const orderRoutes = require('./routes/orders');
const projectRoutes = require('./routes/projects');

async function main() {
  // 生产环境：先初始化数据库，再启动服务器
  if (process.env.NODE_ENV === 'production') {
    console.log('[启动] 正在初始化数据库...');
    try {
      await autoInit();
      console.log('[启动] 数据库初始化完成');
    } catch (err) {
      console.error('[启动] 数据库初始化失败:', err.message);
    }
  }

  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(cors());
  app.use(express.json());

  // API routes
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/admins', adminRoutes);
  app.use('/api/nurses', nurseRoutes);
  app.use('/api/relatives', relativeRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/projects', projectRoutes);

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`服务器已启动: http://localhost:${PORT}`);
  });
}

main();
