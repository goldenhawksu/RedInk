# 🚀 Railway 部署指南 - 红墨后端

Railway 是部署 Node.js 后端的最佳选择，支持完整的 Node.js 生态系统。

## ✨ 优势

- ✅ **完全支持 Node.js** - 无需修改任何代码
- ✅ **免费额度充足** - 500小时/月 + $5 免费额度
- ✅ **自动 HTTPS** - 免费域名和 SSL 证书
- ✅ **环境变量管理** - 简单易用的 UI
- ✅ **GitHub 集成** - 自动部署
- ✅ **日志查看** - 实时查看应用日志

---

## 🎯 一键部署

### 方式一: 通过 GitHub (推荐)

1. **访问 Railway**
   - 打开 https://railway.app
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 授权 Railway 访问您的 GitHub
   - 选择 `RedInk` 仓库

3. **配置项目**
   - Railway 会自动检测到这是 Node.js 项目
   - 无需额外配置,使用默认设置

4. **配置环境变量**

   点击项目 → Variables → 添加以下变量:

   **必需变量**:
   ```
   TEXT_API_KEY=AIza************************************
   IMAGE_API_KEY=AIza************************************
   ```

   **可选变量**:
   ```
   NODE_ENV=production
   PORT=12399
   LOG_LEVEL=info
   TEXT_MODEL=gemini-2.5-flash
   TEXT_TEMPERATURE=1.0
   TEXT_MAX_TOKENS=8000
   IMAGE_MODEL=gemini-3-pro-image-preview
   ```

5. **部署**
   - Railway 会自动开始构建和部署
   - 等待 2-3 分钟
   - 部署成功后会获得一个公开 URL

6. **验证部署**
   ```bash
   curl https://your-app.railway.app/api/health
   ```

   预期响应:
   ```json
   {
     "success": true,
     "message": "服务正常运行"
   }
   ```

---

### 方式二: 通过 Railway CLI

1. **安装 Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **登录**
   ```bash
   railway login
   ```

3. **初始化项目**
   ```bash
   cd RedInk/backendjs
   railway init
   ```

4. **配置环境变量**
   ```bash
   railway variables set TEXT_API_KEY=AIza...
   railway variables set IMAGE_API_KEY=AIza...
   railway variables set NODE_ENV=production
   ```

5. **部署**
   ```bash
   railway up
   ```

---

## 📋 Railway 配置文件

已创建 `railway.json` 配置文件:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backendjs && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "cd backendjs && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 🔧 高级配置

### 自定义域名

1. 进入 Railway 项目设置
2. 点击 "Settings" → "Domains"
3. 添加自定义域名
4. 配置 DNS 记录（Railway 会提供指导）

### 自动部署

Railway 会自动监听 GitHub 仓库的变化:
- Push 到 `main` 分支 → 自动部署
- 可在设置中配置其他分支

### 查看日志

1. 进入 Railway 项目
2. 点击 "Deployments"
3. 选择最新的部署
4. 点击 "View Logs"

---

## 💰 费用说明

### 免费额度

- **执行时间**: 500 小时/月
- **带宽**: 100 GB/月
- **免费额度**: $5/月

### 计费

- 仅在超出免费额度时收费
- 按使用量付费
- 大部分个人项目在免费额度内

---

## 🐛 故障排查

### 问题 1: 构建失败

**检查**:
- 确认 `package.json` 存在于 `backendjs/` 目录
- 检查 Node.js 版本兼容性
- 查看构建日志

**解决**:
```bash
# 本地测试构建
cd backendjs
npm install
npm run build
```

### 问题 2: 应用启动失败

**检查**:
- 环境变量是否正确设置
- 端口配置是否正确
- 查看应用日志

**解决**:
- Railway 会自动设置 `PORT` 环境变量
- 确保应用监听 `process.env.PORT`

### 问题 3: API 调用失败

**检查**:
- API Key 是否有效
- 环境变量是否正确设置
- 查看应用日志中的错误信息

---

## 📊 部署后配置

### 连接前端

部署成功后,您会获得一个 Railway URL,例如:
```
https://redink-production-xxxx.up.railway.app
```

修改前端 API 配置:

**`frontend/src/api/index.ts`**:
```typescript
const api = axios.create({
  baseURL: 'https://redink-production-xxxx.up.railway.app/api',
  timeout: 60000
});
```

然后重新部署前端到 Vercel。

---

## 🎉 完成

恭喜！您的红墨后端已成功部署到 Railway！

**下一步**:
1. ✅ 配置前端连接到 Railway 后端
2. ✅ 测试所有 API 功能
3. ✅ （可选）配置自定义域名
4. ✅ 监控应用性能和日志

---

## 📚 相关资源

- [Railway 文档](https://docs.railway.app)
- [Railway 社区](https://railway.app/community)
- [Railway Discord](https://discord.gg/railway)

---

**部署成功！** 🎊
