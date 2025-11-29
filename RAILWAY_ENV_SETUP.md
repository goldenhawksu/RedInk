# Railway 环境变量配置

## ⚠️ 重要:必须设置的环境变量

为了让前端能够正确显示图片,需要在Railway中设置以下环境变量:

### 1. PUBLIC_DOMAIN (必需)

**作用**: 用于生成图片的完整URL,确保Vercel前端能够跨域访问Railway后端的图片资源。

**设置方法**:

1. 打开Railway项目控制台
2. 进入 **Variables** 标签页
3. 点击 **New Variable**
4. 设置:
   - **Key**: `PUBLIC_DOMAIN`
   - **Value**: `redink-backend.up.railway.app` (你的Railway域名,不包含https://)

**如何获取Railway域名**:
- 在Railway项目的 **Settings** > **Networking** > **Public Networking** 中查看
- 格式通常为: `your-project-name.up.railway.app`

### 2. 其他已配置的环境变量

确保以下环境变量已正确设置:

```env
# 文本生成 API Key
TEXT_API_KEY=your-google-gemini-api-key

# 图片生成 API Key
IMAGE_API_KEY=your-google-imagen-api-key
```

## 验证配置

设置完成后:

1. Railway会自动重新部署
2. 等待部署完成(约2-3分钟)
3. 在Vercel前端测试图片生成功能
4. 图片应该能正常显示,URL格式为: `https://redink-backend.up.railway.app/api/images/task_xxx/0.png`

## 故障排查

如果图片仍然无法显示:

1. **检查Railway日志**: 确认环境变量已生效
   ```
   # 应该看到:
   PUBLIC_DOMAIN = redink-backend.up.railway.app
   ```

2. **检查前端Network**: 打开浏览器开发者工具,查看图片请求URL
   - ✅ 正确: `https://redink-backend.up.railway.app/api/images/...`
   - ❌ 错误: `https://redink-self.vercel.app/api/images/...` (前端域名)

3. **检查CORS**: 确保backend/config.py中CORS_ORIGINS包含Vercel域名

## 注意事项

⚠️ **Railway临时存储限制**:
- Railway使用临时文件系统
- 容器重启后,所有生成的图片会丢失
- 建议后续集成Cloudinary等云存储服务实现持久化

---

更新时间: 2025-11-29
