import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import { logger } from '../utils/logger';
import { ProvidersConfig, TextProviderConfig, ImageProviderConfig } from '../types';

/**
 * 配置管理类
 */
export class Config {
  private static instance: Config;
  private textProvidersConfig: ProvidersConfig | null = null;
  private imageProvidersConfig: ProvidersConfig | null = null;

  // 配置文件路径
  private readonly textConfigPath: string;
  private readonly imageConfigPath: string;

  // 服务器配置
  public readonly PORT: number;
  public readonly HOST: string;
  public readonly CORS_ORIGINS: string[];
  public readonly HISTORY_DIR: string;

  private constructor() {
    // 从环境变量读取配置
    this.PORT = parseInt(process.env.PORT || '12399', 10);
    this.HOST = process.env.HOST || '0.0.0.0';
    this.CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',');

    // 配置文件路径（相对于项目根目录）
    const rootDir = path.join(__dirname, '..', '..');
    this.textConfigPath = path.join(rootDir, '..', 'text_providers.yaml');
    this.imageConfigPath = path.join(rootDir, '..', 'image_providers.yaml');
    this.HISTORY_DIR = path.join(rootDir, '..', 'history');

    // 确保历史记录目录存在
    if (!fs.existsSync(this.HISTORY_DIR)) {
      fs.mkdirSync(this.HISTORY_DIR, { recursive: true });
    }
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * 从环境变量加载文本配置
   */
  private loadTextConfigFromEnv(): ProvidersConfig | null {
    const baseUrl = process.env.TEXT_BASE_URL;
    const apiKey = process.env.TEXT_API_KEY;
    const model = process.env.TEXT_MODEL || 'gemini-2.5-flash';

    if (apiKey) {
      logger.info('从环境变量加载文本配置');

      // 根据是否有 base_url 判断类型
      const providerType = baseUrl ? 'openai_compatible' : 'google_gemini';
      const providerName = baseUrl ? 'env_provider' : 'gemini';

      const provider: any = {
        type: providerType,
        api_key: apiKey,
        model: model,
        temperature: parseFloat(process.env.TEXT_TEMPERATURE || '1.0'),
        max_output_tokens: parseInt(process.env.TEXT_MAX_TOKENS || '8000', 10)
      };

      if (baseUrl) {
        provider.base_url = baseUrl;
      }

      return {
        active_provider: providerName,
        providers: {
          [providerName]: provider
        }
      };
    }

    return null;
  }

  /**
   * 加载文本生成配置
   */
  public loadTextProvidersConfig(): ProvidersConfig {
    if (this.textProvidersConfig !== null) {
      return this.textProvidersConfig;
    }

    // 优先使用环境变量
    const envConfig = this.loadTextConfigFromEnv();
    if (envConfig) {
      this.textProvidersConfig = envConfig;
      return this.textProvidersConfig;
    }

    logger.debug(`加载文本配置: ${this.textConfigPath}`);

    if (!fs.existsSync(this.textConfigPath)) {
      logger.warn(`文本配置文件不存在: ${this.textConfigPath}，使用默认配置`);
      this.textProvidersConfig = {
        active_provider: 'google_gemini',
        providers: {}
      };
      return this.textProvidersConfig;
    }

    try {
      const fileContent = fs.readFileSync(this.textConfigPath, 'utf8');
      this.textProvidersConfig = yaml.load(fileContent) as ProvidersConfig || {
        active_provider: 'google_gemini',
        providers: {}
      };
      logger.debug(`文本配置加载成功: ${Object.keys(this.textProvidersConfig.providers).join(', ')}`);
      return this.textProvidersConfig;
    } catch (e) {
      logger.error(`文本配置文件 YAML 解析失败: ${e}`);
      throw new Error(
        `配置文件格式错误: text_providers.yaml\n` +
        `YAML 解析错误: ${e}\n` +
        `解决方案: 检查 YAML 缩进和语法`
      );
    }
  }

