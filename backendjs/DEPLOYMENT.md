# 红墨 Node.js 后端 - 完整部署指导

本文档提供红墨 Node.js 后端服务的完整部署指南，包括本地开发、Docker 容器化部署和 Vercel 云平台部署。

---

## 📑 目录

- [环境要求](#环境要求)
- [本地部署](#本地部署)
- [Docker 部署](#docker-部署)
- [Vercel 云平台部署](#vercel-云平台部署)
- [配置说明](#配置说明)
- [故障排查](#故障排查)
- [性能优化](#性能优化)

---

## 环境要求

### 基础环境

| 组件 | 最低版本 | 推荐版本 | 说明 |
|------|---------|---------|------|
| Node.js | 18.0.0 | 20.x LTS | 必需 |
| npm | 8.0.0 | 10.x | 包管理器 |
| Git | 2.0+ | 最新版 | 版本控制 |

### API 密钥要求

至少需要以下其中一个服务商的 API Key：

- **Google Gemini API Key** (推荐)
  - 获取地址: https://makersuite.google.com/app/apikey
  - 支持文本和图片生成

- **OpenAI API Key**
  - 获取地址: https://platform.openai.com/api-keys
  - 支持 GPT-4 等模型

### 硬件要求

| 环境 | CPU | 内存 | 磁盘 |
|------|-----|------|------|
| 开发环境 | 2 核 | 4 GB | 2 GB |
| 生产环境 | 2 核 | 2 GB | 5 GB |
| 推荐配置 | 4 核 | 4 GB | 10 GB |

---

## 本地部署

### 方式一：标准部署（推荐）

#### 1. 克隆项目

```bash
# 克隆仓库
git clone https://github.com/goldenhawksu/RedInk.git
cd RedInk/backendjs

# 或者如果已有项目，直接进入目录
cd backendjs
```

#### 2. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm (更快)
pnpm install
```

**预期输出**:
```
added 459 packages in 15s
```

#### 3. 配置环境变量

创建 `.env` 文件：

```bash
# 复制示例文件
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 服务器配置
PORT=12399
NODE_ENV=development

# 日志配置
LOG_LEVEL=debug

# CORS 配置（可选）
# CORS_ORIGIN=http://localhost:5173
```

#### 4. 配置 API 服务商

在**项目根目录**（`RedInk/`，不是 `backendjs/`）创建配置文件：

**`text_providers.yaml`** - 文本生成配置:

```yaml
# 当前激活的服务商
active_provider: gemini

# 服务商配置
providers:
  # Google Gemini（推荐）
  gemini:
    type: google_gemini
    api_key: "AIza************************************"  # 填写你的 API Key
    model: gemini-2.5-flash
    temperature: 1.0
    max_output_tokens: 8000

  # OpenAI 兼容接口
  openai:
    type: openai_compatible
    api_key: "sk-****************************************"
    base_url: "https://api.openai.com/v1"
    model: gpt-4o
    temperature: 1.0
    max_output_tokens: 8000

  # 第三方 OpenAI 兼容接口
  third_party:
    type: openai_compatible
    api_key: "your-api-key"
    base_url: "https://your-api-endpoint.com/v1"
    model: gpt-4
    temperature: 1.0
    max_output_tokens: 8000
```

**`image_providers.yaml`** - 图片生成配置:

```yaml
# 当前激活的服务商
active_provider: gemini

# 服务商配置
providers:
  # Google Gemini 图片生成
  gemini:
    type: google_genai
    api_key: "AIza************************************"  # 填写你的 API Key
    model: gemini-3-pro-image-preview
    high_concurrency: false

  # Vertex AI
  vertex:
    type: google_genai
    api_key: "your-vertex-api-key"
    model: gemini-3-pro-image-preview
    high_concurrency: true

  # OpenAI DALL-E
  openai_image:
    type: image_api
    api_key: "sk-****************************************"
    base_url: "https://api.openai.com/v1"
    model: dall-e-3
    high_concurrency: false
```

**重要提示**:
- ✅ API Key 必须填写真实有效的密钥
- ✅ 配置文件放在项目根目录 `RedInk/`
- ✅ 已包含在 `.gitignore`，不会被提交到 Git

#### 5. 构建项目

```bash
npm run build
```

**预期输出**:
```
> redink-backendjs@1.0.0 build
> tsc && npm run copy-prompts

> redink-backendjs@1.0.0 copy-prompts
> mkdir -p dist/prompts && cp src/prompts/*.txt dist/prompts/
```

构建产物:
- `dist/` - 编译后的 JavaScript 文件
- `dist/prompts/` - 提示词模板文件

#### 6. 启动服务

**开发模式**（推荐用于开发）:
```bash
npm run dev
```

特点:
- ✅ 自动热重载
- ✅ 详细日志输出
- ✅ 支持 TypeScript 直接运行

**生产模式**:
```bash
npm start
```

特点:
- ✅ 性能优化
- ✅ 稳定运行
- ✅ 较少日志输出

**预期输出**:
```
15:47:43 | INFO  | 🚀 红墨 Node.js 后端服务启动成功！
15:47:43 | INFO  | 📍 监听地址: http://0.0.0.0:12399
15:47:43 | INFO  | 📋 API 文档: http://0.0.0.0:12399/api/health
```

#### 7. 验证部署

在浏览器或使用 curl 测试：

```bash
# 健康检查
curl http://localhost:12399/api/health

# 预期响应
{
  "success": true,
  "message": "服务正常运行"
}
```

---

### 方式二：快速开发模式

如果只是快速测试，无需构建：

```bash
# 1. 安装依赖
npm install

# 2. 配置 API Key（同上）

# 3. 直接启动开发服务器
npm run dev
```

---

## Docker 部署

### 1. 创建 Dockerfile

在 `backendjs/` 目录创建 `Dockerfile`:

```dockerfile
# 使用官方 Node.js 镜像
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产环境镜像
FROM node:20-alpine

WORKDIR /app

# 复制依赖和构建产物
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# 暴露端口
EXPOSE 12399

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=12399

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:12399/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/index.js"]
```

### 2. 创建 .dockerignore

在 `backendjs/` 目录创建 `.dockerignore`:

```
node_modules
dist
npm-debug.log
.env
.env.local
*.log
.git
.gitignore
README.md
test
docs
```

### 3. 构建 Docker 镜像

```bash
# 在 backendjs 目录执行
docker build -t redink-backend:latest .

# 构建时指定平台（如果需要）
docker build --platform linux/amd64 -t redink-backend:latest .
```

### 4. 运行 Docker 容器

**方式一：直接运行**

```bash
docker run -d \
  --name redink-backend \
  -p 12399:12399 \
  -v $(pwd)/../text_providers.yaml:/app/text_providers.yaml \
  -v $(pwd)/../image_providers.yaml:/app/image_providers.yaml \
  -e NODE_ENV=production \
  -e LOG_LEVEL=info \
  --restart unless-stopped \
  redink-backend:latest
```

**方式二：使用 Docker Compose（推荐）**

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: .
    container_name: redink-backend
    ports:
      - "12399:12399"
    environment:
      - NODE_ENV=production
      - PORT=12399
      - LOG_LEVEL=info
    volumes:
      # 挂载配置文件
      - ../text_providers.yaml:/app/text_providers.yaml:ro
      - ../image_providers.yaml:/app/image_providers.yaml:ro
      # 持久化日志（可选）
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:12399/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

启动服务：

```bash
# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down

# 重启
docker-compose restart
```

### 5. 验证 Docker 部署

```bash
# 查看容器状态
docker ps

# 查看日志
docker logs redink-backend

# 测试 API
curl http://localhost:12399/api/health
```

---

## Vercel 云平台部署

### 部署方式一：通过 GitHub（推荐）

#### 1. 准备 Git 仓库

```bash
# 初始化 Git（如果还没有）
git init

# 添加文件
git add .
git commit -m "feat: 添加 Node.js 后端实现"

# 推送到 GitHub
git remote add origin https://github.com/your-username/RedInk.git
git push -u origin main
```

#### 2. 在 Vercel 创建项目

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Add New..." → "Project"
3. 选择 "Import Git Repository"
4. 授权并选择你的 RedInk 仓库

#### 3. 配置构建设置

在 Vercel 项目设置页面：

**Framework Preset**: Other

**Root Directory**: `backendjs`

**Build Command**:
```bash
npm run build
```

**Output Directory**: `dist`

**Install Command**:
```bash
npm install
```

#### 4. 配置环境变量

在 Vercel 项目 Settings → Environment Variables 添加：

| 变量名 | 值 | 环境 |
|--------|---|------|
| `NODE_ENV` | `production` | All |
| `PORT` | `12399` | All |
| `LOG_LEVEL` | `info` | Production |
| `LOG_LEVEL` | `debug` | Development |

**配置 API Keys（重要）**:

有两种方式配置 API Keys：

**方式 A：使用环境变量（推荐）**

在 Vercel 添加环境变量：

| 变量名 | 值 | 说明 |
|--------|---|------|
| `GEMINI_API_KEY` | `AIza...` | Gemini API Key |
| `OPENAI_API_KEY` | `sk-...` | OpenAI API Key |

然后修改代码读取环境变量（需要更新 `src/config/index.ts`）。

**方式 B：上传配置文件**

将配置文件提交到私有仓库：

```bash
# 临时从 .gitignore 移除配置文件
# 编辑 .gitignore，注释掉这两行：
# /image_providers.yaml
# /text_providers.yaml

# 提交配置文件
git add text_providers.yaml image_providers.yaml
git commit -m "chore: 添加生产环境配置"
git push

# 记得之后恢复 .gitignore！
```

**⚠️ 安全提示**: 方式 B 会将 API Key 提交到 Git，仅适用于私有仓库！

#### 5. 部署

点击 "Deploy" 按钮，Vercel 将自动：

1. 克隆代码
2. 安装依赖
3. 构建项目
4. 部署到全球 CDN

**部署时间**: 约 1-2 分钟

#### 6. 验证部署

部署完成后，Vercel 会提供一个 URL，例如：
```
https://redink-backend-xxx.vercel.app
```

测试 API：
```bash
curl https://redink-backend-xxx.vercel.app/api/health
```

#### 7. 自定义域名（可选）

在 Vercel 项目 Settings → Domains：

1. 添加自定义域名: `api.yourdomain.com`
2. 配置 DNS 记录（Vercel 会提供指导）
3. 等待 SSL 证书自动生成

---

### 部署方式二：通过 CLI

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 配置项目

在 `backendjs/` 目录创建 `vercel.json`:

```json
{
  "version": 2,
  "name": "redink-backend",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "dist/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "PORT": "12399"
  }
}
```

#### 4. 部署

```bash
# 进入项目目录
cd backendjs

# 预览部署（测试环境）
vercel

# 生产部署
vercel --prod
```

#### 5. 配置环境变量

```bash
# 添加环境变量
vercel env add GEMINI_API_KEY production
# 输入 API Key 值

vercel env add LOG_LEVEL production
# 输入 info
```

---

## 配置说明

### 环境变量完整列表

| 变量名 | 默认值 | 说明 | 必需 |
|--------|--------|------|------|
| `PORT` | `12399` | 服务器端口 | 否 |
| `NODE_ENV` | `development` | 运行环境 | 否 |
| `LOG_LEVEL` | `debug` | 日志级别 | 否 |
| `CORS_ORIGIN` | `*` | 允许的跨域来源 | 否 |

### 日志级别说明

| 级别 | 说明 | 适用场景 |
|------|------|---------|
| `debug` | 详细调试信息 | 开发环境 |
| `info` | 常规信息 | 生产环境 |
| `warn` | 警告信息 | 生产环境 |
| `error` | 错误信息 | 问题诊断 |

### YAML 配置文件说明

#### 文本生成配置 (`text_providers.yaml`)

```yaml
active_provider: gemini  # 当前使用的服务商

providers:
  gemini:
    type: google_gemini           # 服务商类型
    api_key: "your-key"           # API 密钥
    model: gemini-2.5-flash       # 模型名称
    temperature: 1.0              # 随机性 (0-2)
    max_output_tokens: 8000       # 最大输出 tokens
```

**支持的服务商类型**:
- `google_gemini` - Google Gemini 原生接口
- `openai_compatible` - OpenAI 兼容接口

#### 图片生成配置 (`image_providers.yaml`)

```yaml
active_provider: gemini  # 当前使用的服务商

providers:
  gemini:
    type: google_genai                    # 服务商类型
    api_key: "your-key"                   # API 密钥
    model: gemini-3-pro-image-preview    # 模型名称
    high_concurrency: false               # 高并发模式
```

**支持的服务商类型**:
- `google_genai` - Google Gemini 图片生成
- `image_api` - 通用图片 API
- `openai_compatible` - OpenAI 兼容接口

---

## 故障排查

### 常见问题

#### 1. 端口被占用

**错误信息**:
```
Error: listen EADDRINUSE: address already in use 0.0.0.0:12399
```

**解决方案**:

**Windows**:
```bash
# 查找占用端口的进程
netstat -ano | findstr :12399

# 强制结束进程（替换 PID）
taskkill /F /PID <PID>
```

**Linux/macOS**:
```bash
# 查找占用端口的进程
lsof -i :12399

# 结束进程
kill -9 <PID>
```

**或者修改端口**:
```bash
# 修改 .env 文件
PORT=13399
```

---

#### 2. SDK 导入错误

**错误信息**:
```
GoogleGenerativeAI is not a constructor
```

**解决方案**:

```bash
# 1. 检查 package.json
cat package.json | grep generative-ai
# 应该显示: "@google/generative-ai": "^0.21.0"

# 2. 如果包名错误，重新安装
npm uninstall @google/genai
npm install @google/generative-ai@^0.21.0

# 3. 重新构建
npm run build
```

---

#### 3. 配置文件找不到

**错误信息**:
```
ENOENT: no such file or directory, open '../text_providers.yaml'
```

**解决方案**:

```bash
# 1. 检查配置文件位置（应该在项目根目录）
ls -la ../text_providers.yaml
ls -la ../image_providers.yaml

# 2. 如果不存在，创建配置文件
cp ../text_providers.yaml.example ../text_providers.yaml
cp ../image_providers.yaml.example ../image_providers.yaml

# 3. 编辑并填写 API Key
vim ../text_providers.yaml
```

---

#### 4. prompts 文件缺失

**错误信息**:
```
ENOENT: no such file or directory, open 'dist/prompts/outline_prompt.txt'
```

**解决方案**:

```bash
# 1. 检查 package.json 中的 build 脚本
cat package.json | grep build
# 应该包含: "build": "tsc && npm run copy-prompts"

# 2. 重新构建
npm run build

# 3. 验证文件已复制
ls -la dist/prompts/
```

---

#### 5. API Key 无效

**错误信息**:
```
API 调用失败: Invalid authentication credentials
```

**解决方案**:

```bash
# 1. 验证 API Key 格式
# Gemini API Key 格式: AIza...（39 个字符）
# OpenAI API Key 格式: sk-...（51 个字符）

# 2. 测试 API Key
curl https://generativelanguage.googleapis.com/v1/models?key=YOUR_API_KEY

# 3. 重新生成 API Key
# Gemini: https://makersuite.google.com/app/apikey
# OpenAI: https://platform.openai.com/api-keys
```

---

#### 6. 内存不足

**错误信息**:
```
JavaScript heap out of memory
```

**解决方案**:

```bash
# 增加 Node.js 内存限制
node --max-old-space-size=4096 dist/index.js

# 或修改 package.json
{
  "scripts": {
    "start": "node --max-old-space-size=4096 dist/index.js"
  }
}
```

---

### 日志调试

#### 启用详细日志

```bash
# 方式一：环境变量
LOG_LEVEL=debug npm start

# 方式二：修改 .env
echo "LOG_LEVEL=debug" >> .env
npm start
```

#### 查看日志

```bash
# Docker 容器日志
docker logs -f redink-backend

# Docker Compose 日志
docker-compose logs -f backend

# PM2 日志（如果使用）
pm2 logs redink-backend
```

---

## 性能优化

### 1. 启用生产模式

```bash
NODE_ENV=production npm start
```

优化效果:
- ✅ 禁用调试信息
- ✅ 启用代码压缩
- ✅ 优化内存使用

### 2. 使用 PM2 进程管理

安装 PM2:
```bash
npm install -g pm2
```

创建 `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'redink-backend',
    script: './dist/index.js',
    instances: 2,              // 进程数（建议 CPU 核心数）
    exec_mode: 'cluster',       // 集群模式
    env: {
      NODE_ENV: 'production',
      PORT: 12399
    },
    max_memory_restart: '500M', // 内存限制
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
```

启动服务:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # 开机自启
```

### 3. 配置 Nginx 反向代理

安装 Nginx:
```bash
# Ubuntu/Debian
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

配置文件 `/etc/nginx/sites-available/redink`:
```nginx
upstream redink_backend {
    # 负载均衡
    server 127.0.0.1:12399;
    server 127.0.0.1:12400;
    keepalive 64;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain application/json;
    gzip_min_length 1000;

    # 代理配置
    location /api/ {
        proxy_pass http://redink_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        proxy_pass http://redink_backend/api/health;
        access_log off;
    }
}
```

启用配置:
```bash
sudo ln -s /etc/nginx/sites-available/redink /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. 配置 Redis 缓存（可选）

安装 Redis:
```bash
# Ubuntu/Debian
sudo apt install redis-server

# CentOS/RHEL
sudo yum install redis
```

在代码中集成 Redis（需要修改源码）:
```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379
});

// 缓存配置
app.get('/api/config', async (req, res) => {
  const cached = await redis.get('config');
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const config = await loadConfig();
  await redis.setex('config', 300, JSON.stringify(config)); // 缓存 5 分钟
  res.json(config);
});
```

---

## 监控和日志

### 1. 使用 PM2 监控

```bash
# 实时监控
pm2 monit

# Web 界面
pm2 web

# 查看指标
pm2 show redink-backend
```

### 2. 集成 Prometheus（可选）

安装依赖:
```bash
npm install prom-client
```

添加指标导出（需要修改 `src/index.ts`）:
```typescript
import promClient from 'prom-client';

// 创建注册表
const register = new promClient.Registry();

// 添加默认指标
promClient.collectDefaultMetrics({ register });

// 自定义指标
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// 指标导出端点
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### 3. 日志聚合（使用 Winston）

已内置 Winston 日志系统，配置文件级别即可：

```env
# 开发环境
LOG_LEVEL=debug

# 生产环境
LOG_LEVEL=info
```

---

## 安全建议

### 1. API Key 安全

- ✅ **永远不要**将 API Key 提交到 Git
- ✅ 使用环境变量或配置管理服务
- ✅ 定期轮换 API Key
- ✅ 限制 API Key 的权限范围

### 2. HTTPS 配置

- ✅ 使用 Let's Encrypt 免费 SSL 证书
- ✅ 强制 HTTPS 重定向
- ✅ 启用 HSTS

### 3. 访问控制

- ✅ 配置 CORS 白名单
- ✅ 实施 Rate Limiting
- ✅ 添加 API 认证（如需要）

### 4. 更新维护

```bash
# 定期更新依赖
npm update

# 检查安全漏洞
npm audit

# 修复安全问题
npm audit fix
```

---

## 总结

### 快速参考

**本地开发**:
```bash
npm install && npm run dev
```

**生产部署**:
```bash
npm install && npm run build && npm start
```

**Docker 部署**:
```bash
docker-compose up -d
```

**Vercel 部署**:
```bash
vercel --prod
```

### 推荐配置

| 场景 | 推荐方案 | 说明 |
|------|---------|------|
| 个人开发 | 本地部署 | 简单快速 |
| 小型项目 | Vercel | 免费额度，自动扩展 |
| 中型项目 | Docker + VPS | 灵活可控 |
| 大型项目 | K8s + 微服务 | 高可用，可扩展 |

---

## 获取帮助

- **项目文档**: [README.md](README.md)
- **API 文档**: 访问 `/api/health` 查看服务状态
- **问题反馈**: [GitHub Issues](https://github.com/goldenhawksu/RedInk/issues)
- **测试报告**: [backendjs-final-test-report.md](../docs/backendjs-final-test-report.md)

---

**部署完成后，记得测试所有 API 端点以确保功能正常！** 🎉
