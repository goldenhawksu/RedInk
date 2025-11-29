# Railway Python 后端部署指南

本文档详细说明如何在 Railway 上部署 RedInk 的 Python 后端。

---

## 📋 部署架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户访问                           │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
   ┌───────▼─────────┐          ┌─────────▼─────────┐
   │   Vercel        │          │   Railway         │
   │   (前端)        │          │   (Python后端)    │
   │                 │          │                   │
   │  • Vue 3        │◄─────────┤  • Python 3.11    │
   │  • Vite         │   CORS   │  • Flask          │
   │  • TypeScript   │          │  • Docker         │
   │  • 静态托管     │          │  • Google AI SDK  │
   └─────────────────┘          └───────────────────┘
          ↓                              ↓
   https://your-app            https://your-app
   .vercel.app                 .railway.app/api
```

---

## 🚀 快速部署流程

### 1️⃣ 准备工作

**检查项目文件：**
- ✅ `Dockerfile` 存在于根目录
- ✅ `railway.json` 配置正确
- ✅ `.railwayignore` 排除 Node.js 后端
- ✅ `backend/` 目录包含 Python 代码
- ✅ `pyproject.toml` 和 `uv.lock` 存在

### 2️⃣ Railway 部署步骤

#### A. 创建新项目

1. 访问 [Railway.app](https://railway.app/)
2. 点击 **"New Project"**
3. 选择 **"Deploy from GitHub repo"**
4. 授权并选择你的 RedInk fork 仓库
5. 选择 **main** 分支

#### B. 配置环境变量

在 Railway 项目设置中添加以下环境变量：

| 变量名 | 说明 | 示例值 | 必填 |
|--------|------|--------|------|
| `TEXT_API_KEY` | 文本生成 API Key | `sk-xxxxxxxxxxxxx` | ✅ |
| `TEXT_BASE_URL` | 文本生成 API 地址 | `https://api.openai.com/v1` | ✅ |
| `IMAGE_API_KEY` | 图片生成 API Key | `sk-xxxxxxxxxxxxx` | ✅ |
| `IMAGE_BASE_URL` | 图片生成 API 地址 | `https://api.openai.com/v1` | ✅ |
| `FLASK_PORT` | Flask 端口 | `12398` | ❌ (默认) |
| `FLASK_HOST` | Flask 监听地址 | `0.0.0.0` | ❌ (默认) |

**配置方法：**
```
Railway Dashboard → 你的项目 → Variables → New Variable
```

**支持的 API 提供商：**
- OpenAI API
- Google Gemini API (`https://generativelanguage.googleapis.com/v1beta`)
- 任何 OpenAI 兼容的 API

#### C. 生成公开域名

1. 进入 Railway 项目 → **Settings**
2. 找到 **Networking** 部分
3. 点击 **Generate Domain**
4. 记录生成的域名，例如：`https://redink-backend.up.railway.app`

#### D. 触发部署

Railway 会自动检测到 `Dockerfile` 并开始构建：

1. **构建阶段1**: 构建前端 (Node.js 22 + pnpm)
2. **构建阶段2**: 安装 Python 依赖 (uv)
3. **部署**: 启动 Flask 服务器

**预计时间**: 5-10 分钟

### 3️⃣ 配置 Vercel 前端

#### A. 设置环境变量

在 Vercel 项目设置中配置：

```
Vercel Dashboard → 你的项目 → Settings → Environment Variables
```

添加变量：
```
变量名: VITE_API_BASE_URL
值: https://redink-backend.up.railway.app/api
环境: Production, Preview
```

**⚠️ 重要**: 必须包含 `/api` 后缀!

#### B. 重新部署前端

修改环境变量后，必须重新部署：

```
Vercel Dashboard → Deployments → ... → Redeploy
```

或者推送新的提交触发自动部署。

---

## 🔍 部署验证

### 1. 验证后端健康检查

访问后端健康检查端点：
```bash
https://your-railway-app.railway.app/api/health
```

**预期响应**:
```json
{
  "status": "healthy",
  "message": "红墨 AI图文生成器 API",
  "version": "0.1.0"
}
```

### 2. 验证前端连接

1. 访问 Vercel 前端 URL
2. 输入测试主题
3. 检查是否成功生成大纲
4. 检查是否成功生成图片

### 3. 检查 Railway 日志

```
Railway Dashboard → 你的项目 → Deployments → View Logs
```

