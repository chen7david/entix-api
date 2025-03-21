import pino, { Logger, LoggerOptions, DestinationStream } from 'pino';
import { randomUUID } from 'crypto';
import { Environment } from '@src/constants/app.constant';
import { env } from '@src/config/env.config';
import { LogLevel } from '@src/constants/logger.constant';
import { Injectable } from '@src/utils/typedi.util';
import pinoHttp from 'pino-http';

/**
 * Configuration options for the logger
 */
export type LoggerConfig = {
  /** Log level to use */
  level?: LogLevel;
  /** Application environment */
  env?: string;
  /** Application name */
  appName?: string;
  /** Enable pretty printing in development */
  prettyPrint?: boolean;
  /** Base path to remove from file paths */
  basePath?: string;
  /** Custom destination stream */
  destination?: DestinationStream;
  /** Include timestamps in logs */
  timestamp?: boolean;
  /** Additional base fields to include in every log */
  baseFields?: Record<string, unknown>;
  /** Enable New Relic enricher */
  enableNewRelic?: boolean;
};

/**
 * Context type for additional metadata in logs
 */
export type LogContext = Record<string, unknown> & {
  /** Optional correlation ID for request tracing */
  correlationId?: string;
  /** Optional component or module name */
  component?: string;
  /** Optional user ID for user-related logs */
  userId?: string;
  /** Optional tenant ID for multi-tenant applications */
  tenantId?: string;
  /** Optional error to include in the log */
  error?: Error;
};

/**
 * Logger service for application-wide logging
 */
@Injectable()
export class LoggerService {
  private logger: Logger;
  private defaultContext: LogContext = {};

  /**
   * Creates a new logger instance
   * @param config - Logger configuration options
   */
  constructor(config: LoggerConfig = {}) {
    let options: LoggerOptions = {
      level: config.level || LogLevel.INFO,
      base: {
        app: config.appName || env.APP_NAME,
        env: config.env || env.NODE_ENV,
        ...config.baseFields,
      },
      timestamp: config.timestamp !== false,
      // For development, use more readable logs
      ...(config.prettyPrint && env.NODE_ENV !== Environment.PRODUCTION
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            },
          }
        : {}),
    };

    // Apply New Relic enricher if enabled
    const useNewRelic = config.enableNewRelic ?? env.NEW_RELIC_ENABLED;
    if (env.NODE_ENV === Environment.PRODUCTION && useNewRelic) {
      try {
        const nrPino = require('@newrelic/pino-enricher');
        options = nrPino(options);
      } catch (error) {
        console.error('Failed to initialize New Relic enricher:', error);
      }
    }

    // Initialize the logger
    this.logger = config.destination ? pino(options, config.destination) : pino(options);
  }

  /**
   * Creates a child logger with additional context
   * @param context - Context to include in all logs from this child
   * @returns A new logger service instance with the merged context
   */
  child(context: LogContext): LoggerService {
    const childLogger = new LoggerService();
    childLogger.logger = this.logger.child(context);
    childLogger.defaultContext = { ...this.defaultContext, ...context };
    return childLogger;
  }

  /**
   * Generates a unique correlation ID for request tracking
   * @returns A new UUID
   */
  generateCorrelationId(): string {
    return randomUUID();
  }

  /**
   * Logs a message at TRACE level
   * @param message - Log message
   * @param context - Additional context for this specific log
   */
  trace(message: string, context: LogContext = {}): void {
    this.logger.trace(this.mergeContext(context), message);
  }

  /**
   * Logs a message at DEBUG level
   * @param message - Log message
   * @param context - Additional context for this specific log
   */
  debug(message: string, context: LogContext = {}): void {
    this.logger.debug(this.mergeContext(context), message);
  }

  /**
   * Logs a message at INFO level
   * @param message - Log message
   * @param context - Additional context for this specific log
   */
  info(message: string, context: LogContext = {}): void {
    this.logger.info(this.mergeContext(context), message);
  }

  /**
   * Logs a message at WARN level
   * @param message - Log message
   * @param context - Additional context for this specific log
   */
  warn(message: string, context: LogContext = {}): void {
    this.logger.warn(this.mergeContext(context), message);
  }

  /**
   * Logs a message at ERROR level
   * @param message - Log message
   * @param context - Additional context for this specific log
   */
  error(message: string, context: LogContext = {}): void {
    // Extract error from context if provided and serialize it
    if (context.error instanceof Error) {
      const { error, ...restContext } = context;
      this.logger.error(
        {
          ...this.mergeContext(restContext),
          err: {
            message: error.message,
            name: error.name,
            stack: error.stack,
            ...(error as any), // Include any custom properties on the error
          },
        },
        message,
      );
      return;
    }

    this.logger.error(this.mergeContext(context), message);
  }

  /**
   * Logs a message at FATAL level
   * @param message - Log message
   * @param context - Additional context for this specific log
   */
  fatal(message: string, context: LogContext = {}): void {
    this.logger.fatal(this.mergeContext(context), message);
  }

  /**
   * Creates a context with request information for HTTP logging
   * @param req - HTTP request object
   * @returns Context with request information
   */
  createRequestContext(req: any): LogContext {
    // Extract existing correlation ID or generate a new one
    const correlationId =
      req.headers?.['x-correlation-id'] ||
      req.headers?.['x-request-id'] ||
      this.generateCorrelationId();

    return {
      correlationId,
      method: req.method,
      url: req.url,
      userAgent: req.headers?.['user-agent'],
      ip: req.ip || req.connection?.remoteAddress,
    };
  }

  /**
   * Gets the raw Pino logger instance
   * @returns The underlying Pino logger
   */
  getRawLogger(): Logger {
    return this.logger;
  }

  /**
   * Merges the default context with provided context
   * @param context - Context to merge with default context
   * @returns Merged context
   */
  private mergeContext(context: LogContext): LogContext {
    return { ...this.defaultContext, ...context };
  }
}

/**
 * Creates a default logger instance
 * @param config - Optional configuration for the logger
 * @returns A configured LoggerService instance
 */
export const createLogger = (config: LoggerConfig = {}): LoggerService => {
  return new LoggerService({
    level: env.LOG_LEVEL || LogLevel.INFO,
    appName: env.APP_NAME || 'app',
    env: env.NODE_ENV,
    prettyPrint: env.NODE_ENV !== Environment.PRODUCTION,
    enableNewRelic: env.NEW_RELIC_ENABLED,
    ...config,
  });
};

/**
 * Default logger instance for application-wide use
 */
export const logger = createLogger();

/**
 * Creates a Pino HTTP logger instance
 * @returns A Pino HTTP logger instance
 */
export const httpLogger = pinoHttp({ logger: logger.getRawLogger() });
