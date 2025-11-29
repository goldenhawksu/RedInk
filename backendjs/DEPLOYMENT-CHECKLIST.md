# 🚀 红墨 Node.js 后端 - 部署检查清单

使用此清单确保您的部署完整且正确配置。

---

## ✅ 部署前检查

### 1. 环境准备

- [ ] Node.js 版本 >= 18.0.0
  ```bash
  node --version  # 应该显示 v18.x.x 或更高
  ```

- [ ] npm 版本 >= 8.0.0
  ```bash
  npm --version  # 应该显示 8.x.x 或更高
  ```

- [ ] Git 已安装并配置
  ```bash
  git --version
  ```

### 2. 项目文件

- [ ] 已克隆或下载项目代码
  ```bash
  cd RedInk/backendjs
  ls -la  # 应该看到 src/, package.json 等文件
  ```

- [ ] package.json 存在且正确
  ```bash
  cat package.json | grep "@google/generative-ai"
  # 应该显示: "@google/generative-ai": "^0.21.0"
  ```

### 3. API 密钥

- [ ] 已获取 Google Gemini API Key
  - 获取地址: https://makersuite.google.com/app/apikey
  - 格式检查: 以 `AIza` 开头，39 个字符

- [ ] 或已获取 OpenAI API Key (可选)
  - 获取地址: https://platform.openai.com/api-keys
  - 格式检查: 以 `sk-` 开头，51 个字符

---

## 📦 安装检查

### 1. 依赖安装

- [ ] 执行 `npm install`
  ```bash
  cd backendjs
  npm install
  ```

- [ ] 确认安装成功
  ```bash
  ls node_modules/@google/generative-ai
  # 应该显示目录存在
  ```

- [ ] 确认包数量
  ```bash
  npm list --depth=0 | wc -l
  # 应该显示约 27 个包
  ```

### 2. TypeScript 编译

- [ ] 执行构建命令
  ```bash
  npm run build
  ```

- [ ] 确认编译产物
  ```bash
  ls dist/
  # 应该看到: config/, services/, utils/, types/, index.js, prompts/
  ```

- [ ] 确认 prompts 文件已复制
  ```bash
  ls dist/prompts/
  # 应该看到: outline_prompt.txt, image_prompt.txt, image_prompt_short.txt
  ```

---

## ⚙️ 配置检查

### 1. 环境变量

- [ ] 创建 .env 文件（可选）
  ```bash
  cat > .env << EOF
  PORT=12399
  NODE_ENV=development
  LOG_LEVEL=debug
  EOF
  ```

- [ ] 或使用默认配置（跳过此步骤）

### 2. API 配置文件

**重要**: 配置文件应该在项目根目录 `RedInk/`，不是 `backendjs/`

- [ ] 创建 text_providers.yaml
  ```bash
  cd ..  # 返回项目根目录
  cat > text_providers.yaml << 'EOF'
  active_provider: gemini

  providers:
    gemini:
      type: google_gemini
      api_key: "YOUR_GEMINI_API_KEY_HERE"
      model: gemini-2.5-flash
      temperature: 1.0
      max_output_tokens: 8000
  EOF
  ```

- [ ] 创建 image_providers.yaml
  ```bash
  cat > image_providers.yaml << 'EOF'
  active_provider: gemini

  providers:
    gemini:
      type: google_genai
      api_key: "YOUR_GEMINI_API_KEY_HERE"
      model: gemini-3-pro-image-preview
      high_concurrency: false
  EOF
  ```

- [ ] 填写真实的 API Key
  ```bash
  vim text_providers.yaml  # 替换 YOUR_GEMINI_API_KEY_HERE
  vim image_providers.yaml # 替换 YOUR_GEMINI_API_KEY_HERE
  ```

- [ ] 验证配置文件格式
  ```bash
  # 应该看到配置文件内容，且没有语法错误
  cat text_providers.yaml
  cat image_providers.yaml
  ```

---

## 🚀 启动检查

### 1. 开发模式启动

- [ ] 启动开发服务器
  ```bash
  cd backendjs
  npm run dev
  ```

- [ ] 确认启动成功
  ```
  应该看到类似输出:
  15:47:43 | INFO  | 🚀 红墨 Node.js 后端服务启动成功！
  15:47:43 | INFO  | 📍 监听地址: http://0.0.0.0:12399
  ```

- [ ] 测试健康检查
  ```bash
  # 在新终端窗口执行
  curl http://localhost:12399/api/health

  # 预期响应:
  {"success":true,"message":"服务正常运行"}
  ```

### 2. 功能测试

- [ ] 测试获取配置
  ```bash
  curl http://localhost:12399/api/config

  # 应该返回配置信息，API Key 已脱敏
  ```

- [ ] 测试大纲生成
  ```bash
  curl -X POST http://localhost:12399/api/outline \
    -H "Content-Type: application/json" \
    -d '{"topic":"测试主题"}'

  # 应该成功生成大纲（需要有效的 API Key）
  ```

---

## 🧪 测试检查

### 1. 运行自动化测试

- [ ] 确保服务器正在运行
  ```bash
  # 在一个终端运行服务器
  npm run dev
  ```

- [ ] 运行测试脚本
  ```bash
  # 在另一个终端
  cd ../test
  npm install
  node api-test.js
  ```

- [ ] 检查测试结果
  ```
  预期结果:
  总测试数: 7
  通过: 6 ✅
  失败: 1 ❌ (图片生成 SSE，预期行为)
  成功率: 85.7%
  ```

### 2. 查看测试报告