**正常日志应包含**:
```
🚀 红墨 AI图文生成器启动成功！
📍 监听地址: http://0.0.0.0:12398
✅ 文本生成配置: 激活=openai, 可用服务商=['openai', 'gemini']
✅ 图片生成配置: 激活=openai, 可用服务商=['openai', 'flux']
```

---

## 🔄 自动同步 Upstream

当上游仓库 (HisMax/RedInk) 更新后，你的 fork 会自动同步并重新部署。

### 自动同步设置

已配置 GitHub Actions 自动同步:

**文件**: `.github/workflows/sync-upstream.yml`

**触发时机**:
- 每周日 00:00 UTC (北京时间周日 08:00)
- 手动触发

**自动流程**:
1. GitHub Actions 检测上游更新
2. 自动合并到你的 main 分支
3. Railway 检测到新提交
4. 自动重新构建和部署

### 手动同步方法

如需立即同步，访问：
```
GitHub → 你的仓库 → Actions → Sync Upstream → Run workflow
```

或者使用命令行：
```bash
git remote add upstream https://github.com/HisMax/RedInk.git
git fetch upstream
git merge upstream/main
git push origin main
```

---

## ❌ 常见问题排查

### 问题 1: Railway 构建失败 - "Dockerfile not found"

**原因**: `railway.json` 配置错误或 Dockerfile 不存在

**解决**:
```bash
# 检查文件是否存在
ls -la Dockerfile
ls -la railway.json

# 确认 railway.json 内容
cat railway.json
```

**正确的 `railway.json`**:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 问题 2: 前端无法连接后端 - "Network error"

**检查清单**:
- [ ] Vercel 环境变量 `VITE_API_BASE_URL` 正确配置
- [ ] 变量值包含 `/api` 后缀
- [ ] Vercel 已重新部署
- [ ] Railway 后端正常运行 (访问 `/api/health`)
- [ ] 浏览器控制台无 CORS 错误

**解决**:
```bash
# 1. 检查 Vercel 环境变量
Vercel Dashboard → Settings → Environment Variables

# 2. 确认变量值格式
正确: https://redink-backend.up.railway.app/api
错误: https://redink-backend.up.railway.app (缺少 /api)
错误: https://redink-backend.up.railway.app/api/ (多余斜杠)

# 3. 重新部署 Vercel
Vercel Dashboard → Deployments → Redeploy
```

### 问题 3: Railway 部署成功但 API 调用失败

**原因**: 环境变量中的 API Key 未配置或错误

**检查 Railway 日志**:
```
Railway Dashboard → Deployments → View Logs
```

**查找警告**:
```
⚠️  文本服务商 [openai] 未配置 API Key
⚠️  图片服务商 [openai] 未配置 API Key
```

**解决**:
```bash
# 在 Railway 添加环境变量
TEXT_API_KEY=sk-your-actual-openai-key
TEXT_BASE_URL=https://api.openai.com/v1
IMAGE_API_KEY=sk-your-actual-openai-key
IMAGE_BASE_URL=https://api.openai.com/v1

# 保存后 Railway 会自动重启服务
```

### 问题 4: 图片生成失败 - "生成返回 null"

**原因**: 图片生成 API 配置错误或配额不足

**检查步骤**:

1. **检查 Railway 环境变量**:
   ```
   IMAGE_API_KEY - 是否配置
   IMAGE_BASE_URL - 是否正确
   ```

2. **检查 API 配额**:
   - 访问 OpenAI Dashboard 查看配额
   - 查看 Railway 日志中的错误信息

3. **检查日志**:
   ```
   Railway Logs → 搜索 "图片生成"
   ```

**解决**:
```bash
# 1. 验证 API Key 可用性
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $IMAGE_API_KEY"

# 2. 更新 Railway 环境变量
# 3. 重启服务 (Railway 自动重启)
```

### 问题 5: Upstream 同步后部署失败

**原因**: 上游代码变更可能引入依赖变化

**解决步骤**:

1. **检查 Railway 构建日志**:
   ```
   Railway Dashboard → Deployments → Failed Deployment → Logs
   ```

2. **检查依赖文件变更**:
   ```bash
   git diff upstream/main -- pyproject.toml
   git diff upstream/main -- Dockerfile
   ```

3. **本地测试构建**:
   ```bash
   docker build -t redink-test .
   docker run -p 12398:12398 redink-test
   ```

4. **修复问题后重新推送**:
   ```bash
   git add .
   git commit -m "fix: 修复依赖问题"
   git push origin main
   ```

---

## 📊 资源使用情况

### Railway 免费层限制