  /**
   * 从环境变量加载图片配置
   */
  private loadImageConfigFromEnv(): ProvidersConfig | null {
    const baseUrl = process.env.IMAGE_BASE_URL;
    const apiKey = process.env.IMAGE_API_KEY;
    const model = process.env.IMAGE_MODEL || 'gemini-3-pro-image-preview';

    if (apiKey) {
      logger.info('从环境变量加载图片配置');

      // 根据是否有 base_url 判断类型
      const providerType = baseUrl ? 'image_api' : 'google_genai';
      const providerName = baseUrl ? 'env_provider' : 'gemini';

      const provider: any = {
        type: providerType,
        api_key: apiKey,
        model: model,
        high_concurrency: process.env.IMAGE_HIGH_CONCURRENCY === 'true'
      };

      if (baseUrl) {
        provider.base_url = baseUrl;
      }

      return {
        active_provider: providerName,
        providers: {
          [providerName]: provider
        }
      };
    }

    return null;
  }

  /**
   * 加载图片生成配置
   */
  public loadImageProvidersConfig(): ProvidersConfig {
    if (this.imageProvidersConfig !== null) {
      return this.imageProvidersConfig;
    }

    // 优先使用环境变量
    const envConfig = this.loadImageConfigFromEnv();
    if (envConfig) {
      this.imageProvidersConfig = envConfig;
      return this.imageProvidersConfig;
    }

    logger.debug(`加载图片配置: ${this.imageConfigPath}`);

    if (!fs.existsSync(this.imageConfigPath)) {
      logger.warn(`图片配置文件不存在: ${this.imageConfigPath}，使用默认配置`);
      this.imageProvidersConfig = {
        active_provider: 'google_genai',
        providers: {}
      };
      return this.imageProvidersConfig;
    }

    try {
      const fileContent = fs.readFileSync(this.imageConfigPath, 'utf8');
      this.imageProvidersConfig = yaml.load(fileContent) as ProvidersConfig || {
        active_provider: 'google_genai',
        providers: {}
      };
      logger.debug(`图片配置加载成功: ${Object.keys(this.imageProvidersConfig.providers).join(', ')}`);
      return this.imageProvidersConfig;
    } catch (e) {
      logger.error(`图片配置文件 YAML 解析失败: ${e}`);
      throw new Error(
        `配置文件格式错误: image_providers.yaml\n` +
        `YAML 解析错误: ${e}\n` +
        `解决方案: 检查 YAML 缩进和语法`
      );
    }
  }

  /**
   * 获取激活的图片服务商
   */
  public getActiveImageProvider(): string {
    const config = this.loadImageProvidersConfig();
    const active = config.active_provider || 'google_genai';
    logger.debug(`当前激活的图片服务商: ${active}`);
    return active;
  }

  /**
   * 获取图片服务商配置
   */
  public getImageProviderConfig(providerName?: string): ImageProviderConfig {
    const config = this.loadImageProvidersConfig();

    if (!providerName) {
      providerName = this.getActiveImageProvider();
    }

    logger.info(`获取图片服务商配置: ${providerName}`);

    const providers = config.providers;
    if (!providers || Object.keys(providers).length === 0) {
      throw new Error(
        '未找到任何图片生成服务商配置。\n' +
        '解决方案:\n' +
        '1. 在系统设置页面添加图片生成服务商\n' +
        '2. 或手动编辑 image_providers.yaml 文件\n' +
        '3. 确保文件中有 providers 字段'
      );
    }

    if (!(providerName in providers)) {
      const available = Object.keys(providers).join(', ') || '无';
      logger.error(`图片服务商 [${providerName}] 不存在，可用服务商: ${available}`);
      throw new Error(
        `未找到图片生成服务商配置: ${providerName}\n` +
        `可用的服务商: ${available}\n` +
        '解决方案:\n' +
        '1. 在系统设置页面添加该服务商\n' +
        '2. 或修改 active_provider 为已存在的服务商\n' +
        '3. 检查 image_providers.yaml 文件'
      );
    }

    const providerConfig = providers[providerName] as ImageProviderConfig;

    // 验证必要字段
    if (!providerConfig.api_key) {
      logger.error(`图片服务商 [${providerName}] 未配置 API Key`);
      throw new Error(
        `服务商 ${providerName} 未配置 API Key\n` +
        '解决方案:\n' +
        '1. 在系统设置页面编辑该服务商，填写 API Key\n' +
        '2. 或手动在 image_providers.yaml 中添加 api_key 字段'
      );
    }

    const providerType = providerConfig.type || providerName;
    if (['openai', 'openai_compatible', 'image_api'].includes(providerType)) {
      if (!providerConfig.base_url) {
        logger.error(`服务商 [${providerName}] 类型为 ${providerType}，但未配置 base_url`);
        throw new Error(
          `服务商 ${providerName} 未配置 Base URL\n` +
          `服务商类型 ${providerType} 需要配置 base_url\n` +
          '解决方案: 在系统设置页面编辑该服务商，填写 Base URL'
        );
      }
    }

    logger.info(`图片服务商配置验证通过: ${providerName} (type=${providerType})`);
    return providerConfig;
  }

