# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

栗庙村养老院智能监护数据库系统 — 数据库应用课程设计报告。

## Key Files

- `栗庙村养老院智能监护数据库系统(2).docx` — 原始课程设计报告（Word 文档）
- `栗庙村养老院智能监护数据库系统.pptx` — 生成的演示文稿（PowerPoint）

## Common Tasks

### Start the web application

```bash
# Terminal 1: Start backend (port 3001)
cd nursing-home && node server/index.js

# Terminal 2: Start frontend (port 5173)
cd nursing-home/client && npx vite --host
```

### Start both servers concurrently

```bash
cd nursing-home && npm run dev
```

### Initialize/reset the database

```bash
node nursing-home/server/init-db.js
```

### Test backend APIs

```bash
curl http://localhost:3001/api/dashboard/stats
curl http://localhost:3001/api/nurses
curl http://localhost:3001/api/relatives
curl http://localhost:3001/api/orders
curl http://localhost:3001/api/projects
curl http://localhost:3001/api/admins
```

### Production build (local test)

```bash
cd nursing-home && npm run build
npm start
```

### Initialize cloud database (with env vars)

```bash
# PostgreSQL
DATABASE_URL=postgresql://user:pass@host:5432/nursing_home node server/init-db.js

# 或分解变量
DB_HOST=<host> DB_PORT=5432 DB_USER=<user> DB_PASSWORD=<pass> DB_NAME=nursing_home node server/init-db.js
```

### Init database (local PostgreSQL default)

```bash
node nursing-home/server/init-db.js
```

### Install all dependencies

```bash
cd nursing-home && npm run install:all
```

### Extract text from docx

```bash
python -m markitdown "栗庙村养老院智能监护数据库系统(2).docx"
```

### Extract text from pptx (verify content)

```bash
python -m markitdown "栗庙村养老院智能监护数据库系统.pptx"
```

### Generate PPTX from scratch (uses PptxGenJS)

```bash
node create_pptx.js
```

### Visual QA (requires LibreOffice + poppler)

```bash
python scripts/soffice.py --headless --convert-to pdf output.pptx
pdftoppm -jpeg -r 150 output.pdf slide
```

## Project Structure

- `nursing-home/` — 完整的 Web 应用（React + Express + PostgreSQL）
  - `server/` — Express 后端 API（port 3001, pg 驱动）
  - `client/` — React 前端（Vite + Tailwind CSS，port 5173）
  - `render.yaml` — Render Blueprint 部署配置（含 PostgreSQL 服务）
  - `.env.example` — 环境变量模板
  - `README.md` — 含详细部署到 Render 的步骤
- 原始报告：`.docx` + `.pptx` 文件
- `.claude/settings.local.json` — local permission overrides

## Deployment (Render)

项目已迁移为 PostgreSQL，可通过 Render Blueprint 一键部署（Web 服务 + PostgreSQL）。

关键改动：

1. **驱动**: `mysql2` → `pg`（PostgreSQL）
2. **端口**: `server/index.js` 使用 `process.env.PORT`
3. **db.js 兼容层**: 自动将 `?` 占位符转换为 `$1,$2,...`，保持路由代码最小改动
4. **构建**: `npm run build` 构建前端，`npm start` 启动生产服务
5. **初始化**: `node server/init-db.js` 支持 `DATABASE_URL` 或分解变量
6. **render.yaml**: 含 `databases` 定义，部署时自动创建 PostgreSQL

**部署步骤**：
1. 推送到 GitHub
2. Render Dashboard → New + → Blueprint → 连接仓库
3. 自动创建 PostgreSQL + Web Service
4. 在 Web Service Shell 中运行 `node server/init-db.js` 初始化数据

## Docx Content Structure

The report covers 6 chapters:
1. 需求分析 — 4 subsystems (护工与订单, 亲属用户与老人, 护理项目, 管理员后台)
2. 数据库概念结构设计 — ER concepts
3. 数据库逻辑结构设计 — Normalization (all tables at 3NF)
4. 数据库实施 — DDL statements for 6 tables
5. 数据库测试 — SQL query examples
6. 数据库持久层设计 — DAO classes (nurse_order_rel, hiring_order)

## Tech Stack

- **Web App**: React 18 + Vite + Tailwind CSS (Frontend), Express + pg (Backend)
- **PPTX Generation**: PptxGenJS (Node.js)
- **Document Processing**: python-docx, markitdown (Python)
- **Database**: PostgreSQL (nursing_home, 6 tables, 已从 MySQL 迁移)

## Session Ending Rule
At the end of every conversation, please:
1. Summarize the current project status and progress
2. Update the "Common Tasks" section with any new useful commands or scripts
3. Add next steps and pending issues for the project