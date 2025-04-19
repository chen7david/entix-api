import { Injectable } from '@src/shared/utils/typedi/typedi.util';
import { ConfigService } from '../config/config.service';
import pino, { Logger } from 'pino';
import { NodeEnv } from '@src/shared/constants/app.constants';
import { LogLevel } from '@src/shared/constants/logger.constants';

/**
 * LoggerService provides application-wide logging with context support.
 * Use getChildLogger to create a logger with contextual bindings.
 */
@Injectable()
export class LoggerService {
  private logger: Logger;

  constructor(private readonly config: ConfigService) {
    this.logger = pino(this.getPinoConfig());
  }

  /**
   * Returns the Pino logger configuration based on environment.
   */
  private getPinoConfig(): pino.LoggerOptions {
    return this.config.env.NODE_ENV === NodeEnv.DEV
      ? {
          level: this.config.env.LOG_LEVEL,
          transport: {
            target: 'pino-pretty',
          },
        }
      : {
          level: this.config.env.LOG_LEVEL,
        };
  }

  /**
   * Returns a child logger with additional context.
   * @param context - Key-value pairs to include in every log line.
   */
  public getChildLogger(context: Record<string, unknown>): Logger {
    return this.logger.child(context);
  }

  /**
   * Internal log method to route all log calls through a single point.
   * @param level - The log level (from LogLevel enum).
   * @param message - The log message.
   * @param args - Additional arguments (objects, interpolation values, etc.).
   */
  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    this.logger[level](message, ...args);
  }

  /**
   * Logs a trace-level message.
   */
  public trace(message: string, ...args: unknown[]): void {
    this.log(LogLevel.TRACE, message, ...args);
  }

  /**
   * Logs a debug-level message.
   */
  public debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  /**
   * Logs an info-level message.
   */
  public info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  /**
   * Logs a warn-level message.
   */
  public warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  /**
   * Logs an error-level message.
   */
  public error(message: string, ...args: unknown[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  /**
   * Logs a fatal-level message.
   */
  public fatal(message: string, ...args: unknown[]): void {
    this.log(LogLevel.FATAL, message, ...args);
  }
}
