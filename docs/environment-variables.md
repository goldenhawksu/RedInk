# 环境变量配置文档

本文档详细说明红墨 Node.js 后端支持的所有环境变量配置选项。

---

## 🎯 配置优先级

配置加载顺序（从高到低）：

1. **环境变量** ⭐ 最高优先级
2. **YAML 配置文件**
3. **默认值**

当设置了环境变量时，YAML 配置文件将被忽略。

---

## 📋 环境变量列表

### 基础配置

| 变量名 | 默认值 | 说明 | 示例 |
|--------|--------|------|------|
| `PORT` | `12399` | 服务器端口 | `3000` |
| `NODE_ENV` | `development` | 运行环境 | `production` |
| `HOST` | `0.0.0.0` | 监听地址 | `127.0.0.1` |
| `LOG_LEVEL` | `debug` | 日志级别 | `info` |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | CORS 白名单 | `https://example.com` |

### 文本生成配置

| 变量名 | 必填 | 说明 | 示例 |
|--------|------|------|------|
| `TEXT_API_KEY` | ✅ | 文本生成 API Key | `AIza****` 或 `sk-****` |
| `TEXT_BASE_URL` | ❌ | API 基础 URL（OpenAI 兼容接口需要） | `https://api.openai.com/v1` |
| `TEXT_MODEL` | ❌ | 模型名称 | `gemini-2.5-flash` |
| `TEXT_TEMPERATURE` | ❌ | 温度值 (0-2) | `1.0` |
| `TEXT_MAX_TOKENS` | ❌ | 最大输出 tokens | `8000` |

### 图片生成配置

| 变量名 | 必填 | 说明 | 示例 |
|--------|------|------|------|
| `IMAGE_API_KEY` | ❌ | 图片生成 API Key | `AIza****` |
| `IMAGE_BASE_URL` | ❌ | API 基础 URL（自定义接口需要） | `https://your-api.com/v1` |
| `IMAGE_MODEL` | ❌ | 模型名称 | `gemini-3-pro-image-preview` |
| `IMAGE_HIGH_CONCURRENCY` | ❌ | 是否启用高并发 | `true` 或 `false` |

---

## 🔧 使用场景

### 场景 1: 使用 Google Gemini（推荐）

**特点**: 文本和图片使用同一个 API Key

```env
# 必需
TEXT_API_KEY=AIza************************************

# 可选（如果与文本使用同一个 Key，可省略）
IMAGE_API_KEY=AIza************************************
```

**自动配置**:
- 文本生成: `type=google_gemini`
- 图片生成: `type=google_genai`
- 模型: 使用默认值

---

### 场景 2: 使用 OpenAI

**特点**: 需要提供 base_url

```env
# 文本生成
TEXT_API_KEY=sk-****************************************
TEXT_BASE_URL=https://api.openai.com/v1
TEXT_MODEL=gpt-4o

# 图片生成（如果使用 DALL-E）
IMAGE_API_KEY=sk-****************************************
IMAGE_BASE_URL=https://api.openai.com/v1
IMAGE_MODEL=dall-e-3
```

**自动配置**:
- 文本生成: `type=openai_compatible`
- 图片生成: `type=image_api`

---

### 场景 3: 混合配置

**特点**: 文本和图片使用不同服务

```env
# 文本生成使用 OpenAI
TEXT_API_KEY=sk-****************************************
TEXT_BASE_URL=https://api.openai.com/v1
TEXT_MODEL=gpt-4o

# 图片生成使用 Gemini
IMAGE_API_KEY=AIza************************************
IMAGE_MODEL=gemini-3-pro-image-preview
```

---

### 场景 4: 第三方 OpenAI 兼容接口

**特点**: 使用其他提供商的 OpenAI 兼容 API

```env
TEXT_API_KEY=your-api-key-here
TEXT_BASE_URL=https://your-provider.com/v1
TEXT_MODEL=your-model-name
TEXT_TEMPERATURE=0.8
TEXT_MAX_TOKENS=6000
```

---

## 🚀 Vercel 部署配置

### 通过 Web 界面配置

1. 进入 Vercel 项目设置
2. 导航到 **Settings** → **Environment Variables**
3. 点击 **Add** 添加变量

**推荐配置**（使用 Gemini）:

| 变量名 | 值 | 环境 |
|--------|---|------|
| `TEXT_API_KEY` | `AIza...` | All |
| `IMAGE_API_KEY` | `AIza...` | All |
| `NODE_ENV` | `production` | Production |
| `LOG_LEVEL` | `info` | Production |
| `LOG_LEVEL` | `debug` | Preview, Development |

### 通过 CLI 配置

```bash
# 安装 Vercel CLI
npm install -g vercel

# 添加环境变量
vercel env add TEXT_API_KEY production
# 输入你的 API Key

vercel env add IMAGE_API_KEY production
# 输入你的 API Key

vercel env add NODE_ENV production
# 输入 production
```

---

