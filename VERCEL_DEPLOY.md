# 🚀 一键部署红墨 - 完整方案

## 📦 部署架构

**推荐部署方案**: 前后端分离部署

- **前端** → Vercel (静态站点,免费)
- **后端** → Railway (Node.js 应用,免费额度充足)

> ⚠️ **重要**: 由于 Vercel 对 Monorepo 的支持有限,我们采用前后端分离部署的方式。

---

## 🎯 前端部署到 Vercel

### 一键部署按钮

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/goldenhawksu/RedInk&project-name=redink-frontend&repository-name=redink)

---

## 📋 前端部署步骤

### 步骤 1: 点击部署按钮
点击上方 "Deploy with Vercel" 按钮

### 步骤 2: 配置项目
1. 授权 GitHub 账号
2. 项目会自动导入

### 步骤 3: Vercel 会自动构建前端
- 无需额外配置
- 等待 2-3 分钟

### 步骤 4: 获取部署 URL
部署成功后,您会获得前端 URL,例如:
```
https://redink-frontend-xxx.vercel.app
```

**重要**: 先记下这个 URL,稍后需要配置后端。

---

## 🚂 后端部署到 Railway

### 一键部署到 Railway

1. **访问 Railway**
   - 打开 https://railway.app
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择 `RedInk` 仓库

3. **Railway 会自动检测配置**
   - 检测到 `railway.json` 配置
   - 自动安装依赖和构建

4. **配置环境变量**

   在 Railway 项目中添加以下变量:

   **必需**:

### 1. 获取 API Key

您需要至少一个以下服务的 API Key：

**Google Gemini** (推荐):
- 获取地址: https://makersuite.google.com/app/apikey
- 用途: 文本生成 + 图片生成

**OpenAI**:
- 获取地址: https://platform.openai.com/api-keys
- 用途: 文本生成

---

## 🎯 部署步骤

### 方式一：通过部署按钮（最简单）

1. **点击上方"Deploy with Vercel"按钮**

2. **授权 GitHub 账号**
   - Vercel 会要求访问您的 GitHub

3. **配置环境变量**

   部署时会要求填写以下环境变量：

   | 环境变量 | 说明 | 示例值 | 必填 |
   |----------|------|--------|------|
   | `TEXT_API_KEY` | 文本生成 API Key | `AIza...` 或 `sk-...` | ✅ 是 |
   | `IMAGE_API_KEY` | 图片生成 API Key | `AIza...` | 可选 |
   | `TEXT_BASE_URL` | 文本 API 基础 URL | `https://api.openai.com/v1` | 可选 |
   | `IMAGE_BASE_URL` | 图片 API 基础 URL | `https://...` | 可选 |

   **推荐配置（使用 Gemini）**:
   ```
   TEXT_API_KEY=AIza************************************
   IMAGE_API_KEY=AIza************************************  (可以与 TEXT_API_KEY 相同)
   ```

4. **点击 Deploy**
   - Vercel 会自动构建并部署
   - 大约需要 2-3 分钟

5. **访问您的应用**
   - 部署成功后会看到部署 URL
   - 例如: `https://redink-xxx.vercel.app`

---

### 方式二：手动部署

#### 步骤 1: Fork 仓库

1. 访问 https://github.com/goldenhawksu/RedInk
2. 点击右上角 "Fork" 按钮

#### 步骤 2: 导入到 Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 选择您 Fork 的仓库
4. 点击 "Import"

#### 步骤 3: 配置环境变量

在 Vercel 项目设置中添加环境变量：

**Settings** → **Environment Variables** → **Add**

| 变量名 | 值 | 环境 |
|--------|---|------|
| `TEXT_API_KEY` | 你的 Gemini API Key | All |
| `IMAGE_API_KEY` | 你的 Gemini API Key | All |
| `NODE_ENV` | `production` | All |

**可选变量**:

| 变量名 | 值 | 说明 |
|--------|---|------|
| `TEXT_BASE_URL` | API 基础 URL | 使用 OpenAI 兼容接口时需要 |
| `TEXT_MODEL` | 模型名称 | 默认: `gemini-2.5-flash` |
| `IMAGE_MODEL` | 模型名称 | 默认: `gemini-3-pro-image-preview` |
| `TEXT_TEMPERATURE` | 温度值 | 默认: `1.0` |
| `TEXT_MAX_TOKENS` | 最大 tokens | 默认: `8000` |

#### 步骤 4: 部署

1. 点击 "Deploy"
2. 等待构建完成
3. 访问生成的 URL

---

## 🔧 高级配置

### 使用 OpenAI API

如果您想使用 OpenAI 而非 Gemini:

```env
TEXT_API_KEY=sk-****************************************
TEXT_BASE_URL=https://api.openai.com/v1
TEXT_MODEL=gpt-4o
```

### 使用第三方 OpenAI 兼容接口

```env
TEXT_API_KEY=your-api-key
TEXT_BASE_URL=https://your-api-endpoint.com/v1
TEXT_MODEL=your-model-name
```

### 同时配置文本和图片

```env
# 文本生成 (OpenAI)
TEXT_API_KEY=sk-****************************************
TEXT_BASE_URL=https://api.openai.com/v1
TEXT_MODEL=gpt-4o

# 图片生成 (Gemini)
IMAGE_API_KEY=AIza************************************
IMAGE_MODEL=gemini-3-pro-image-preview
```

---

## ✅ 验证部署

部署成功后，访问您的应用 URL：

1. **检查前端**: 应该看到红墨的界面
2. **检查后端**: 访问 `https://your-app.vercel.app/api/health`
   - 应该返回: `{"success":true,"message":"服务正常运行"}`

3. **测试功能**:
   - 输入主题
   - 点击"生成大纲"
   - 应该能正常生成内容

---

## 🐛 故障排查

### 问题 1: 部署失败

**检查**:
- 确认已添加 `TEXT_API_KEY` 环境变量
- 检查 API Key 格式是否正确
- 查看 Vercel 部署日志

### 问题 2: API 调用失败

**检查**:
- API Key 是否有效
- API Key 是否有足够的配额
- 检查浏览器控制台错误信息

### 问题 3: 前端无法连接后端

**检查**:
- 确认后端 URL 正确
- 检查 CORS 配置
- 查看网络请求日志

---

## 📚 更多资源

- **完整文档**: [backendjs/README.md](backendjs/README.md)
- **部署指南**: [backendjs/DEPLOYMENT.md](backendjs/DEPLOYMENT.md)
- **快速开始**: [backendjs/QUICKSTART.md](backendjs/QUICKSTART.md)
- **环境变量文档**: [docs/environment-variables.md](docs/environment-variables.md)

---

## 🎉 部署成功

恭喜！您已成功将红墨部署到 Vercel。

**下一步**:
- 配置自定义域名（可选）
- 调整 API 配额限制
- 开始生成精彩内容

---

## 💡 提示

### 节省成本

如果您想节省 API 调用成本：

1. 使用较小的模型:
   ```env
   TEXT_MODEL=gemini-2.5-flash  # 而非 gemini-pro
   ```

2. 降低温度值（更确定的输出）:
   ```env
   TEXT_TEMPERATURE=0.7  # 而非 1.0
   ```

3. 减少最大 tokens:
   ```env
   TEXT_MAX_TOKENS=4000  # 而非 8000
   ```

### 提高性能

1. 启用高并发模式:
   ```env
   IMAGE_HIGH_CONCURRENCY=true
   ```

2. 使用地理位置较近的 API 端点

3. 配置 CDN（Vercel 自动配置）

---

**祝使用愉快！** 🚀