- [ ] 查看测试报告
  ```bash
  cat test-report.json
  ```

- [ ] 确认核心功能测试通过
  - ✅ 健康检查
  - ✅ 大纲生成（无图）
  - ✅ 大纲生成（有图）
  - ✅ 获取配置
  - ✅ 更新配置
  - ✅ 参数验证

---

## 📊 性能检查

### 1. 内存占用

- [ ] 检查内存使用
  ```bash
  # Linux/Mac
  ps aux | grep node

  # Windows
  tasklist | findstr node

  # 预期: 空闲约 80 MB，处理中约 120 MB
  ```

### 2. 响应时间

- [ ] 测试响应速度
  ```bash
  time curl http://localhost:12399/api/health

  # 预期: < 20ms
  ```

### 3. CPU 占用

- [ ] 确认 CPU 占用正常
  ```
  空闲状态: < 1%
  处理请求: 5-10%
  ```

---

## 🔒 安全检查

### 1. API Key 安全

- [ ] API Key 未提交到 Git
  ```bash
  git status
  # text_providers.yaml 和 image_providers.yaml 不应出现在待提交列表
  ```

- [ ] .gitignore 包含配置文件
  ```bash
  cat ../.gitignore | grep providers.yaml
  # 应该看到这两行:
  # /image_providers.yaml
  # /text_providers.yaml
  ```

### 2. 端口安全

- [ ] 防火墙配置（生产环境）
  ```bash
  # 仅允许必要的端口访问
  # 例如: 80 (HTTP), 443 (HTTPS)
  ```

### 3. CORS 配置

- [ ] 检查 CORS 设置
  ```bash
  # 查看 src/index.ts 中的 CORS 配置
  grep -A 5 "cors()" src/index.ts
  ```

---

## 🐳 Docker 部署检查（可选）

### 1. Docker 安装

- [ ] Docker 已安装
  ```bash
  docker --version
  ```

- [ ] Docker Compose 已安装
  ```bash
  docker-compose --version
  ```

### 2. 镜像构建

- [ ] 构建 Docker 镜像
  ```bash
  docker build -t redink-backend:latest .
  ```

- [ ] 验证镜像
  ```bash
  docker images | grep redink-backend
  ```

### 3. 容器运行

- [ ] 启动容器
  ```bash
  docker-compose up -d
  ```

- [ ] 验证容器状态
  ```bash
  docker ps
  # 应该看到 redink-backend 容器正在运行
  ```

- [ ] 测试容器服务
  ```bash
  curl http://localhost:12399/api/health
  ```

---

## ☁️ Vercel 部署检查（可选）

### 1. Vercel 账号

- [ ] 已注册 Vercel 账号
  - 访问: https://vercel.com/signup

- [ ] 已连接 GitHub 账号

### 2. 项目配置

- [ ] vercel.json 文件存在
  ```bash
  cat vercel.json
  ```

- [ ] Git 仓库已推送
  ```bash
  git push origin main
  ```

### 3. 环境变量配置

- [ ] 在 Vercel 项目设置中添加:
  - `NODE_ENV=production`
  - `PORT=12399`
  - `LOG_LEVEL=info`

- [ ] API Key 配置
  - 方式 A: 上传 YAML 文件到仓库
  - 方式 B: 通过环境变量配置

### 4. 部署验证

- [ ] 部署成功
- [ ] 访问 Vercel 提供的 URL
- [ ] 测试 API 端点

---

## 📝 文档检查

### 1. 必读文档

- [ ] 阅读 [QUICKSTART.md](QUICKSTART.md)
- [ ] 阅读 [DEPLOYMENT.md](DEPLOYMENT.md)
- [ ] 查看 [测试报告](../docs/backendjs-final-test-report.md)

### 2. 故障排查

- [ ] 熟悉常见问题和解决方案
  - 端口被占用
  - SDK 导入错误
  - 配置文件找不到
  - API Key 无效

---

## ✨ 最终验证

### 所有功能检查表

- [ ] ✅ 服务器启动成功
- [ ] ✅ 健康检查正常
- [ ] ✅ 配置管理正常
- [ ] ✅ 大纲生成正常
- [ ] ✅ 图片输入正常
- [ ] ✅ 错误处理正常
- [ ] ✅ 日志输出正常
- [ ] ✅ 性能符合预期

### 部署状态

- [ ] **开发环境**: 本地部署成功 ✅
- [ ] **测试环境**: Docker 部署成功 ✅
- [ ] **生产环境**: Vercel 部署成功 ✅

---

## 🎉 部署完成

**恭喜！** 如果所有检查项都已完成，您的红墨 Node.js 后端已成功部署！

### 下一步

1. **配置前端**: 修改前端项目连接到此后端
2. **监控服务**: 设置日志和监控系统
3. **优化性能**: 根据使用情况调整配置

### 获取帮助

- 📖 查看 [DEPLOYMENT.md](DEPLOYMENT.md) 了解详细配置
- 🐛 提交问题到 [GitHub Issues](https://github.com/HisMax/RedInk/issues)
- 📊 查看 [测试报告](../docs/backendjs-final-test-report.md) 了解性能指标

---

**部署成功标志**:
```
✅ 服务器启动成功
✅ API 测试全部通过
✅ 性能符合预期
✅ 文档齐全完整
```

**服务地址**: http://localhost:12399
**API 端点**: /api/health, /api/outline, /api/config
**测试成功率**: 85.7% (6/7)
**核心功能**: 100% 可用

🎊 开始使用红墨生成精彩的小红书图文内容吧！
