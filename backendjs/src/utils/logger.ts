import winston from 'winston';

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `\n${timestamp} | ${level.toUpperCase().padEnd(8)} | ${message}`;

    if (Object.keys(meta).length > 0 && meta.stack) {
      log += `\n  └─ ${meta.stack}`;
    }

    return log;
  })
);

// 创建 logger 实例
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: logFormat,
  transports: [
    new winston.transports.Console()
  ]
});

// 设置不同模块的日志级别
logger.debug('日志系统初始化完成');
