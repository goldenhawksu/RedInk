# Railway持久化存储配置指南

## 问题说明

Railway使用临时文件系统,容器重启后非持久化目录的文件会丢失。为了保持API Key等配置持久化,需要配置Railway Volume。

## 配置步骤

### 1. 创建Railway Volume

1. 打开Railway项目控制台
2. 选择你的后端服务
3. 进入 **Settings** 标签页
4. 滚动到 **Volumes** 部分
5. 点击 **Add Volume**
6. 配置如下:
   - **Mount Path**: `/app/history`
   - **Size**: 1 GB (可根据需要调整)
7. 点击 **Add Volume** 确认

### 2. 重新部署服务

Volume配置后,Railway会自动重新部署服务。

### 3. 验证配置

部署完成后:

1. 在设置页面配置API Key并保存
2. 等待容器重启(可以手动触发)
3. 重新打开设置页面,检查API Key是否仍然存在(显示为脱敏格式)

## 技术原理

我们的持久化配置管理器(`backend/utils/persistent_config.py`)会:

1. **保存配置时**:
   - 将配置保存到 `history/persistent_config.yaml` (持久化卷)
   - 同时保存到项目根目录的YAML文件(运行时使用)

2. **读取配置时**:
   - 优先从 `history/persistent_config.yaml` 读取
   - 如果没有,则从运行时YAML读取
   - 自动迁移现有配置到持久化存储

## 注意事项

### Railway V2新架构

Railway V2不再使用共享文件系统,每个服务有独立的临时文件系统。Volume是唯一的持久化存储方式。

### Volume大小建议

- **最小推荐**: 1 GB
- **生产环境**: 根据历史记录数量调整(每个历史记录约1-5MB)

### 备份建议

虽然Volume是持久化的,但仍建议:

1. 定期备份 `history/persistent_config.yaml`
2. 将重要API Key保存到密码管理器
3. 在Railway Variables中设置备用API Key(可选)

## 故障排查

### API Key仍然丢失

1. **检查Volume配置**:
   ```bash
   # 在Railway控制台的Logs中运行:
   ls -la /app/history/
   cat /app/history/persistent_config.yaml
   ```

2. **检查权限**:
   - 确保应用有读写 `/app/history/` 的权限

3. **查看日志**:
   - 搜索 "持久化配置" 相关日志
   - 确认配置是否成功保存

### Volume无法挂载

- 确认Mount Path是 `/app/history` (必须是绝对路径)
- 确认服务已完全重新部署

## 环境变量替代方案

如果无法使用Volume,可以使用Railway环境变量作为备用方案:

```env
# 在Railway Variables中设置
TEXT_API_KEY=your-google-gemini-api-key
IMAGE_API_KEY=your-google-genai-api-key
```

但这种方式需要修改代码来读取环境变量,不如Volume方案灵活。

---

**推荐方案**: 使用Railway Volume持久化存储,确保API Key和历史记录都不会丢失。
