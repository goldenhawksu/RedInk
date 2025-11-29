/**
 * 通用类型定义
 */

// 页面类型
export type PageType = 'cover' | 'content' | 'summary';

// 页面数据接口
export interface Page {
  index: number;
  type: PageType;
  content: string;
}

// 大纲生成结果
export interface OutlineResult {
  success: boolean;
  outline?: string;
  pages?: Page[];
  has_images?: boolean;
  error?: string;
}

// 图片生成进度事件
export interface ImageGenerationEvent {
  event: 'progress' | 'complete' | 'error' | 'finish' | 'retry_start' | 'retry_finish';
  data: {
    index?: number;
    status?: string;
    message?: string;
    current?: number;
    total?: number;
    phase?: string;
    image_url?: string;
    retryable?: boolean;
    success?: boolean;
    task_id?: string;
    images?: string[];
    completed?: number;
    failed?: number;
    failed_indices?: number[];
  };
}

// 文本生成服务商配置
export interface TextProviderConfig {
  type: 'google_gemini' | 'openai_compatible';
  api_key: string;
  base_url?: string;
  model: string;
  temperature?: number;
  max_output_tokens?: number;
}

// 图片生成服务商配置
export interface ImageProviderConfig {
  type: 'google_genai' | 'openai_compatible' | 'image_api';
  api_key: string;
  base_url?: string;
  model: string;
  high_concurrency?: boolean;
  default_aspect_ratio?: string;
  default_size?: string;
  temperature?: number;
  quality?: string;
  short_prompt?: boolean;
}

// YAML 配置文件结构
export interface ProvidersConfig {
  active_provider: string;
  providers: Record<string, TextProviderConfig | ImageProviderConfig>;
}

// 历史记录
export interface HistoryRecord {
  id: string;
  title: string;
  topic: string;
  outline: Page[];
  images?: {
    task_id: string;
    files: string[];
  };
  status: 'generating' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  thumbnail?: string;
}

// 任务状态
export interface TaskState {
  pages: Page[];
  generated: Record<number, string>;
  failed: Record<number, string>;
  cover_image: Buffer | null;
  full_outline: string;
  user_images: Buffer[] | null;
  user_topic: string;
}

// API 响应
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
