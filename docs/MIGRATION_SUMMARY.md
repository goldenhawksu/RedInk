# Railway Python 后端部署 - 配置变更总结

本文档总结了从 Node.js 后端切换到 Python 后端的所有配置变更。

---

## 📊 变更概览

| 项目 | 之前 (Node.js) | 现在 (Python) |
|------|---------------|--------------|
| **后端语言** | Node.js/TypeScript | Python 3.11 |
| **后端框架** | Express.js | Flask |
| **构建方式** | Nixpacks | Dockerfile |
| **依赖管理** | npm | uv |
| **图片生成** | ❌ 仅模拟 | ✅ 完整实现 |
| **Upstream 同步** | ✅ 支持 | ✅ 自动同步 |

---

## 📁 文件变更清单

### ✅ 新增文件

- `Dockerfile` - Railway Docker 构建配置 (从 `Dockerfile.python-backend` 重命名)
- `docs/RAILWAY_PYTHON_DEPLOYMENT.md` - Python 后端详细部署指南
- `docs/DEPLOYMENT_CHECKLIST.md` - 完整部署操作清单

### ✏️ 修改文件

- `railway.json` - 构建器从 NIXPACKS 改为 DOCKERFILE
- `.railwayignore` - 排除 Node.js 后端,保留 Python 后端
- `.gitignore` - 保留 docs 目录
- `README.md` - 更新项目架构和部署说明
- `frontend/.env.production` - 保持不变 (已正确配置)

### ❌ 删除文件

- `package.json` (根目录) - Node.js 后端配置
- `package-lock.json` (根目录) - Node.js 依赖锁定

### 🔄 保留文件 (未来可删除)

- `backendjs/` - Node.js 后端目录 (标记为已弃用,可选择性删除)

---

## 🔧 Railway 配置变更

### railway.json

**之前**:
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

**现在**:
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

### .railwayignore

**之前**: 排除 Python 后端,保留 Node.js 后端

**现在**: 排除 Node.js 后端,保留 Python 后端

```
# 忽略 Node.js 后端
backendjs/
package.json
package-lock.json
node_modules/

# 忽略 Deno 后端
deno-backend/

# 忽略前端源码(Dockerfile会处理前端构建)
frontend/node_modules/
frontend/.vite/
frontend/.env.development

# 忽略文档和测试
docs/
test/
*.md

# 忽略其他非必需文件
.spec-workflow/
history/
.git/
.gitignore
.vscode/
.idea/
```

---

## 🌐 环境变量配置

### Railway 后端环境变量

**必填变量** (相同):
- `TEXT_API_KEY`
- `TEXT_BASE_URL`
- `IMAGE_API_KEY`
- `IMAGE_BASE_URL`

**可选变量变更**:

| 变量名 | Node.js 后端 | Python 后端 |
|--------|-------------|------------|
| 端口 | `PORT=3000` | `FLASK_PORT=12398` |
| 监听地址 | `HOST=0.0.0.0` | `FLASK_HOST=0.0.0.0` |
| 调试模式 | - | `FLASK_DEBUG=False` |

### Vercel 前端环境变量

**无变更** ✅

```
VITE_API_BASE_URL=https://redink-backend.up.railway.app/api
```

前端配置保持不变,继续使用相同的 Railway 域名。

---

## 🚀 部署流程变更

### Railway 部署流程

**之前 (Node.js)**:
1. 检测根目录 `package.json`
2. Nixpacks 自动配置 Node.js 环境
3. 运行 `npm install` (触发 `cd backendjs && npm install`)
4. 运行 `npm run build`
5. 运行 `npm start`

**现在 (Python)**:
1. 检测根目录 `Dockerfile`
2. 执行 Docker 多阶段构建:
   - **阶段1**: 使用 Node.js 22 构建前端
   - **阶段2**: 使用 Python 3.11 安装后端依赖
3. 复制前端构建产物到 Python 镜像
4. 启动 Flask 服务器

### Vercel 部署流程

**无变更** ✅

继续使用 `vercel.json` 配置:
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

---

## 🔄 Upstream 同步机制

### 自动同步工作流

**无变更** ✅

GitHub Actions 工作流 (`.github/workflows/sync-upstream.yml`) 保持不变:

- **触发时机**: 每周日 00:00 UTC
- **同步源**: `https://github.com/HisMax/RedInk.git`
- **目标分支**: `main`

### 同步后自动部署

**之前**: Railway 检测到新提交 → 使用 Nixpacks 构建 Node.js 后端

**现在**: Railway 检测到新提交 → 使用 Dockerfile 构建 Python 后端

**优势**:
- ✅ 自动获取上游的 Python 后端功能更新
- ✅ 自动获取上游的图片生成逻辑改进
- ✅ 无需手动维护 Node.js 到 Python 的功能移植

---

## ✅ 功能对比

### 已实现功能

| 功能 | Node.js 后端 | Python 后端 |
|------|-------------|------------|
| 健康检查 | ✅ | ✅ |
| 生成大纲 | ✅ | ✅ |
| 生成图片 | ❌ 仅模拟 | ✅ 完整实现 |
| 获取图片 | ❌ 读取不存在的文件 | ✅ 从 history 目录读取 |
| 配置管理 | ✅ | ✅ |
| 多提供商支持 | ✅ | ✅ |
| 图片压缩 | ❌ | ✅ |
| 缩略图生成 | ❌ | ✅ |
| 历史记录 | ❌ | ✅ |

### Python 后端独有功能

- ✅ **并发图片生成**: 最大并发 15 个
- ✅ **自动重试**: 失败自动重试 3 次
- ✅ **图片压缩**: 自动压缩大图
- ✅ **缩略图**: 自动生成缩略图
- ✅ **Short Prompt**: 支持短 Prompt 模式
- ✅ **多种生成器**: OpenAI、Gemini、Flux 等

---

## 📝 下一步操作

### 立即执行

1. **推送代码到 GitHub**:
   ```bash
   git add .
   git commit -m "feat: 切换到 Python 后端部署"
   git push origin main
   ```

2. **等待 Railway 自动部署**:
   - Railway 会检测到 `Dockerfile` 变更
   - 自动开始构建和部署
   - 预计时间: 5-10 分钟

3. **验证部署**:
   - 访问 `https://your-railway-domain.railway.app/api/health`
   - 访问 Vercel 前端测试完整功能

### 可选操作

1. **删除 Node.js 后端**:
   ```bash
   rm -rf backendjs/
   git add .
   git commit -m "chore: 删除已弃用的 Node.js 后端"
   git push origin main
   ```

2. **更新 README 徽章**:
   - 移除 Node.js 和 TypeScript 徽章
   - 添加 Python 和 Flask 徽章 (已完成)

3. **配置自定义域名**:
   - Railway: Settings → Networking → Custom Domain
   - Vercel: Settings → Domains

---

## 🎯 预期结果

切换到 Python 后端后:

- ✅ **功能完整**: 大纲生成 + 图片生成全部正常工作
- ✅ **自动同步**: 上游更新自动合并并部署
- ✅ **维护简单**: 无需手动移植功能
- ✅ **性能稳定**: 经过原作者充分测试的代码
- ✅ **成本优化**: 避免重复开发和调试

---

## 📚 相关文档

- [RAILWAY_PYTHON_DEPLOYMENT.md](./RAILWAY_PYTHON_DEPLOYMENT.md) - 详细部署指南
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - 部署操作清单
- [SYNC_UPSTREAM.md](./SYNC_UPSTREAM.md) - Upstream 同步指南
- [README.md](../README.md) - 项目主文档

---

**变更完成时间**: 2025-11-29
**文档版本**: 1.0
