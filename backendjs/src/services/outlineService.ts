import fs from 'fs';
import path from 'path';
import { Page, OutlineResult } from '../types';
import { config } from '../config';
import { TextClient } from '../utils/textClient';
import { logger } from '../utils/logger';

/**
 * 大纲生成服务
 */
export class OutlineService {
  private textClient: TextClient;
  private promptTemplate: string;

  constructor() {
    logger.debug('初始化 OutlineService...');

    // 获取文本服务商配置
    const textConfig = config.getTextProviderConfig();
    this.textClient = new TextClient(textConfig);

    // 加载提示词模板
    const promptPath = path.join(__dirname, '..', 'prompts', 'outline_prompt.txt');
    this.promptTemplate = fs.readFileSync(promptPath, 'utf-8');

    logger.info(`OutlineService 初始化完成`);
  }

  /**
   * 生成大纲
   */
  async generateOutline(topic: string, images?: Buffer[]): Promise<OutlineResult> {
    try {
      logger.info(`开始生成大纲: topic=${topic.substring(0, 50)}..., images=${images?.length || 0}`);

      let prompt = this.promptTemplate.replace('{topic}', topic);

      if (images && images.length > 0) {
        prompt += `\n\n注意：用户提供了 ${images.length} 张参考图片，请在生成大纲时考虑这些图片的内容和风格。`;
        logger.debug(`添加了 ${images.length} 张参考图片到提示词`);
      }

      // 获取配置
      const textConfig = config.getTextProviderConfig();
      const model = textConfig.model || 'gpt-4o';
      const temperature = textConfig.temperature || 1.0;
      const maxTokens = textConfig.max_output_tokens || 8000;

      logger.info(`调用文本生成 API: model=${model}, temperature=${temperature}`);
      const outlineText = await this.textClient.generateText({
        prompt,
        model,
        temperature,
        max_output_tokens: maxTokens,
        images
      });

      logger.debug(`API 返回文本长度: ${outlineText.length} 字符`);
      const pages = this.parseOutline(outlineText);
      logger.info(`大纲解析完成，共 ${pages.length} 页`);

      return {
        success: true,
        outline: outlineText,
        pages,
        has_images: images !== undefined && images.length > 0
      };
    } catch (error: any) {
      const errorMsg = error.message;
      logger.error(`大纲生成失败: ${errorMsg}`);

      // 根据错误类型提供详细错误信息
      let detailedError: string;
      if (errorMsg.includes('api_key') || errorMsg.includes('unauthorized') || errorMsg.includes('401')) {
        detailedError = `API 认证失败。\n错误详情: ${errorMsg}\n可能原因:\n1. API Key 无效或已过期\n2. API Key 没有访问该模型的权限\n解决方案：在系统设置页面检查并更新 API Key`;
      } else if (errorMsg.includes('model') || errorMsg.includes('404')) {
        detailedError = `模型访问失败。\n错误详情: ${errorMsg}\n可能原因:\n1. 模型名称不正确\n2. 没有访问该模型的权限\n解决方案：在系统设置页面检查模型名称配置`;
      } else if (errorMsg.includes('timeout') || errorMsg.includes('连接')) {
        detailedError = `网络连接失败。\n错误详情: ${errorMsg}\n可能原因:\n1. 网络连接不稳定\n2. API 服务暂时不可用\n解决方案：检查网络连接，稍后重试`;
      } else if (errorMsg.includes('rate') || errorMsg.includes('429') || errorMsg.includes('quota')) {
        detailedError = `API 配额限制。\n错误详情: ${errorMsg}\n可能原因:\n1. API 调用次数超限\n2. 账户配额用尽\n解决方案：等待配额重置，或升级 API 套餐`;
      } else {
        detailedError = `大纲生成失败。\n错误详情: ${errorMsg}\n建议：检查配置文件 text_providers.yaml`;
      }

      return {
        success: false,
        error: detailedError
      };
    }
  }

  /**
   * 解析大纲文本为页面列表
   */
  private parseOutline(outlineText: string): Page[] {
    // 按 <page> 分割页面
    let pagesRaw: string[];
    if (outlineText.includes('<page>')) {
      pagesRaw = outlineText.split(/<page>/i);
    } else {
      // 向后兼容：使用 --- 分隔
      pagesRaw = outlineText.split('---');
    }

    const pages: Page[] = [];

    pagesRaw.forEach((pageText, index) => {
      pageText = pageText.trim();
      if (!pageText) return;

      let pageType: 'cover' | 'content' | 'summary' = 'content';
      const typeMatch = pageText.match(/^\[(\S+)\]/);

      if (typeMatch) {
        const typeCn = typeMatch[1];
        const typeMapping: Record<string, 'cover' | 'content' | 'summary'> = {
          '封面': 'cover',
          '内容': 'content',
          '总结': 'summary'
        };
        pageType = typeMapping[typeCn] || 'content';
      }

      pages.push({
        index,
        type: pageType,
        content: pageText
      });
    });

    return pages;
  }
}

// 导出单例
let outlineServiceInstance: OutlineService | null = null;

export function getOutlineService(): OutlineService {
  if (!outlineServiceInstance) {
    outlineServiceInstance = new OutlineService();
  }
  return outlineServiceInstance;
}
