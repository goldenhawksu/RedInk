# RedInk 部署配置总结

本文档总结了 RedInk 项目的完整部署配置，包括前端、后端和环境变量设置。

---

## 📊 部署架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户访问                           │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
   ┌───────▼─────────┐          ┌─────────▼─────────┐
   │   Vercel        │          │   Railway         │
   │   (前端)        │          │   (后端)          │
   │                 │          │                   │
   │  • Vue 3        │◄─────────┤  • Node.js 18+    │
   │  • Vite         │   CORS   │  • Express.js     │
   │  • TypeScript   │          │  • TypeScript     │
   │  • 静态托管     │          │  • Google AI SDK  │
   └─────────────────┘          └───────────────────┘
          ↓                              ↓
   https://your-app            https://your-app
   .vercel.app                 .railway.app/api
```

---

## 🔧 环境变量配置

### Vercel 前端环境变量

在 Vercel 项目设置中配置：

| 变量名 | 值 | 说明 |
|--------|---|------|
| `VITE_API_BASE_URL` | `https://your-railway-app.railway.app/api` | Railway 后端 API 地址 |

**注意事项**：
- ✅ 必须包含 `/api` 后缀
- ✅ 修改后需要重新部署才能生效
- ✅ 本地开发使用 `frontend/.env.development` 配置

### Railway 后端环境变量

在 Railway 项目设置中配置：

| 变量名 | 值 | 说明 | 必填 |
|--------|---|------|------|
| `TEXT_API_KEY` | `sk-xxxxxxxxxxxxx` | 文本生成 API Key | ✅ |
| `TEXT_BASE_URL` | `https://api.openai.com/v1` | 文本生成 API 地址 | ✅ |
| `IMAGE_API_KEY` | `sk-xxxxxxxxxxxxx` | 图片生成 API Key | ✅ |
| `IMAGE_BASE_URL` | `https://api.openai.com/v1` | 图片生成 API 地址 | ✅ |
| `PORT` | `3000` | 服务器端口 | ❌ (Railway 自动提供) |

**支持的 API 提供商**：
- OpenAI API
- Google Gemini API
- 任何 OpenAI 兼容的 API

---

## 📁 项目文件结构

### 部署相关文件

```
RedInk/
├── .github/
│   └── workflows/
│       └── sync-upstream.yml      # GitHub Actions 自动同步配置
│
├── frontend/
│   ├── .env.development           # 本地开发环境变量
│   ├── .env.production            # 生产环境变量（Vercel）
│   ├── src/
│   │   ├── api/index.ts           # API 配置（使用环境变量）
│   │   └── vite-env.d.ts          # TypeScript 环境变量类型
│   └── package.json
│
├── backendjs/
│   ├── src/
│   │   └── config/index.ts        # 后端配置（环境变量优先）
│   └── package.json
│
├── docs/
│   ├── QUICK_START.md             # 快速开始指南
│   ├── SYNC_UPSTREAM.md           # Upstream 同步指南
│   ├── ORIGINAL_README.md         # 原项目 README
│   └── deployment/                # 部署文档目录
│       ├── RAILWAY_FIX.md         # Railway 部署修复
│       ├── VERCEL_SETUP_GUIDE.md  # Vercel 配置指南
│       └── ...                    # 其他部署文档
│
├── package.json                   # 根目录 package.json（Railway 自动检测）
├── railway.json                   # Railway 配置
├── vercel.json                    # Vercel 配置
├── .railwayignore                 # Railway 忽略文件
├── .vercelignore                  # Vercel 忽略文件
└── README.md                      # 项目主文档
```

### 配置文件详解

#### `vercel.json` - Vercel 配置

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### `railway.json` - Railway 配置

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### `package.json` (根目录) - Railway 自动检测

```json
{
  "name": "redink-root",
  "scripts": {
    "install": "cd backendjs && npm install",
    "build": "cd backendjs && npm run build",
    "start": "cd backendjs && npm start"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 🚀 部署流程

### 1. 前端部署 (Vercel)

**构建命令**:
```bash
cd frontend && npm install && npm run build
```

**输出目录**:
```
frontend/dist
```

**环境变量**:
- `VITE_API_BASE_URL` → Railway 后端地址

### 2. 后端部署 (Railway)

**自动检测流程**:
1. 检测到根目录 `package.json`
2. 运行 `npm install` → 触发 `cd backendjs && npm install`
3. 运行 `npm run build` → 触发 `cd backendjs && npm run build`
4. 运行 `npm start` → 触发 `cd backendjs && npm start`

**环境变量**:
- `TEXT_API_KEY`, `TEXT_BASE_URL`
- `IMAGE_API_KEY`, `IMAGE_BASE_URL`
- `PORT` (可选)

---

## 🔄 CORS 配置

后端已配置 CORS，允许来自 Vercel 的跨域请求。

**后端 CORS 设置** (`backendjs/src/index.ts`):
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',           // 本地开发
    'https://*.vercel.app',            // Vercel 部署
    'https://your-domain.com'          // 自定义域名
  ],
  credentials: true
}));
```

---

## 🔍 故障排查

### 前端无法连接后端

**检查清单**：
- [ ] Vercel 环境变量 `VITE_API_BASE_URL` 正确
- [ ] Railway 后端正常运行 (访问 `/api/health`)
- [ ] Vercel 重新部署以应用环境变量
- [ ] 浏览器控制台无 CORS 错误

### Railway 部署失败

**检查清单**：
- [ ] 根目录有 `package.json`
- [ ] `railway.json` 配置正确
- [ ] 没有 `Dockerfile` (已重命名为 `Dockerfile.python-backend`)
- [ ] `.railwayignore` 排除了 Python 文件

### API 调用错误

**检查清单**：
- [ ] Railway 环境变量中 API Key 正确
- [ ] `TEXT_BASE_URL` 和 `IMAGE_BASE_URL` 可访问
- [ ] API 配额未超限
- [ ] 后端日志无错误信息

---

## 📚 相关文档

- [README.md](../README.md) - 项目主文档
- [QUICK_START.md](./QUICK_START.md) - 快速开始指南
- [SYNC_UPSTREAM.md](./SYNC_UPSTREAM.md) - Upstream 同步
- [deployment/](./deployment/) - 详细部署文档

---

## ✅ 部署检查清单

部署完成后，依次验证：

- [ ] Vercel 前端可以访问
- [ ] Railway 后端 `/api/health` 正常
- [ ] 前端可以调用后端 API
- [ ] 生成大纲功能正常
- [ ] 生成图片功能正常
- [ ] 历史记录功能正常
- [ ] 图片下载功能正常

---

**最后更新**: 2025-11-29
**文档版本**: 1.0
