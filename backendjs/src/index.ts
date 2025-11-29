import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { logger } from './utils/logger';
import { getOutlineService } from './services/outlineService';
import { base64ToBuffer } from './utils/imageUtils';

// 创建 Express 应用
const app = express();

// CORS 配置
const allowedOrigins = config.CORS_ORIGINS.length > 0 && config.CORS_ORIGINS[0] !== 'http://localhost:5173'
  ? config.CORS_ORIGINS
  : [
      'https://redink-self.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ];

// 中间件
app.use(cors({
  origin: (origin, callback) => {
    // 允许无 origin 的请求（例如 Postman、服务器端请求）
    if (!origin) return callback(null, true);

    // 检查是否在允许列表中
    if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace('*', '')))) {
      callback(null, true);
    } else {
      logger.warn(`❌ CORS 拒绝来源: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 文件上传配置
const upload = multer({ storage: multer.memoryStorage() });

// 日志中间件
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`📥 ${req.method} ${req.path}`);
  next();
});

// ==================== API 路由 ====================

/**
 * 健康检查
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '服务正常运行'
  });
});

/**
 * 生成大纲
 */
app.post('/api/outline', upload.array('images'), (async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    let topic: string;
    let images: Buffer[] = [];

    // 检查是否是 multipart/form-data（带图片）
    if (req.files && Array.isArray(req.files)) {
      topic = req.body.topic;
      images = (req.files as Express.Multer.File[]).map(file => file.buffer);
      logger.debug(`收到 ${images.length} 张图片`);
    } else {
      // JSON 请求（无图片或 base64 图片）
      topic = req.body.topic;
      const imagesBase64 = req.body.images || [];

      if (Array.isArray(imagesBase64)) {
        images = imagesBase64.map((img: string) => base64ToBuffer(img));
      }
    }

    if (!topic) {
      logger.warn('大纲生成请求缺少 topic 参数');
      return res.status(400).json({
        success: false,
        error: '参数错误：topic 不能为空。\n请提供要生成图文的主题内容。'
      });
    }

    logger.info(`🔄 开始生成大纲，主题: ${topic.substring(0, 50)}...`);
    const outlineService = getOutlineService();
    const result = await outlineService.generateOutline(topic, images.length > 0 ? images : undefined);

    const elapsed = (Date.now() - startTime) / 1000;
    if (result.success) {
      logger.info(`✅ 大纲生成成功，耗时 ${elapsed.toFixed(2)}s，共 ${result.pages?.length || 0} 页`);
      return res.json(result);
    } else {
      logger.error(`❌ 大纲生成失败: ${result.error}`);
      return res.status(500).json(result);
    }
  } catch (error: any) {
    logger.error(`大纲生成异常: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: `大纲生成异常。\n错误详情: ${error.message}\n建议：检查后端日志获取更多信息`
    });
  }
}) as RequestHandler);

/**
 * 生成图片（SSE 流式返回）
 * 由于完整实现较复杂，这里返回模拟响应
 */