- ✅ **CPU**: 共享 vCPU
- ✅ **内存**: 512 MB
- ✅ **执行时间**: 每月 500 小时
- ✅ **带宽**: 100 GB/月
- ⚠️ **构建时间**: 有限制，但对本项目足够

### 预计资源消耗

| 操作 | CPU | 内存 | 时间 |
|------|-----|------|------|
| 启动 | 低 | ~200MB | 3-5秒 |
| 大纲生成 | 中 | ~250MB | 3-10秒 |
| 图片生成 | 中 | ~300MB | 15-30秒 |

**建议**:
- 低流量应用可以使用免费层
- 高流量应用建议升级到付费计划

---

## 🔒 安全最佳实践

### 1. API Key 管理

- ✅ **仅在 Railway 环境变量中配置** API Key
- ✅ **不要** 将 API Key 提交到 Git
- ✅ **定期轮换** API Key
- ✅ **使用不同的** API Key 用于开发和生产

### 2. CORS 配置

后端已预配置 CORS 白名单:
```python
# backend/app.py
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",           # 本地开发
            "https://*.vercel.app",            # Vercel 部署
            "https://your-domain.com"          # 自定义域名
        ]
    }
})
```

**添加自定义域名**:
需要修改 `backend/app.py` 并重新部署。

### 3. 环境变量验证

Railway 启动时会自动验证配置:
```
✅ 文本生成配置: 激活=openai, 可用服务商=['openai']
✅ 文本服务商 [openai] API Key 已配置
✅ 图片生成配置: 激活=openai, 可用服务商=['openai']
✅ 图片服务商 [openai] API Key 已配置
```

---

## 📝 环境变量完整参考

### Railway 后端环境变量

| 变量名 | 默认值 | 说明 | 示例 |
|--------|--------|------|------|
| `TEXT_API_KEY` | - | 文本生成 API Key (必填) | `sk-proj-xxxxx` |
| `TEXT_BASE_URL` | `https://api.openai.com/v1` | 文本生成 API 地址 | `https://api.openai.com/v1` |
| `IMAGE_API_KEY` | - | 图片生成 API Key (必填) | `sk-proj-xxxxx` |
| `IMAGE_BASE_URL` | `https://api.openai.com/v1` | 图片生成 API 地址 | `https://api.openai.com/v1` |
| `FLASK_PORT` | `12398` | Flask 服务器端口 | `12398` |
| `FLASK_HOST` | `0.0.0.0` | Flask 监听地址 | `0.0.0.0` |
| `FLASK_DEBUG` | `False` | 是否启用调试模式 | `False` |

### Vercel 前端环境变量

| 变量名 | 环境 | 说明 | 示例 |
|--------|------|------|------|
| `VITE_API_BASE_URL` | Production, Preview | Railway 后端 API 地址 | `https://redink-backend.up.railway.app/api` |

---

## 🎯 部署检查清单

完成部署后，依次验证：

### Railway 后端检查

- [ ] Railway 部署成功，状态为 "Active"
- [ ] 访问 `/api/health` 返回正常
- [ ] 环境变量已全部配置
- [ ] 日志显示服务启动成功
- [ ] 域名已生成并可访问

### Vercel 前端检查

- [ ] Vercel 部署成功
- [ ] 环境变量 `VITE_API_BASE_URL` 已配置
- [ ] 前端页面可以正常访问
- [ ] 浏览器控制台无错误

### 功能测试

- [ ] ✅ 生成大纲功能正常
- [ ] ✅ 生成图片功能正常
- [ ] ✅ 图片下载功能正常
- [ ] ✅ 历史记录功能正常
- [ ] ✅ 配置页面可以访问

### Upstream 同步检查

- [ ] GitHub Actions 工作流已启用
- [ ] 手动触发同步测试成功
- [ ] Railway 自动重新部署成功

---

## 📚 相关文档

- [README.md](../README.md) - 项目主文档
- [QUICK_START.md](./QUICK_START.md) - 5 分钟快速开始
- [SYNC_UPSTREAM.md](./SYNC_UPSTREAM.md) - Upstream 同步指南
- [DEPLOYMENT_CONFIG.md](./DEPLOYMENT_CONFIG.md) - 完整配置参考

---

## 💡 下一步

部署成功后，你可以：

1. **自定义域名**: 在 Railway 和 Vercel 中绑定自定义域名
2. **监控日志**: 定期检查 Railway 日志，监控 API 使用情况
3. **优化配置**: 根据实际使用调整 API 提供商配置
4. **贡献代码**: 向上游仓库提交 Pull Request

---

**最后更新**: 2025-11-29
**文档版本**: 2.0 (Python 后端部署)
