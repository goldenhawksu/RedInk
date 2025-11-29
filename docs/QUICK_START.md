# RedInk 快速开始指南

本指南将帮助你在 5 分钟内完成 RedInk 的部署和配置。

---

## 📋 部署清单

- [ ] Fork 本仓库
- [ ] 部署前端到 Vercel
- [ ] 部署后端到 Railway
- [ ] 配置环境变量
- [ ] 测试前后端连接

---

## 🚀 第一步：Fork 仓库

1. 访问 https://github.com/your-username/RedInk
2. 点击右上角的 **Fork** 按钮
3. 等待 Fork 完成

---

## 🎨 第二步：部署前端到 Vercel

### 2.1 导入项目

1. 访问 [Vercel](https://vercel.com)
2. 点击 **Add New** → **Project**
3. 选择你 Fork 的 RedInk 仓库
4. 点击 **Import**

### 2.2 配置构建设置

在项目设置页面，配置以下选项：

| 设置项 | 值 |
|--------|---|
| **Framework Preset** | `Other` 或 `Vite` |
| **Build Command** | `cd frontend && npm run build` |
| **Output Directory** | `frontend/dist` |
| **Install Command** | `npm install --prefix frontend` |

### 2.3 添加环境变量（稍后配置）

暂时跳过，等 Railway 部署完成后再配置。

### 2.4 部署

点击 **Deploy** 按钮，等待部署完成（约 1-2 分钟）。

**部署成功后，记录 Vercel 分配的域名**，例如：
```
https://redink-xxx.vercel.app
```

---

## 🚂 第三步：部署后端到 Railway

### 3.1 创建项目

1. 访问 [Railway](https://railway.app)
2. 点击 **New Project**
3. 选择 **Deploy from GitHub repo**
4. 选择你 Fork 的 RedInk 仓库

### 3.2 等待自动部署

Railway 会自动检测 `package.json` 和 `railway.json`，开始构建：

- ✅ 检测为 Node.js 项目
- ✅ 运行 `npm install`（安装 backendjs 依赖）
- ✅ 运行 `npm run build`（编译 TypeScript）
- ✅ 运行 `npm start`（启动服务器）

等待部署完成（约 2-3 分钟）。

### 3.3 配置环境变量

部署完成后，进入项目设置：

1. 点击项目 → **Variables** 标签
2. 添加以下环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `TEXT_API_KEY` | 文本生成 API Key | `sk-xxxxxxxxxxxxx` |
| `TEXT_BASE_URL` | 文本生成 API 地址 | `https://api.openai.com/v1` |
| `IMAGE_API_KEY` | 图片生成 API Key | `sk-xxxxxxxxxxxxx` |
| `IMAGE_BASE_URL` | 图片生成 API 地址 | `https://api.openai.com/v1` |
| `PORT` | 端口（可选） | `3000` |

3. 点击 **Save** 保存

### 3.4 获取 Railway 域名

1. 点击项目 → **Settings** 标签
2. 找到 **Domains** 部分
3. 如果没有域名，点击 **Generate Domain**
4. **复制生成的域名**，例如：
   ```
   https://redink-production-xxxx.railway.app
   ```

---

## 🔗 第四步：连接前后端

### 4.1 更新 Vercel 环境变量

1. 回到 Vercel 项目
2. 进入 **Settings** → **Environment Variables**
3. 添加环境变量：

   | 变量名 | 值 |
   |--------|---|
   | `VITE_API_BASE_URL` | `https://redink-production-xxxx.railway.app/api` |

   **⚠️ 注意**: 替换为你的 Railway 域名，末尾加 `/api`

4. 点击 **Save**

### 4.2 重新部署 Vercel

环境变量需要重新构建才能生效：

1. 进入 **Deployments** 标签
2. 找到最新的部署
3. 点击右侧的 **...** → **Redeploy**
4. 等待重新部署完成

---

## ✅ 第五步：测试部署

### 5.1 测试后端 API

访问 Railway 后端健康检查端点：

```
https://your-railway-app.railway.app/api/health
```

**预期响应**：
```json
{
  "success": true,
  "message": "服务正常运行",
  "timestamp": "2025-11-29T..."
}
```

### 5.2 测试前端应用

访问 Vercel 前端地址：

```
https://your-app.vercel.app
```

**预期效果**：
- ✅ 页面正常加载
- ✅ 可以输入主题
- ✅ 点击生成大纲，能正常调用后端 API

---

## 🎉 完成！

现在你的 RedInk 已经完全部署成功！

### 接下来可以做什么？

- 📸 尝试生成第一个小红书图文
- ⚙️ 在 Web 界面的设置页面配置更多 API 选项
- 📚 阅读 [原项目 README](../ORIGINAL_README.md) 了解更多功能

---

## 🐛 常见问题

### 问题 1: Vercel 构建失败

**症状**: 显示 "Build failed" 错误

**解决方案**:
1. 检查 Build Command 是否为 `cd frontend && npm run build`
2. 检查 Output Directory 是否为 `frontend/dist`
3. 查看构建日志，确认错误信息

### 问题 2: 前端无法连接后端

**症状**: 前端加载正常，但生成大纲时报错

**解决方案**:
1. 检查 Vercel 环境变量 `VITE_API_BASE_URL` 是否正确
2. 确认 Railway 后端是否正常运行（访问 `/api/health` 端点）
3. 检查 Railway 域名是否以 `/api` 结尾
4. 在 Vercel 重新部署以应用环境变量

### 问题 3: Railway 部署失败

**症状**: Railway 构建日志显示错误

**解决方案**:
1. 检查根目录是否有 `package.json` 文件
2. 确认 Railway 没有使用 `Dockerfile`（已重命名为 `Dockerfile.python-backend`）
3. 查看详细构建日志，确认错误原因
4. 参考 [Railway 部署修复文档](./deployment/RAILWAY_FIX.md)

### 问题 4: API 调用失败

**症状**: 生成内容时提示 API 错误

**解决方案**:
1. 检查 Railway 环境变量中的 API Key 是否正确
2. 确认 `TEXT_BASE_URL` 和 `IMAGE_BASE_URL` 是否可访问
3. 测试 API Key 是否有效（可以使用 curl 测试）

---

## 📞 需要帮助？

- 查看 [部署文档](./deployment/)
- 提交 [GitHub Issue](https://github.com/your-username/RedInk/issues)
- 查看 [原项目文档](https://github.com/HisMax/RedInk)
