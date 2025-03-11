import pino from 'pino';
import { env } from '@/config/env.config';
import { Environment } from '@src/types/app.types';

// Define log levels type for better type safety
type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

// Configure base logger options
const baseLogger = pino({
  level: env.NODE_ENV !== Environment.Production ? 'debug' : 'info',
  transport:
    env.NODE_ENV !== Environment.Production
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l',
          },
        }
      : undefined,
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Add service name for distributed systems
  name: 'entix-api',
});

/**
 * Logger service class that provides structured logging capabilities
 */
export class Logger {
  private context?: string;
  private logger: pino.Logger;

  constructor(context?: string) {
    this.context = context;
    this.logger = context ? baseLogger.child({ context }) : baseLogger;
  }

  /**
   * Creates a new logger instance with the specified context
   */
  public setContext(context: string): Logger {
    return new Logger(context);
  }

  /**
   * Log at the specified level with additional metadata
   */
  private log(level: LogLevel, message: string, meta: Record<string, unknown> = {}): void {
    this.logger[level]({ ...meta }, message);
  }

  /**
   * Fatal level logging
   */
  public fatal(message: string, meta?: Record<string, unknown>): void {
    this.log('fatal', message, meta);
  }

  /**
   * Error level logging
   */
  public error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    this.log('error', message, {
      ...meta,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : undefined,
    });
  }

  /**
   * Warn level logging
   */
  public warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

  /**
   * Info level logging
   */
  public info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  /**
   * Debug level logging
   */
  public debug(message: string, meta?: Record<string, unknown>): void {
    this.log('debug', message, meta);
  }

  /**
   * Trace level logging
   */
  public trace(message: string, meta?: Record<string, unknown>): void {
    this.log('trace', message, meta);
  }
}

// Export a default logger instance
export const logger = new Logger();