  /**
   * 获取文本服务商配置
   */
  public getTextProviderConfig(providerName?: string): TextProviderConfig {
    const config = this.loadTextProvidersConfig();

    if (!providerName) {
      providerName = config.active_provider || 'google_gemini';
    }

    logger.info(`获取文本服务商配置: ${providerName}`);

    const providers = config.providers;
    if (!providers || Object.keys(providers).length === 0) {
      throw new Error(
        '未找到任何文本生成服务商配置。\n' +
        '解决方案:\n' +
        '1. 在系统设置页面添加文本生成服务商\n' +
        '2. 或手动编辑 text_providers.yaml 文件'
      );
    }

    if (!(providerName in providers)) {
      const available = Object.keys(providers).join(', ') || '无';
      logger.error(`文本服务商 [${providerName}] 不存在，可用: ${available}`);
      throw new Error(
        `未找到文本生成服务商配置: ${providerName}\n` +
        `可用的服务商: ${available}\n` +
        '解决方案: 在系统设置中选择一个可用的服务商'
      );
    }

    const providerConfig = providers[providerName] as TextProviderConfig;

    if (!providerConfig.api_key) {
      logger.error(`文本服务商 [${providerName}] 未配置 API Key`);
      throw new Error(
        `文本服务商 ${providerName} 未配置 API Key\n` +
        '解决方案: 在系统设置页面编辑该服务商，填写 API Key'
      );
    }

    logger.info(`使用文本服务商: ${providerName} (type=${providerConfig.type})`);
    return providerConfig;
  }

  /**
   * 保存配置到文件
   */
  public saveTextProvidersConfig(config: ProvidersConfig): void {
    try {
      const yamlStr = yaml.dump(config);
      fs.writeFileSync(this.textConfigPath, yamlStr, 'utf8');
      this.textProvidersConfig = null; // 清除缓存
      logger.info('文本配置已保存');
    } catch (e) {
      logger.error(`保存文本配置失败: ${e}`);
      throw new Error(`保存配置失败: ${e}`);
    }
  }

  /**
   * 保存图片配置到文件
   */
  public saveImageProvidersConfig(config: ProvidersConfig): void {
    try {
      const yamlStr = yaml.dump(config);
      fs.writeFileSync(this.imageConfigPath, yamlStr, 'utf8');
      this.imageProvidersConfig = null; // 清除缓存
      logger.info('图片配置已保存');
    } catch (e) {
      logger.error(`保存图片配置失败: ${e}`);
      throw new Error(`保存配置失败: ${e}`);
    }
  }

  /**
   * 重新加载配置（清除缓存）
   */
  public reloadConfig(): void {
    logger.info('重新加载所有配置...');
    this.textProvidersConfig = null;
    this.imageProvidersConfig = null;
  }
}

export const config = Config.getInstance();
