# 快速开始 - 5 分钟部署红墨 Node.js 后端

本文档帮助您在 5 分钟内快速部署并运行红墨 Node.js 后端服务。

---

## 🚀 超快部署（3 步）

### 步骤 1: 安装依赖

```bash
cd backendjs
npm install
```

### 步骤 2: 配置 API Key

在项目根目录（`RedInk/`）创建 `text_providers.yaml`:

```yaml
active_provider: gemini

providers:
  gemini:
    type: google_gemini
    api_key: "AIza************************************"  # ← 填写你的 Gemini API Key
    model: gemini-2.5-flash
    temperature: 1.0
    max_output_tokens: 8000
```

创建 `image_providers.yaml`:

```yaml
active_provider: gemini

providers:
  gemini:
    type: google_genai
    api_key: "AIza************************************"  # ← 填写你的 Gemini API Key
    model: gemini-3-pro-image-preview
    high_concurrency: false
```

**获取 Gemini API Key**: https://makersuite.google.com/app/apikey

### 步骤 3: 启动服务

```bash
npm run dev
```

**搞定！** 访问 http://localhost:12399/api/health 验证服务是否正常运行。

---

## 📋 完整流程（5 分钟）

### 1. 克隆项目 (30 秒)

```bash
git clone https://github.com/HisMax/RedInk.git
cd RedInk/backendjs
```

### 2. 安装依赖 (1-2 分钟)

```bash
npm install
```

等待安装完成，大约需要 1-2 分钟。

### 3. 配置 API Key (1 分钟)

**方式 A: 使用示例配置**

```bash
# 返回项目根目录
cd ..

# 复制示例配置
cp text_providers.yaml.example text_providers.yaml
cp image_providers.yaml.example image_providers.yaml

# 编辑配置文件，填写真实的 API Key
vim text_providers.yaml  # 或使用其他编辑器
vim image_providers.yaml
```

**方式 B: 手动创建配置**

在项目根目录创建两个文件（见步骤 2）。

### 4. 启动服务 (10 秒)

**开发模式**（推荐，支持热重载）:
```bash
cd backendjs
npm run dev
```

**或生产模式**:
```bash
npm run build
npm start
```

### 5. 验证部署 (10 秒)

打开浏览器或终端：

```bash
# 测试健康检查
curl http://localhost:12399/api/health

# 预期响应
{
  "success": true,
  "message": "服务正常运行"
}
```

**✅ 部署成功！** 现在可以开始使用了。

---

## 🧪 测试功能

### 测试大纲生成

```bash
curl -X POST http://localhost:12399/api/outline \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "如何在家做拿铁咖啡"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "pages": [
    {
      "page_type": "封面",
      "page_content": "...",
      "image_prompt": "..."
    },
    // ... 更多页面
  ]
}
```

### 测试配置管理

```bash
# 获取当前配置
curl http://localhost:12399/api/config

# 响应会显示当前的服务商配置（API Key 已脱敏）
```

---

## 🔧 常见问题

### Q1: 端口被占用怎么办？

**错误**: `Error: listen EADDRINUSE: address already in use`

**解决**:

```bash
# 修改端口
echo "PORT=13399" > backendjs/.env
npm run dev
```

### Q2: 找不到配置文件？

**错误**: `ENOENT: no such file or directory, open '../text_providers.yaml'`

**解决**:

```bash
# 确认配置文件在项目根目录
ls ../text_providers.yaml
ls ../image_providers.yaml

# 如果不存在，按照步骤 3 创建
```

### Q3: API Key 无效？

**错误**: `Invalid authentication credentials`

**解决**:

1. 检查 API Key 格式（Gemini 应该以 `AIza` 开头）
2. 确认 API Key 已启用
3. 访问 https://makersuite.google.com/app/apikey 重新生成

### Q4: 依赖安装失败？

**解决**:

```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 下一步

### 配置前端连接后端

修改前端项目 `src/api/index.ts`:

```typescript
// 修改 baseURL
const api = axios.create({
  baseURL: 'http://localhost:12399/api',  // Node.js 后端
  timeout: 60000
});
```

### 运行完整测试

```bash
# 在另一个终端
cd test
npm install
node api-test.js

# 查看测试报告
cat test-report.json
```

### 查看详细文档

- **完整部署指南**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **项目 README**: [README.md](README.md)
- **测试报告**: [docs/backendjs-final-test-report.md](../docs/backendjs-final-test-report.md)

---

## 🎯 生产部署

### Docker 部署 (推荐)

```bash
# 构建镜像
docker build -t redink-backend .

# 运行容器
docker run -d \
  -p 12399:12399 \
  -v $(pwd)/../text_providers.yaml:/app/text_providers.yaml \
  -v $(pwd)/../image_providers.yaml:/app/image_providers.yaml \
  redink-backend
```

### Vercel 部署

```bash
# 安装 CLI
npm install -g vercel

# 部署
vercel --prod
```

详细步骤见 [DEPLOYMENT.md](DEPLOYMENT.md)。

---

## 💡 小贴士

### 1. 使用环境变量

创建 `.env` 文件:
```env
PORT=12399
NODE_ENV=development
LOG_LEVEL=debug
```

### 2. 查看详细日志

```bash
# 开发模式已默认启用详细日志
npm run dev

# 如需更详细的调试信息
LOG_LEVEL=debug npm run dev
```

### 3. 自动重启

开发模式已包含自动重启，修改代码后会自动重新加载。

---

## 🆘 获取帮助

遇到问题？

1. **查看日志**: 终端输出会显示详细的错误信息
2. **查看文档**: [DEPLOYMENT.md](DEPLOYMENT.md) 包含完整的故障排查指南
3. **提交 Issue**: [GitHub Issues](https://github.com/HisMax/RedInk/issues)

---

**恭喜！你已经成功部署红墨 Node.js 后端服务！** 🎉

**服务地址**: http://localhost:12399

**API 文档**: 访问 `/api/health` 查看服务状态

**下一步**: 配置前端项目连接到此后端，开始生成图文内容！
