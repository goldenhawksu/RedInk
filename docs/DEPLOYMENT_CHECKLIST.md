# RedInk 完整部署操作清单

本文档提供完整的部署操作步骤清单,确保成功部署 Vercel 前端 + Railway Python 后端。

---

## ⚠️ 重要提醒

1. **Backend 版本**: 现在使用 **Python/Flask 后端** (原版),不再使用 Node.js 后端
2. **自动同步**: 配置完成后,上游仓库更新会自动同步并重新部署
3. **图片生成**: Python 后端包含完整的图片生成功能实现

---

## 📋 部署前检查清单

### 准备工作

- [ ] GitHub 账号
- [ ] Vercel 账号 (可用 GitHub 登录)
- [ ] Railway 账号 (可用 GitHub 登录)
- [ ] API Keys (OpenAI / Google Gemini / 其他兼容 API)

### 必需的 API Keys

| API Key | 用途 | 获取地址 |
|---------|------|----------|
| 文本生成 API Key | 生成大纲文本 | [OpenAI](https://platform.openai.com) 或 [Gemini](https://aistudio.google.com) |
| 图片生成 API Key | 生成图片 | [OpenAI](https://platform.openai.com) 或其他兼容服务 |

---

## 🚀 部署步骤

### 第一步: Fork 仓库

1. 访问 https://github.com/HisMax/RedInk (或你的源仓库)
2. 点击右上角 **Fork** 按钮
3. Fork 到你的 GitHub 账号

### 第二步: 部署 Railway 后端 (Python)

#### A. 创建 Railway 项目

1. 访问 https://railway.app
2. 使用 GitHub 账号登录
3. 点击 **"New Project"**
4. 选择 **"Deploy from GitHub repo"**
5. 授权 Railway 访问你的 GitHub
6. 选择你 Fork 的 `RedInk` 仓库
7. 选择 **main** 分支

#### B. 配置环境变量

Railway 会自动开始构建。在构建完成前,先配置环境变量:

1. 进入项目 → **Variables** 标签
2. 点击 **New Variable** 添加以下变量:

**必填变量:**

```
变量名: TEXT_API_KEY
变量值: sk-proj-your-actual-text-api-key-here
```

```
变量名: TEXT_BASE_URL
变量值: https://api.openai.com/v1
```

```
变量名: IMAGE_API_KEY
变量值: sk-proj-your-actual-image-api-key-here
```

```
变量名: IMAGE_BASE_URL
变量值: https://api.openai.com/v1
```

**可选变量 (使用默认值即可):**

```
变量名: FLASK_PORT
变量值: 12398
```

```
变量名: FLASK_HOST
变量值: 0.0.0.0
```

**如果使用 Google Gemini API**:
- `TEXT_BASE_URL`: `https://generativelanguage.googleapis.com/v1beta`
- `IMAGE_BASE_URL`: `https://generativelanguage.googleapis.com/v1beta`

#### C. 生成公开域名

1. 进入项目 → **Settings** 标签
2. 找到 **Networking** 部分
3. 点击 **Generate Domain**
4. **复制生成的域名** (例如: `https://redink-backend-production.up.railway.app`)

   ⚠️ **重要**: 记下这个域名,稍后配置 Vercel 时需要用到!

#### D. 检查部署状态

1. 进入 **Deployments** 标签
2. 等待构建完成 (预计 5-10 分钟)
3. 状态变为 **Active** 表示部署成功

#### E. 验证后端健康

在浏览器访问:
```
https://your-railway-domain.railway.app/api/health
```

**预期响应**:
```json
{
  "status": "healthy",
  "message": "红墨 AI图文生成器 API",
  "version": "0.1.0"
}
```

如果看到这个响应,说明后端部署成功! ✅

---

### 第三步: 部署 Vercel 前端

#### A. 导入项目

1. 访问 https://vercel.com
2. 使用 GitHub 账号登录
3. 点击 **"Add New..."** → **"Project"**
4. 选择你 Fork 的 `RedInk` 仓库
5. 点击 **Import**

#### B. 配置构建设置

Vercel 会自动检测项目,但需要确认以下设置:

**Framework Preset**: `Other` (或留空)

**Build & Development Settings**:
- ✅ **Override** Build Command: 留空 (使用 `vercel.json` 配置)
- ✅ **Override** Output Directory: 留空 (使用 `vercel.json` 配置)

**Root Directory**: `.` (根目录,不要修改)

#### C. 配置环境变量

**关键步骤!** 必须配置环境变量,否则前端无法连接后端。

1. 展开 **Environment Variables** 部分
2. 添加变量:

```
Name: VITE_API_BASE_URL
Value: https://your-railway-domain.railway.app/api
```

**⚠️ 重要检查**:
- ✅ 域名替换为你在第二步C中复制的 Railway 域名
- ✅ 必须包含 `/api` 后缀
- ✅ 不要在末尾添加多余的斜杠 `/`

**示例**:
```
正确: https://redink-backend-production.up.railway.app/api
错误: https://redink-backend-production.up.railway.app (缺少 /api)
错误: https://redink-backend-production.up.railway.app/api/ (多余斜杠)
```

3. **Environment**: 选择 `Production`, `Preview`, `Development` (全选)

#### D. 部署

1. 点击 **Deploy**
2. 等待构建完成 (预计 2-5 分钟)
3. 部署成功后会显示 **Visit** 按钮

#### E. 获取 Vercel 域名

部署成功后,Vercel 会分配一个域名,例如:
```
https://redink-self.vercel.app
```

**复制这个域名**,稍后需要更新 Railway 后端的 CORS 配置。

---

### 第四步: 更新 Railway CORS 配置

为了让 Vercel 前端能够正常调用 Railway 后端,需要将 Vercel 域名添加到 CORS 白名单。

#### 方法 A: 使用环境变量 (推荐)

1. 回到 Railway 项目 → **Variables**
2. 添加新变量:

```
变量名: CORS_ORIGINS
变量值: https://your-vercel-domain.vercel.app,http://localhost:5173
```

**示例**:
```
https://redink-self.vercel.app,http://localhost:5173
```

3. 保存后 Railway 会自动重启服务

#### 方法 B: 修改代码 (如果方法A不生效)

如果后端代码没有读取 `CORS_ORIGINS` 环境变量,需要手动修改代码:

1. 在本地克隆你的 Fork 仓库:
   ```bash
   git clone https://github.com/your-username/RedInk.git
   cd RedInk
   ```

2. 编辑 `backend/app.py`,找到 CORS 配置部分,添加你的 Vercel 域名:
   ```python
   CORS(app, resources={
       r"/api/*": {
           "origins": [
               "http://localhost:5173",           # 本地开发
               "https://your-vercel-app.vercel.app",  # 你的 Vercel 域名
           ]
       }
   })
   ```

3. 提交并推送:
   ```bash
   git add backend/app.py
   git commit -m "feat: 添加 Vercel 域名到 CORS 白名单"
   git push origin main
   ```

4. Railway 会自动检测到推送并重新部署

---

### 第五步: 配置 Upstream 同步 (可选但推荐)

启用 GitHub Actions 自动同步上游仓库更新:

#### A. 启用 GitHub Actions

1. 访问你的 Fork 仓库
2. 进入 **Actions** 标签
3. 如果显示 "Workflows disabled",点击 **"I understand my workflows, go ahead and enable them"**

#### B. 验证工作流

1. 检查是否存在 **Sync Upstream** 工作流
2. 点击工作流名称查看详情
3. 可以手动触发测试:
   - 点击 **Run workflow**
   - 选择 **main** 分支
   - 点击 **Run workflow** 确认

#### C. 自动同步设置

工作流已配置为:
- **自动触发**: 每周日 00:00 UTC (北京时间周日 08:00)
- **手动触发**: 随时可以手动运行

同步后:
1. GitHub Actions 自动合并上游更新到你的 main 分支
2. Railway 检测到新提交,自动重新构建和部署
3. Vercel 也会自动重新部署前端

---

## ✅ 部署验证清单

完成所有步骤后,依次验证以下内容:

### Railway 后端检查

- [ ] Railway 部署状态为 **Active**
- [ ] 访问 `/api/health` 返回正常 JSON 响应
- [ ] 日志中显示 "红墨 AI图文生成器启动成功!"
- [ ] 日志中显示 "✅ 文本服务商 [provider] API Key 已配置"
- [ ] 日志中显示 "✅ 图片服务商 [provider] API Key 已配置"
- [ ] 公开域名可以正常访问

### Vercel 前端检查

- [ ] Vercel 部署状态为 **Ready**
- [ ] 环境变量 `VITE_API_BASE_URL` 已正确配置
- [ ] 前端页面可以正常加载
- [ ] 浏览器控制台无 CORS 错误
- [ ] 浏览器控制台无 404/500 错误

### 功能测试

访问 Vercel 前端 URL,依次测试:

- [ ] ✅ 页面正常加载,无报错
- [ ] ✅ 输入测试主题,点击"生成大纲"
- [ ] ✅ 大纲成功生成,显示多个页面
- [ ] ✅ 点击"生成图片"
- [ ] ✅ 图片逐个生成成功
- [ ] ✅ 可以预览图片
- [ ] ✅ 可以下载图片
- [ ] ✅ 历史记录功能正常

### Upstream 同步检查 (如果已配置)

- [ ] GitHub Actions 工作流已启用
- [ ] 手动触发同步测试成功
- [ ] Railway 自动检测到更新并重新部署
- [ ] Vercel 自动重新部署

---

## ❌ 常见问题处理

### 问题 1: Railway 构建失败

**症状**: 构建日志显示错误,部署失败

**可能原因**:
- Dockerfile 语法错误
- 依赖安装失败
- 内存不足

**解决方法**:
1. 查看 Railway 构建日志 (Deployments → Failed → Logs)
2. 检查错误信息
3. 如果是依赖问题,检查 `pyproject.toml`
4. 如果是内存问题,尝试重新部署

### 问题 2: Vercel 前端无法连接后端

**症状**: 浏览器控制台显示 "Network error" 或 "Failed to fetch"

**排查步骤**:

1. **检查环境变量**:
   ```
   Vercel Dashboard → Settings → Environment Variables
   确认 VITE_API_BASE_URL 正确配置
   ```

2. **检查后端健康**:
   ```
   访问 https://your-railway-domain.railway.app/api/health
   应返回 JSON 响应
   ```

3. **检查 CORS**:
   ```
   浏览器控制台是否显示 CORS 错误?
   如果是,需要更新 Railway 后端的 CORS 配置
   ```

4. **重新部署 Vercel**:
   ```
   修改环境变量后,必须重新部署!
   Vercel Dashboard → Deployments → Latest → ... → Redeploy
   ```

### 问题 3: 大纲生成成功,但图片生成失败

**症状**: 可以生成大纲,但点击"生成图片"后失败

**可能原因**:
- 图片 API Key 未配置或错误
- 图片 API 配额不足
- 图片 API URL 错误

**解决方法**:

1. **检查 Railway 环境变量**:
   ```
   IMAGE_API_KEY - 是否正确?
   IMAGE_BASE_URL - 是否可访问?
   ```

2. **检查 API 配额**:
   ```
   访问 API 提供商控制台查看配额和使用情况
   ```

3. **查看 Railway 日志**:
   ```
   Railway Dashboard → Deployments → Logs
   搜索 "图片生成" 或 "error"
   ```

4. **验证 API Key**:
   ```bash
   # 测试 OpenAI API Key
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $IMAGE_API_KEY"
   ```

### 问题 4: Upstream 同步后部署失败

**症状**: GitHub Actions 同步成功,但 Railway 部署失败

**可能原因**:
- 上游代码变更引入了依赖问题
- Dockerfile 或配置文件冲突

**解决方法**:

1. **查看 Railway 构建日志**
2. **对比上游变更**:
   ```bash
   git diff upstream/main -- pyproject.toml
   git diff upstream/main -- Dockerfile
   ```
3. **本地测试构建**:
   ```bash
   docker build -t redink-test .
   ```
4. **修复问题后推送**:
   ```bash
   git add .
   git commit -m "fix: 修复同步后的构建问题"
   git push origin main
   ```

---

## 📚 参考文档

- **详细部署指南**: [docs/RAILWAY_PYTHON_DEPLOYMENT.md](./RAILWAY_PYTHON_DEPLOYMENT.md)
- **Upstream 同步**: [docs/SYNC_UPSTREAM.md](./SYNC_UPSTREAM.md)
- **项目主文档**: [README.md](../README.md)

---

## 🎯 下一步

部署成功后,你可以:

1. **绑定自定义域名**
   - Vercel: Settings → Domains
   - Railway: Settings → Networking → Custom Domain

2. **监控服务状态**
   - Railway: Deployments → Metrics
   - Vercel: Analytics

3. **优化成本**
   - 监控 API 使用情况
   - 根据需要调整 API 提供商

4. **贡献代码**
   - 向上游仓库提交 Pull Request
   - 分享你的改进和优化

---

**部署愉快!** 🚀

如遇问题,请查看详细文档或提交 Issue。

---

**最后更新**: 2025-11-29
**文档版本**: 1.0
