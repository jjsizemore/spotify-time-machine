/**
 * Winston Logger Configuration
 * Centralized logging utility for the application with multiple transports
 * and structured logging support
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as Sentry from '@sentry/nextjs';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each log level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Helper to strip ANSI color codes
const stripAnsiColors = (text: string): string => {
  // Using a string constructor to avoid eslint control-regex warning
  const ansiPattern = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');
  return text.replace(ansiPattern, '');
};

// Custom format for development with emojis
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    // Strip ANSI color codes from log level
    const levelWithoutColors = stripAnsiColors(info.level);
    const emoji = {
      error: '❌',
      warn: '⚠️',
      info: 'ℹ️',
      http: '🌐',
      debug: '🐛',
    }[levelWithoutColors] || '📝';

    const message = typeof info.message === 'object' 
      ? JSON.stringify(info.message, null, 2) 
      : info.message;

    let log = `${emoji} [${info.timestamp}] ${info.level}: ${message}`;

    // Add metadata if present
    const metadata: Record<string, any> = { ...info };
    delete metadata.level;
    delete metadata.message;
    delete metadata.timestamp;
    delete metadata.label;

    if (Object.keys(metadata).length > 0) {
      log += `\n  ${JSON.stringify(metadata, null, 2)}`;
    }

    return log;
  })
);

// Production format - structured JSON
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports array
const transports: winston.transport[] = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  })
);

// File transports (only in production or if explicitly enabled)
const enableFileLogging = process.env.ENABLE_FILE_LOGGING === 'true' || process.env.NODE_ENV === 'production';

if (enableFileLogging && typeof window === 'undefined') {
  // Only enable file logging on server-side
  
  // Error log file with rotation
  transports.push(
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: prodFormat,
    })
  );

  // Combined log file with rotation
  transports.push(
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      format: prodFormat,
    })
  );

  // HTTP log file for API requests
  transports.push(
    new DailyRotateFile({
      filename: 'logs/http-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxSize: '20m',
      maxFiles: '7d',
      format: prodFormat,
    })
  );
}

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Stream for Morgan or other HTTP loggers
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper to log errors to Sentry
const logErrorToSentry = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    contexts: {
      logger: {
        ...context,
      },
    },
  });
};

// Enhanced logger methods with Sentry integration
export const log = {
  error: (message: string, error?: Error | unknown, context?: Record<string, any>) => {
    logger.error(message, { ...context, error: error instanceof Error ? error.stack : error });
    
    // Send errors to Sentry
    if (error instanceof Error) {
      logErrorToSentry(error, { message, ...context });
    } else if (error) {
      logErrorToSentry(new Error(message), { originalError: error, ...context });
    }
  },

  warn: (message: string, context?: Record<string, any>) => {
    logger.warn(message, context);
  },

  info: (message: string, context?: Record<string, any>) => {
    logger.info(message, context);
  },

  http: (message: string, context?: Record<string, any>) => {
    logger.http(message, context);
  },

  debug: (message: string, context?: Record<string, any>) => {
    logger.debug(message, context);
  },

  // Specialized logging methods
  auth: (message: string, context?: Record<string, any>) => {
    logger.info(message, { ...context, category: 'auth' });
  },

  api: (message: string, context?: Record<string, any>) => {
    logger.http(message, { ...context, category: 'api' });
  },

  spotify: (message: string, context?: Record<string, any>) => {
    logger.info(message, { ...context, category: 'spotify' });
  },

  performance: (message: string, context?: Record<string, any>) => {
    logger.info(message, { ...context, category: 'performance' });
  },

  security: (message: string, context?: Record<string, any>) => {
    logger.warn(message, { ...context, category: 'security' });
  },
};

// Export the base logger for advanced usage
export default logger;