## 🐳 Docker 部署配置

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backendjs
    ports:
      - "12399:12399"
    environment:
      # 基础配置
      - NODE_ENV=production
      - PORT=12399
      - LOG_LEVEL=info

      # 文本生成（Gemini）
      - TEXT_API_KEY=${TEXT_API_KEY}
      - TEXT_MODEL=gemini-2.5-flash

      # 图片生成（Gemini）
      - IMAGE_API_KEY=${IMAGE_API_KEY}
      - IMAGE_MODEL=gemini-3-pro-image-preview
    restart: unless-stopped
```

### .env 文件

创建 `.env` 文件：

```env
TEXT_API_KEY=AIza************************************
IMAGE_API_KEY=AIza************************************
```

### 启动

```bash
docker-compose up -d
```

---

## 💻 本地开发配置

### 方式 1: .env 文件（推荐）

在 `backendjs/` 目录创建 `.env`:

```env
# 开发环境配置
PORT=12399
NODE_ENV=development
LOG_LEVEL=debug

# API 配置
TEXT_API_KEY=AIza************************************
IMAGE_API_KEY=AIza************************************
```

启动:
```bash
npm run dev
```

### 方式 2: 命令行参数

```bash
TEXT_API_KEY=AIza... IMAGE_API_KEY=AIza... npm run dev
```

### 方式 3: 临时环境变量（Windows）

```cmd
set TEXT_API_KEY=AIza...
set IMAGE_API_KEY=AIza...
npm run dev
```

### 方式 4: 临时环境变量（Linux/Mac）

```bash
export TEXT_API_KEY=AIza...
export IMAGE_API_KEY=AIza...
npm run dev
```

---

## 🔍 配置验证

### 检查当前配置

访问 `/api/config` 端点：

```bash
curl http://localhost:12399/api/config
```

**响应示例**（环境变量配置）:

```json
{
  "success": true,
  "config": {
    "text_generation": {
      "active_provider": "gemini",
      "providers": {
        "gemini": {
          "type": "google_gemini",
          "api_key_masked": "AIza*******************************vejs",
          "model": "gemini-2.5-flash",
          "temperature": 1.0,
          "max_output_tokens": 8000
        }
      }
    },
    "image_generation": {
      "active_provider": "gemini",
      "providers": {
        "gemini": {
          "type": "google_genai",
          "api_key_masked": "AIza*******************************vejs",
          "model": "gemini-3-pro-image-preview"
        }
      }
    }
  }
}
```

**注意**: API Key 已自动脱敏显示

---

## 🛡️ 安全最佳实践

### 1. 永远不要提交 API Key

```bash
# 确保 .env 在 .gitignore 中
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

### 2. 使用环境特定的 Key

- **开发环境**: 使用测试 Key，限制配额
- **生产环境**: 使用生产 Key，充足配额

### 3. 定期轮换 Key

- 每 3-6 个月更换一次 API Key
- 发现泄露立即撤销并更换

### 4. 最小权限原则

- 仅授予必要的 API 权限
- 使用项目级别的 Key，而非账户级别

---

## 🧪 测试配置

### 测试脚本

创建 `test-env-config.js`:

```javascript
const axios = require('axios');

async function testConfig() {
  try {
    const response = await axios.get('http://localhost:12399/api/config');
    console.log('✅ 配置加载成功');
    console.log('文本服务商:', response.data.config.text_generation.active_provider);
    console.log('图片服务商:', response.data.config.image_generation.active_provider);
  } catch (error) {
    console.error('❌ 配置加载失败:', error.message);
  }
}

testConfig();
```

运行:
```bash
node test-env-config.js
```

---

## 📊 配置对比

### 环境变量 vs YAML 文件

| 特性 | 环境变量 | YAML 文件 |
|------|---------|-----------|
| 优先级 | 高 | 低 |
| 适用场景 | 云部署、Docker | 本地开发 |
| 配置方式 | 简单（键值对） | 灵活（多服务商） |
| 安全性 | 高（不提交代码） | 低（容易误提交） |
| 动态更新 | 需重启 | 支持热重载 |
| 推荐用途 | 生产环境 | 开发调试 |

---

## ❓ 常见问题

### Q1: 如何同时使用环境变量和 YAML 文件？

**A**: 不建议混用。如果设置了环境变量（`TEXT_API_KEY`），YAML 文件会被忽略。

### Q2: 如何禁用环境变量，强制使用 YAML？

**A**: 删除或注释环境变量即可：

```bash
# 删除环境变量
unset TEXT_API_KEY
unset IMAGE_API_KEY
```

### Q3: 为什么我的配置没有生效？

**A**: 检查以下几点：
1. 环境变量名称是否正确（区分大小写）
2. 服务是否已重启
3. 使用 `echo $TEXT_API_KEY` 检查变量是否设置
4. 检查日志输出

### Q4: 如何验证 API Key 是否有效？

**A**:
1. 访问 `/api/config` 查看配置
2. 尝试调用 `/api/outline` 生成大纲
3. 查看服务器日志

---

## 📚 参考资料

- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [Docker Compose 环境变量](https://docs.docker.com/compose/environment-variables/)
- [Node.js dotenv 库](https://github.com/motdotla/dotenv)

---

**最后更新**: 2025-11-29
**版本**: v1.1.0
