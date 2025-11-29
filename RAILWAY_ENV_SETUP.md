# Railway 环境变量配置

## ⚠️ 必须设置的环境变量

### 1. CORS_ORIGINS (可选,多域名支持)

**作用**: 允许额外的前端域名跨域访问后端API。

**默认支持的域名**:
- `http://localhost:5173` (本地开发)
- `http://localhost:3000` (本地开发)
- `https://redink-self.vercel.app` (默认Vercel域名)

**如何添加自定义域名**:

如果你为Vercel前端绑定了自定义域名(如 `https://xhs.spdt.work`),需要在Railway中设置:

1. 打开Railway项目控制台
2. 进入 **Variables** 标签页
3. 点击 **New Variable**
4. 设置:
   - **Key**: `CORS_ORIGINS`
   - **Value**: `https://xhs.spdt.work` (单个域名)
   - 或 **Value**: `https://xhs.spdt.work,https://another-domain.com` (多个域名,逗号分隔)

**注意**:
- ✅ 必须包含完整协议 (`https://`)
- ✅ 不要在末尾加斜杠
- ✅ 多个域名用英文逗号分隔

### 2. 文本生成和图片生成 API Key (必需)

确保以下环境变量已正确设置:

```env
# 文本生成 API Key
TEXT_API_KEY=your-google-gemini-api-key

# 图片生成 API Key
IMAGE_API_KEY=your-google-imagen-api-key
```

## 自动环境变量 (Railway自动提供)

以下环境变量由Railway自动设置,**无需手动配置**:

### RAILWAY_PUBLIC_DOMAIN

Railway自动提供的公网域名,用于生成图片完整URL。

- 示例值: `redink-backend.up.railway.app`
- 用途: 后端自动使用此域名生成图片URL

## 验证配置

设置完成后:

1. Railway会自动重新部署
2. 等待部署完成(约2-3分钟)
3. 查看Railway部署日志,应该看到:
   ```
   🌐 CORS 允许的域名: ['http://localhost:5173', 'http://localhost:3000', 'https://redink-self.vercel.app', 'https://xhs.spdt.work']
   ```

4. 在新域名前端测试:
   - 打开浏览器开发者工具(F12)
   - 访问新域名(如 `https://xhs.spdt.work`)
   - 确认没有CORS错误

## 故障排查

### CORS错误

**症状**: 浏览器控制台显示:
```
Access to XMLHttpRequest at 'https://redink-backend.up.railway.app/api/...'
from origin 'https://xhs.spdt.work' has been blocked by CORS policy
```

**解决方案**:

1. **检查Railway环境变量**:
   - 确认`CORS_ORIGINS`包含你的新域名
   - 确认域名格式正确(包含`https://`,无末尾斜杠)

2. **检查Railway日志**:
   - 查看部署日志中的CORS配置输出
   - 确认你的域名在允许列表中

3. **重新部署**:
   - 如果修改了环境变量,Railway会自动重新部署
   - 等待部署完成后再测试

4. **清除浏览器缓存**:
   - 有时浏览器会缓存CORS预检请求结果
   - 尝试硬刷新(Ctrl+Shift+R)或无痕模式

### 图片显示问题

确保前端环境变量也更新了:

**Vercel环境变量**:
```env
VITE_API_BASE_URL=https://redink-backend.up.railway.app/api
```

## 注意事项

⚠️ **Railway临时存储限制**:
- Railway使用临时文件系统
- 容器重启后,所有生成的图片会丢失
- 建议后续集成Cloudinary等云存储服务实现持久化

---

更新时间: 2025-11-29
