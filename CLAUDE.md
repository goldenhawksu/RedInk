# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

红墨是一个基于 AI 的小红书图文生成器，允许用户通过一句话生成完整的小红书图文内容（封面 + 多页内容）。

**核心技术栈：**
- 后端：Python 3.11+ + Flask
- 前端：Vue 3 + TypeScript + Vite + Pinia
- AI 模型：Gemini（文案生成）+ Gemini 3/自定义图片生成 API
- 部署：Docker + uv（Python 包管理）

---

## 常用命令

### 后端开发

```bash
# 安装依赖（使用 uv）
uv sync

# 启动后端服务（监听 0.0.0.0:12398）
uv run python -m backend.app

# 单独运行某个模块测试
uv run python -m backend.services.outline
```

### 前端开发

```bash
cd frontend

# 安装依赖（使用 pnpm）
pnpm install

# 启动开发服务器（http://localhost:5173）
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### Docker 部署

```bash
# 构建镜像
docker build -t redink:latest .

# 运行容器（单容器模式，包含前后端）
docker run -d -p 12398:12398 -v ./output:/app/output redink:latest

# 使用 docker-compose
docker-compose up -d
docker-compose down
```

---

## 代码架构

### 后端架构（backend/）

```
backend/
├── app.py              # Flask 应用入口，支持自动检测前端构建产物
├── config.py           # 配置管理（YAML 配置加载、缓存、验证）
├── routes/
│   └── api.py          # 所有 API 路由（大纲、生成、下载、配置管理等）
├── services/           # 核心业务逻辑层
│   ├── outline.py      # 大纲生成服务（调用 LLM 生成内容结构）
│   ├── image.py        # 图片生成服务（并发控制、重试机制）
│   └── history.py      # 历史记录管理
├── generators/         # 图片生成器（工厂模式）
│   ├── base.py         # 抽象基类（定义统一接口）
│   ├── factory.py      # 工厂类（根据配置创建生成器实例）
│   ├── google_genai.py # Google Gemini 图片生成实现
│   ├── openai_compatible.py  # OpenAI 兼容接口实现
│   └── image_api.py    # 通用图片 API 实现
└── utils/
    ├── text_client.py  # 文本生成客户端（统一接口）
    ├── genai_client.py # Google GenAI 客户端封装
    └── image_compressor.py  # 图片压缩工具
```

**关键设计模式：**

1. **工厂模式（Generator Factory）**：
   - `ImageGeneratorFactory` 根据配置动态创建图片生成器
   - 所有生成器继承 `ImageGeneratorBase`，实现 `generate_image()` 和 `validate_config()`
   - 支持运行时注册新的生成器类型

2. **配置管理（Config）**：
   - 使用 YAML 文件配置（`text_providers.yaml`、`image_providers.yaml`）
   - 支持多服务商切换（通过 `active_provider` 字段）
   - 配置缓存机制（`Config._image_providers_config`、`Config._text_providers_config`）
   - 提供配置验证（启动时检查 API Key、Base URL 等）

3. **并发控制（ImageService）**：
   - 通过 `high_concurrency` 配置控制并发模式
   - 非高并发：逐张生成，适合 GCP 试用账号
   - 高并发：最多 15 张并行生成（`MAX_CONCURRENT = 15`）
   - 自动重试机制（`AUTO_RETRY_COUNT = 3`）

### 前端架构（frontend/src/）

```
frontend/src/
├── main.ts             # 应用入口
├── App.vue             # 根组件（包含版权信息 Footer）
├── router/
│   └── index.ts        # 路由配置（5 个主要页面 + About）
├── stores/
│   └── generator.ts    # Pinia 状态管理（大纲、图片、生成进度）
├── views/              # 页面组件
│   ├── HomeView.vue         # 首页（输入主题、上传参考图）
│   ├── OutlineView.vue      # 大纲编辑页（调整页面描述）
│   ├── GenerateView.vue     # 生成进度页（实时展示图片生成）
│   ├── ResultView.vue       # 结果展示页（浏览、下载）
│   ├── HistoryView.vue      # 历史记录（查看、重新生成）
│   └── SettingsView.vue     # 配置管理（Web 界面配置 API）
└── api/
    └── index.ts        # API 请求封装（axios）
```

**状态管理（generator.ts）关键状态：**
- `topic`: 用户输入的主题
- `outline`: 生成的页面大纲（数组）
- `coverImage`: 用户上传的参考图（Base64）
- `generatedImages`: 已生成的图片 URL 列表
- `generationProgress`: 当前生成进度

### API 端点（routes/api.py）

```python
/api/health              # GET  健康检查
/api/outline             # POST 生成大纲（输入主题 + 参考图）
/api/generate            # POST 生成图片（SSE 流式返回进度）
/api/regenerate          # POST 重新生成单张图片
/api/download            # GET  下载所有图片（ZIP）
/api/images/<filename>   # GET  获取单张图片
/api/history             # GET  获取历史记录列表
/api/history/<id>        # GET  获取历史记录详情
/api/config/text         # GET/PUT 文本服务商配置
/api/config/image        # GET/PUT 图片服务商配置
/api/config/reload       # POST 重新加载配置
```

---

## 核心工作流程

### 1. 生成流程（用户视角）

```
用户输入主题 + 上传参考图
    ↓
