# 栗庙村养老院智能监护系统 🏥

数据库应用课程设计项目 — 一个完整的养老院智能监护管理系统。

## 技术栈

| 层    | 技术 |
|-------|------|
| 前端  | React 18 + Vite + Tailwind CSS |
| 后端  | Express (Node.js) |
| 数据库 | PostgreSQL |

## 快速开始（本地开发）

### 前置条件

- Node.js 18+
- PostgreSQL 15+（本地运行）

### 安装 PostgreSQL（本地）

**Windows**: 从 [postgresql.org](https://www.postgresql.org/download/windows/) 下载安装包，安装时设置密码为 `postgres`

**Linux (Ubuntu/Debian)**:
```bash
sudo apt install postgresql
sudo systemctl start postgresql
```

**macOS**:
```bash
brew install postgresql@16
brew services start postgresql@16
```

### 安装与启动

```bash
# 1. 安装所有依赖
cd nursing-home && npm run install:all

# 2. 初始化数据库（确保 PostgreSQL 已运行）
node server/init-db.js

# 3. 启动开发服务器（前端 + 后端同时启动）
npm run dev
```

- 前端：http://localhost:5173
- 后端 API：http://localhost:3001/api

### 管理员账号

| 用户名 | 密码 |
|--------|------|
| admin | 123456 |
| superadmin | admin888 |

---

## 🌐 部署到 Render（线上公开访问）

**Render 原生支持 PostgreSQL**，所以只需一次部署即可同时创建 Web 服务和数据库，无需第三方服务。

### 部署方式一：Render Blueprint（推荐，一键部署）

项目中的 [render.yaml](./render.yaml) 已定义好 Web 服务 + PostgreSQL 数据库。只需：

1. **将代码推送到 GitHub**

```bash
git init
git add .
git commit -m "init: nursing home management system"
# 在 GitHub 新建仓库后
git remote add origin https://github.com/你的用户名/nursing-home.git
git push -u origin main
```

2. **在 Render 使用 Blueprint 部署**

   - 登录 [Render Dashboard](https://dashboard.render.com/)
   - 点击 **New +** → **Blueprint**
   - 连接你的 GitHub 仓库
   - Render 会自动识别 `render.yaml`，创建 **Web Service** + **PostgreSQL**
   - 等待部署完成（约 3-5 分钟）

3. **初始化数据库**

   部署后，PostgreSQL 数据库会自动创建。但表中的种子数据需要通过 **Shell** 初始化：

   - 在 Render Dashboard 进入你的 **Web Service**
   - 点击 **Shell** 标签
   - 运行：
   ```bash
   node server/init-db.js
   ```

4. **访问网站**

   部署成功后，访问 `https://nursing-home.onrender.com` 即可使用。

### 部署方式二：手动配置（更灵活）

1. 登录 [Render Dashboard](https://dashboard.render.com/)
2. 创建 **PostgreSQL** 数据库：
   - **New +** → **PostgreSQL**
   - 填写名称 `nursing-home-db`，数据库名 `nursing_home`
   - 选择 **Free** 计划
   - 创建后，复制 **Internal Database URL**（内部连接串）
3. 创建 **Web Service**：
   - **New +** → **Web Service**
   - 连接 GitHub 仓库
   - 配置：

| 配置项 | 值 |
|--------|-----|
| Name | `nursing-home` |
| Language | `Node` |
| Build Command | `npm install && cd client && npm install && npm run build` |
| Start Command | `npm start` |
| Instance Type | **Free** |

4. 添加环境变量（**Advanced** → **Add Environment Variable**）：

   | 变量名 | 值 |
   |--------|-----|
   | `DATABASE_URL` | 粘贴之前复制的 Internal Database URL |
   | `NODE_ENV` | `production` |

5. 点击 **Create Web Service**，等待构建部署
6. 在 Web Service 的 **Shell** 中运行 `node server/init-db.js` 初始化数据

### 环境变量说明

| 变量 | 说明 | 本地默认值 |
|------|------|-----------|
| `PORT` | 服务端口 | `3001` |
| `NODE_ENV` | 运行环境 | `development` |
| `DATABASE_URL` | PostgreSQL 连接串（优先级最高） | — |
| `DB_HOST` | 数据库地址（DATABASE_URL 未设置时生效） | `localhost` |
| `DB_PORT` | 数据库端口 | `5432` |
| `DB_USER` | 数据库用户 | `postgres` |
| `DB_PASSWORD` | 数据库密码 | `postgres` |
| `DB_NAME` | 数据库名 | `nursing_home` |
| `DB_SSL` | 是否启用 SSL | `false` |

---

## 项目结构

```
nursing-home/
├── server/          # Express 后端 API
│   ├── index.js     # 入口（路由注册 + 静态文件服务）
│   ├── db.js        # PostgreSQL 连接池 (pg 驱动)
│   ├── init-db.js   # 数据库初始化（DDL + 种子数据）
│   └── routes/      # 路由模块
│       ├── dashboard.js   # 仪表盘统计
│       ├── admin.js       # 管理员 CRUD + 登录
│       ├── nurses.js      # 护工管理
│       ├── relatives.js   # 亲属管理
│       ├── orders.js      # 订单管理
│       └── projects.js    # 护理项目管理
├── client/          # React 前端
│   ├── src/
│   │   ├── api.js         # API 请求封装
│   │   ├── App.jsx        # 路由配置
│   │   ├── pages/         # 6 个页面
│   │   └── components/    # 共享组件
│   └── index.html
├── package.json     # 根工程脚本
├── render.yaml      # Render Blueprint 配置（含 PostgreSQL）
└── .env.example     # 环境变量示例
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/dashboard/stats` | 仪表盘统计 |
| CRUD | `/api/admins` | 管理员管理 |
| POST | `/api/admins/login` | 管理员登录 |
| CRUD | `/api/nurses` | 护工管理 |
| CRUD | `/api/relatives` | 亲属管理 |
| CRUD | `/api/orders` | 订单管理 |
| GET | `/api/projects/types` | 服务类型列表 |

## 常见问题

### Q: 部署后页面白屏/报错？

在 Render Web Service 的 **Shell** 中运行 `node server/init-db.js` 检查数据库是否正确初始化。然后查看 **Logs** 标签页确认有无报错。

### Q: 如何修改管理员密码？

```sql
-- 通过 Render Shell 连接数据库
psql $DATABASE_URL
-- 然后执行：
UPDATE admin SET password = '新密码' WHERE username = 'admin';
```
