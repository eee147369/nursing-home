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

// 自动初始化数据库（生产环境，表不存在时创建）
if (process.env.NODE_ENV === 'production') {
  autoInit();
}
