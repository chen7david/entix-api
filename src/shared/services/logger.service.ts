import { Injectable } from '@shared/utils/ioc.util';
import pino, { Logger as PinoLogger } from 'pino';
import { ConfigService } from '@shared/services/config.service';
import { NodeEnv } from '../constants/app.constants';
import type { LogLevel } from '@shared/types/logger.types';

export * from 'pino';
/**
 * LoggerService provides a singleton, environment-aware logger using Pino.
 * It supports pretty-printing in development and structured JSON in production.
 * Use LogLevel string literal type for type safety and direct compatibility with Pino.
 */
@Injectable()
export class LoggerService {
  private readonly logger: PinoLogger;

  constructor(private readonly configService: ConfigService) {
    const level: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
    // Use pino-pretty in development, JSON in production
    const isDev = this.configService.get('NODE_ENV') === NodeEnv.DEVELOPMENT;
    this.logger = pino({
      level,
      ...(isDev
        ? {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                levelFirst: true,
                translateTime: 'SYS:standard',
              },
            },
          }
        : {
            timestamp: pino.stdTimeFunctions.isoTime,
          }),
    });
  }

  /**
   * Get the underlying Pino logger instance.
   */
  getLogger(): PinoLogger {
    return this.logger;
  }

  /**
   * Log a message at the specified level.
   * @param options Log options: level, msg, and optional meta
   */
  log(options: { level: LogLevel; msg: string; meta?: unknown }): void {
    const { level, msg, meta } = options;
    if (meta !== undefined) {
      this.logger[level](meta, msg);
    } else {
      this.logger[level](msg);
    }
  }

  /**
   * Create a child logger with additional bindings.
   * @param bindings Key-value pairs to add to every log line
   */
  child(bindings: Record<string, unknown>): PinoLogger {
    return this.logger.child(bindings);
  }

  /**
   * Cleanup method for future extensibility (e.g., flush logs, close streams).
   * Currently a no-op, but ready for New Relic or other integrations.
   */
  async cleanup(): Promise<void> {
    // If using async transports or integrations, flush/close here
    if (typeof this.logger.flush === 'function') {
      await new Promise<void>((resolve, reject) => {
        this.logger.flush((err?: Error) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }
}
