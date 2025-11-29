import sharp from 'sharp';
import { logger } from './logger';

/**
 * 压缩图片到指定大小
 * @param imageBuffer 图片 Buffer
 * @param maxSizeKb 最大大小（KB）
 * @returns 压缩后的图片 Buffer
 */
export async function compressImage(imageBuffer: Buffer, maxSizeKb: number = 50): Promise<Buffer> {
  try {
    let quality = 80;
    let compressed = imageBuffer;

    // 循环降低质量直到满足大小要求
    while (compressed.length > maxSizeKb * 1024 && quality > 10) {
      compressed = await sharp(imageBuffer)
        .png({ quality, compressionLevel: 9 })
        .toBuffer();

      if (compressed.length > maxSizeKb * 1024) {
        quality -= 10;
      }
    }

    // 如果还是太大，则缩小尺寸
    if (compressed.length > maxSizeKb * 1024) {
      const metadata = await sharp(imageBuffer).metadata();
      const width = metadata.width || 1024;
      const newWidth = Math.floor(width * 0.8);

      compressed = await sharp(imageBuffer)
        .resize(newWidth)
        .png({ quality: 60, compressionLevel: 9 })
        .toBuffer();
    }

    logger.debug(`图片压缩: ${(imageBuffer.length / 1024).toFixed(1)}KB -> ${(compressed.length / 1024).toFixed(1)}KB`);
    return compressed;
  } catch (error) {
    logger.error(`图片压缩失败: ${error}`);
    return imageBuffer;
  }
}

/**
 * 转换 base64 字符串为 Buffer
 * @param base64String base64 字符串（可能包含 data:image/... 前缀）
 * @returns Buffer
 */
export function base64ToBuffer(base64String: string): Buffer {
  // 移除可能的 data URL 前缀
  if (base64String.includes(',')) {
    base64String = base64String.split(',')[1];
  }
  return Buffer.from(base64String, 'base64');
}

/**
 * 转换 Buffer 为 base64 字符串
 * @param buffer Buffer
 * @returns base64 字符串
 */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}
