import axios, { AxiosInstance } from 'axios';
import { TextProviderConfig } from '../types';
import { logger } from './logger';
import { base64ToBuffer, bufferToBase64, compressImage } from './imageUtils';

/**
 * 文本生成客户端 - 支持 OpenAI 兼容接口和 Google Gemini
 */
export class TextClient {
  private apiKey: string;
  private baseUrl: string;
  private endpoint: string;
  private axiosInstance: AxiosInstance;
  private providerType: string;

  constructor(config: TextProviderConfig) {
    this.apiKey = config.api_key;
    this.providerType = config.type;

    if (!this.apiKey) {
      throw new Error('Text API Key 未配置。解决方案：在系统设置页面编辑文本生成服务商，填写 API Key');
    }

    // 配置基础 URL 和端点
    this.baseUrl = (config.base_url || 'https://api.openai.com').replace(/\/$/, '').replace(/\/v1$/, '');
    this.endpoint = '/v1/chat/completions';

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000
    });
  }

  /**
   * 生成文本
   */
  async generateText(params: {
    prompt: string;
    model?: string;
    temperature?: number;
    max_output_tokens?: number;
    images?: Buffer[];
  }): Promise<string> {
    const { prompt, model = 'gpt-4o', temperature = 1.0, max_output_tokens = 8000, images } = params;

    try {
      // 如果是 Google Gemini,使用专门的客户端
      if (this.providerType === 'google_gemini') {
        return await this.generateWithGemini(prompt, model, temperature, max_output_tokens, images);
      }

      // OpenAI 兼容接口
      const content = await this.buildContentWithImages(prompt, images);

      const payload = {
        model,
        messages: [{ role: 'user', content }],
        temperature,
        max_tokens: max_output_tokens
      };

      logger.debug(`调用文本生成 API: ${this.baseUrl}${this.endpoint}`);
      const response = await this.axiosInstance.post(this.endpoint, payload);

      return response.data.choices[0].message.content;
    } catch (error: any) {
      logger.error(`文本生成失败: ${error.message}`);
      throw new Error(`文本生成失败: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * 使用 Google Gemini 生成文本
   */
  private async generateWithGemini(
    prompt: string,
    model: string,
    temperature: number,
    maxTokens: number,
    images?: Buffer[]
  ): Promise<string> {
    try {
      // 动态导入 Google GenAI SDK
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const geminiModel = genAI.getGenerativeModel({ model });

      // 构建内容
      const parts: any[] = [{ text: prompt }];

      if (images && images.length > 0) {
        for (const img of images) {
          // 压缩图片
          const compressed = await compressImage(img, 200);
          parts.push({
            inlineData: {
              mimeType: 'image/png',
              data: bufferToBase64(compressed)
            }
          });
        }
      }

      const result = await geminiModel.generateContent({
        contents: [{ parts, role: 'user' }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      });

      return result.response.text();
    } catch (error: any) {
      logger.error(`Gemini 文本生成失败: ${error.message}`);
      throw new Error(`Gemini 生成失败: ${error.message}`);
    }
  }

  /**
   * 构建包含图片的内容
   */
  private async buildContentWithImages(text: string, images?: Buffer[]): Promise<string | any[]> {
    if (!images || images.length === 0) {
      return text;
    }

    const content: any[] = [{ type: 'text', text }];

    for (const img of images) {
      // 压缩图片
      const compressed = await compressImage(img, 200);
      const base64Data = bufferToBase64(compressed);
      content.push({
        type: 'image_url',
        image_url: { url: `data:image/png;base64,${base64Data}` }
      });
    }

    return content;
  }
}
