# RedInk - 小红书 AI 图文生成器

![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)
![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)
![Vue 3](https://img.shields.io/badge/vue-3.x-green.svg)
![Flask](https://img.shields.io/badge/flask-3.x-lightgrey.svg)

> 基于 Google Gemini 的智能小红书图文内容生成工具

**本项目 Fork 自 [HisMax/RedInk](https://github.com/HisMax/RedInk)，并进行了以下改进：**
- ✅ 支持 Vercel + Railway 分离部署
- ✅ 前后端完全解耦，易于维护和扩展
- ✅ 支持 upstream 仓库同步，自动获取上游更新
- ✅ Docker 多阶段构建，优化部署效率

---

## 📖 项目简介

RedInk 是一个智能的小红书图文内容生成工具，支持：
- 🎯 AI 生成内容大纲
- 🎨 自动生成精美图片
- 📸 支持参考图片上传
- 💾 历史记录管理
- ⚙️ 灵活的 API 配置

## 🏗️ 项目架构

```
RedInk/
├── frontend/          # Vue 3 前端应用 (Vercel 部署)
│   ├── src/
│   │   ├── components/   # Vue 组件
│   │   ├── views/        # 页面视图
│   │   ├── api/          # API 接口
│   │   └── stores/       # Pinia 状态管理
│   └── dist/         # 构建输出
│
├── backendjs/        # Node.js/TypeScript 后端 (已弃用)
│   ├── src/
│   │   ├── routes/       # Express 路由
│   │   ├── services/     # 业务逻辑
│   │   └── config/       # 配置管理
│   └── dist/         # 构建输出
│
├── backend/          # Python/Flask 后端 (Railway 部署)
│   ├── routes/       # Flask 路由
│   ├── services/     # 业务逻辑
│   ├── generators/   # AI 生成器
│   └── utils/        # 工具函数
│
├── docs/             # 项目文档
│   ├── deployment/   # 部署相关文档
│   ├── RAILWAY_PYTHON_DEPLOYMENT.md  # Python 后端部署指南
│   └── ORIGINAL_README.md  # 原项目 README
│
├── Dockerfile        # Railway Docker 构建配置
├── railway.json      # Railway 部署配置
└── config/           # 配置文件模板
```

---

## 🚀 快速部署

### 在线部署（推荐）

#### 前端部署到 Vercel

1. Fork 本仓库到你的 GitHub 账号
2. 访问 [Vercel](https://vercel.com)，导入你的 Fork 仓库
3. 配置构建设置：
   - **Framework Preset**: `Other`（或 `Vite`）
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
4. 添加环境变量：
   ```
   VITE_API_BASE_URL=https://your-railway-app.railway.app/api
   ```
5. 点击 **Deploy**

#### 后端部署到 Railway (Python)

1. 访问 [Railway](https://railway.app)，创建新项目
2. 连接你的 GitHub 仓库，选择 main 分支
3. Railway 会自动检测 `Dockerfile` 并构建部署
4. 添加环境变量：
   ```
   TEXT_API_KEY=your-text-api-key
   TEXT_BASE_URL=https://api.openai.com/v1
   IMAGE_API_KEY=your-image-api-key
   IMAGE_BASE_URL=https://api.openai.com/v1
   ```
5. 在 Settings → Networking 中生成域名
6. 复制 Railway 域名，更新 Vercel 的 `VITE_API_BASE_URL`

**详细部署指南**: 查看 [docs/RAILWAY_PYTHON_DEPLOYMENT.md](./docs/RAILWAY_PYTHON_DEPLOYMENT.md)

---

## 💻 本地开发

### 前置要求
- Python 3.11+
- Node.js 18+
- uv (Python 包管理器)

### 1. 克隆项目
```bash
git clone https://github.com/your-username/RedInk.git
cd RedInk
```

### 2. 安装依赖

**前端:**
```bash
cd frontend
npm install
```

**后端:**
```bash
cd backend
# 安装 uv
pip install uv

# 安装依赖
uv sync
```

### 3. 配置环境变量

**前端 (frontend/.env.development):**
```env
VITE_API_BASE_URL=/api
```

**后端配置文件:**
复制配置模板：
```bash
cp docker/text_providers.yaml ./
cp docker/image_providers.yaml ./
```

编辑 `text_providers.yaml` 和 `image_providers.yaml`，填入你的 API Key。

### 4. 启动服务

**启动后端** (终端 1):
```bash
cd backend
uv run python -m backend.app
# 或者
python -m backend.app
```

**启动前端** (终端 2):
```bash
cd frontend
npm run dev
```

访问 http://localhost:5173

---

## 🔄 Upstream 同步

本项目保持与 [HisMax/RedInk](https://github.com/HisMax/RedInk) 同步更新。

### 配置 upstream (仅需一次)

```bash
git remote add upstream https://github.com/HisMax/RedInk.git
git fetch upstream
```

### 同步 upstream 更新

```bash
# 拉取上游更新
git fetch upstream

# 合并 upstream/main 到当前分支
git merge upstream/main

# 推送到你的 Fork
git push origin main
```

**自动同步**: 本项目已配置 GitHub Actions，每周自动同步 upstream 更新。

**详细说明**: 查看 [docs/SYNC_UPSTREAM.md](./docs/SYNC_UPSTREAM.md)

---

## 📚 文档

- [快速开始指南](./docs/QUICK_START.md) - 完整的部署和使用教程
- [Vercel 部署指南](./docs/deployment/VERCEL_SETUP_GUIDE.md)
- [Railway 部署指南](./docs/deployment/RAILWAY_FIX.md)
- [Upstream 同步指南](./docs/SYNC_UPSTREAM.md)
- [原项目 README](./docs/ORIGINAL_README.md) - 功能介绍和使用说明

---

## 🎮 使用指南

### 基础使用
1. **输入主题**: 在首页输入想要创作的主题
2. **生成大纲**: AI 自动生成内容大纲
3. **编辑确认**: 编辑和调整每一页的描述
4. **生成图片**: 点击生成，实时查看进度
5. **下载使用**: 一键下载所有图片

### 进阶功能
- 上传参考图片，保持品牌视觉风格
- 修改描述词，精确控制内容和构图
- 重新生成不满意的页面
- 历史记录管理

---

## 🔧 配置说明

### 环境变量

#### 前端环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `https://your-app.railway.app/api` |

#### 后端环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `TEXT_API_KEY` | 文本生成 API Key | ✅ |
| `TEXT_BASE_URL` | 文本生成 API 地址 | ✅ |
| `IMAGE_API_KEY` | 图片生成 API Key | ✅ |
| `IMAGE_BASE_URL` | 图片生成 API 地址 | ✅ |
| `PORT` | 服务器端口 | ❌ (默认 3000) |

---

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request!

### 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 开源协议

本项目采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议

**个人使用**: 自由使用、修改、分享
**商业授权**: 请联系原作者 histonemax@gmail.com

---

## 🙏 致谢

- **原作者**: [@HisMax](https://github.com/HisMax) - 感谢创建了这个优秀的项目
- [Google Gemini](https://ai.google.dev/) - 强大的 AI 能力
- [Vercel](https://vercel.com) - 前端托管平台
- [Railway](https://railway.app) - 后端托管平台

---

## 📞 联系方式

- **原作者 Email**: histonemax@gmail.com
- **原作者微信**: Histone2024
- **原项目仓库**: [HisMax/RedInk](https://github.com/HisMax/RedInk)

---

**如果这个项目帮到了你，欢迎给个 Star ⭐**