[OutlineService] 调用 LLM 生成 6-9 页大纲
    ↓
用户编辑大纲（可选）
    ↓
[ImageService] 生成图片
    ├─ 首先生成封面（index=0）
    └─ 然后并发/串行生成其他页面
    ↓
实时推送进度（SSE）
    ↓
保存到历史记录
```

### 2. 图片生成核心逻辑（image.py）

```python
# 关键方法
ImageService.generate_all_pages(outline, cover_image, topic)
    ↓
1. 生成封面（generate_cover_page）
    - 传递用户上传的参考图
    - 使用大纲第一页的描述
    ↓
2. 生成内容页（generate_content_pages）
    - 传递封面图作为风格参考
    - 根据 high_concurrency 决定并发/串行
    - 自动重试失败的页面
```

### 3. 配置管理（Web 界面）

前端通过 `SettingsView.vue` 可视化配置 API：
- 添加/编辑/删除服务商
- 切换激活的服务商
- API Key 脱敏显示（`sk-****...****`）
- 配置实时保存到 YAML 文件

---

## 配置文件说明

### text_providers.yaml（文本生成配置）

```yaml
active_provider: openai  # 当前激活的服务商

providers:
  openai:
    type: openai_compatible
    api_key: sk-xxx
    base_url: https://api.openai.com/v1
    model: gpt-4o

  gemini:
    type: google_gemini
    api_key: AIza-xxx
    model: gemini-2.0-flash
```

**支持的 type：**
- `google_gemini`: Google 原生接口
- `openai_compatible`: OpenAI 兼容接口（包括 OneAPI、New API 等）

### image_providers.yaml（图片生成配置）

```yaml
active_provider: gemini

providers:
  gemini:
    type: google_genai
    api_key: AIza-xxx
    model: gemini-3-pro-image-preview
    high_concurrency: false  # 是否启用并发
```

**支持的 type：**
- `google_genai`: Google Gemini 图片生成
- `image_api`: 通用图片 API（OpenAI DALL-E 等）
- `openai_compatible`: OpenAI 兼容接口

**high_concurrency 配置：**
- `false`（默认）：逐张生成，适合 GCP 300$ 试用账号
- `true`：15 张并发，需要 API 支持高并发

---

## 开发注意事项

### 添加新的图片生成器

1. 在 `backend/generators/` 创建新文件（如 `custom_generator.py`）
2. 继承 `ImageGeneratorBase` 并实现抽象方法：
   ```python
   class CustomGenerator(ImageGeneratorBase):
       def generate_image(self, prompt: str, **kwargs) -> bytes:
           # 实现图片生成逻辑
           pass

       def validate_config(self) -> bool:
           # 验证配置
           pass
   ```
3. 在 `factory.py` 的 `GENERATORS` 字典注册：
   ```python
   GENERATORS = {
       'custom': CustomGenerator,
       # ...
   }
   ```

### 修改大纲生成 Prompt

编辑 `backend/services/outline.py` 的 `_load_prompt_template()` 方法，或在同目录创建 `outline_prompt.txt` 文件。

### 调整并发参数

修改 `backend/services/image.py`:
```python
MAX_CONCURRENT = 15  # 最大并发数
AUTO_RETRY_COUNT = 3  # 重试次数
```

### 前端 API 基础 URL

开发环境：`frontend/src/api/index.ts` 中 `baseURL` 默认为 `http://localhost:12398/api`

生产环境：前端构建后由 Flask 直接托管，API 请求使用相对路径 `/api`

---

## 日志调试

后端使用 Python `logging` 模块，日志级别配置在 `backend/app.py` 的 `setup_logging()`:

```python
# 模块日志级别
logging.getLogger('backend').setLevel(logging.DEBUG)
logging.getLogger('werkzeug').setLevel(logging.INFO)
logging.getLogger('urllib3').setLevel(logging.WARNING)
```

关键日志位置：
- `OutlineService`: 大纲生成过程、LLM 调用
- `ImageService`: 图片生成进度、重试、错误
- `Config`: 配置加载、验证、切换

---

## Docker 部署说明

**单容器部署：**
- Dockerfile 使用多阶段构建（前端构建 + Python 运行时）
- Flask 自动检测 `frontend/dist` 目录，如果存在则托管静态文件
- 容器内不包含 API Key，需在 Web 界面配置或挂载配置文件

**挂载建议：**
```bash
docker run -d \
  -p 12398:12398 \
  -v ./output:/app/output \  # 持久化生成的图片
  -v ./text_providers.yaml:/app/text_providers.yaml \  # 可选
  -v ./image_providers.yaml:/app/image_providers.yaml \  # 可选
  histonemax/redink:latest
```

---

## 许可协议

**个人使用：** CC BY-NC-SA 4.0（署名-非商业性使用-相同方式共享）

**商业使用：** 需联系作者获取授权（histonemax@gmail.com）

---

## 项目链接

- GitHub: https://github.com/goldenhawksu/RedInk
- Docker Hub: https://hub.docker.com/r/histonemax/redink