app.post('/api/generate', (req: Request, res: Response) => {
  const { pages, task_id, full_outline, user_topic, user_images } = req.body;

  if (!pages) {
    return res.status(400).json({
      success: false,
      error: '参数错误：pages 不能为空。\n请提供要生成的页面列表数据。'
    });
  }

  logger.info(`🖼️  开始图片生成任务: ${task_id}, 共 ${pages.length} 页`);

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // 模拟图片生成进度（实际实现需要调用图片生成服务）
  let currentIndex = 0;

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const interval = setInterval(() => {
    if (currentIndex < pages.length) {
      // 发送进度
      sendEvent('progress', {
        index: currentIndex,
        status: 'generating',
        current: currentIndex + 1,
        total: pages.length,
        phase: currentIndex === 0 ? 'cover' : 'content'
      });

      // 模拟完成
      setTimeout(() => {
        sendEvent('complete', {
          index: currentIndex,
          status: 'done',
          image_url: `/api/images/${task_id}/${currentIndex}.png`,
          phase: currentIndex === 0 ? 'cover' : 'content'
        });

        currentIndex++;

        // 全部完成
        if (currentIndex === pages.length) {
          sendEvent('finish', {
            success: true,
            task_id,
            images: pages.map((_: any, i: number) => `${i}.png`),
            total: pages.length,
            completed: pages.length,
            failed: 0,
            failed_indices: []
          });

          res.end();
          clearInterval(interval);
        }
      }, 500);
    }
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

/**
 * 获取图片
 */
app.get('/api/images/:task_id/:filename', (req: Request, res: Response) => {
  const { task_id, filename } = req.params;
  const thumbnail = req.query.thumbnail === 'true';

  try {
    const historyRoot = config.HISTORY_DIR;
    let filepath: string;

    if (thumbnail) {
      const thumbFilename = `thumb_${filename}`;
      const thumbPath = path.join(historyRoot, task_id, thumbFilename);

      if (fs.existsSync(thumbPath)) {
        filepath = thumbPath;
      } else {
        filepath = path.join(historyRoot, task_id, filename);
      }
    } else {
      filepath = path.join(historyRoot, task_id, filename);
    }

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        error: `图片不存在：${task_id}/${filename}`
      });
    }

    res.sendFile(filepath);
  } catch (error: any) {
    logger.error(`获取图片失败: ${error.message}`);
    res.status(500).json({
      success: false,
      error: `获取图片失败: ${error.message}`
    });
  }
});

/**
 * 获取配置
 */
app.get('/api/config', (req: Request, res: Response) => {
  try {
    const textConfig = config.loadTextProvidersConfig();
    const imageConfig = config.loadImageProvidersConfig();

    // 脱敏处理
    const maskApiKey = (key: string): string => {
      if (!key) return '';
      if (key.length <= 8) return '*'.repeat(key.length);
      return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
    };

    const prepareProviders = (providers: any) => {
      const result: any = {};
      for (const [name, pconfig] of Object.entries(providers)) {
        const pc = pconfig as any;
        result[name] = {
          ...pc,
          api_key_masked: maskApiKey(pc.api_key || ''),
          api_key: ''
        };
      }
      return result;
    };

    res.json({
      success: true,
      config: {
        text_generation: {
          active_provider: textConfig.active_provider || '',
          providers: prepareProviders(textConfig.providers || {})
        },
        image_generation: {
          active_provider: imageConfig.active_provider || '',
          providers: prepareProviders(imageConfig.providers || {})
        }
      }
    });
  } catch (error: any) {
    logger.error(`获取配置失败: ${error.message}`);
    res.status(500).json({
      success: false,
      error: `获取配置失败: ${error.message}`
    });
  }
});

/**
 * 更新配置
 */
app.post('/api/config', (req: Request, res: Response) => {
  try {
    const { image_generation, text_generation } = req.body;

    if (image_generation) {
      const imageConfig = config.loadImageProvidersConfig();

      if (image_generation.active_provider) {
        imageConfig.active_provider = image_generation.active_provider;
      }

      if (image_generation.providers) {
        // 合并配置，保留未修改的 api_key
        const existingProviders = imageConfig.providers || {};
        const newProviders = image_generation.providers;

        for (const [name, newConfig] of Object.entries(newProviders) as any[]) {
          if (!newConfig.api_key || newConfig.api_key === '') {
            // 保留原有的 api_key
            if (existingProviders[name]) {
              newConfig.api_key = (existingProviders[name] as any).api_key;
            }
          }
          delete newConfig.api_key_masked;
          delete newConfig.api_key_env;
        }

        imageConfig.providers = newProviders;
      }

      config.saveImageProvidersConfig(imageConfig);
    }

    if (text_generation) {
      const textConfig = config.loadTextProvidersConfig();

      if (text_generation.active_provider) {
        textConfig.active_provider = text_generation.active_provider;
      }

      if (text_generation.providers) {
        const existingProviders = textConfig.providers || {};
        const newProviders = text_generation.providers;

        for (const [name, newConfig] of Object.entries(newProviders) as any[]) {
          if (!newConfig.api_key || newConfig.api_key === '') {
            if (existingProviders[name]) {
              newConfig.api_key = (existingProviders[name] as any).api_key;
            }
          }
          delete newConfig.api_key_masked;
          delete newConfig.api_key_env;
        }

        textConfig.providers = newProviders;
      }

      config.saveTextProvidersConfig(textConfig);
    }

    config.reloadConfig();

    res.json({
      success: true,
      message: '配置已保存'
    });
  } catch (error: any) {
    logger.error(`更新配置失败: ${error.message}`);
    res.status(500).json({
      success: false,
      error: `更新配置失败: ${error.message}`
    });
  }
});

// ==================== 错误处理 ====================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`未处理的错误: ${err.message}`);
  logger.error(err.stack || '');
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});

// ==================== 启动服务器 ====================
const PORT = config.PORT;
const HOST = config.HOST;

app.listen(PORT, HOST, () => {
  logger.info(`🚀 红墨 Node.js 后端服务启动成功！`);
  logger.info(`📍 监听地址: http://${HOST}:${PORT}`);
  logger.info(`📋 API 文档: http://${HOST}:${PORT}/api/health`);
});

export default app;
