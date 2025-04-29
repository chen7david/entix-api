import { NewRelicService } from '@shared/services/newrelic/newrelic.service';
import { Injectable } from '@shared/utils/ioc.util';
import pino, { Logger as PinoLogger } from 'pino';
import { ConfigService } from '@shared/services/config/config.service';
import { NodeEnv } from '@shared/constants/app.constants';
import type { Logger, LogLevel } from '@shared/types/logger.type';

export * from 'pino';

/**
 * LoggerService provides a singleton, environment-aware logger using Pino.
 * It supports pretty-printing in development and structured JSON in production.
 * Log enrichment with New Relic is enabled in production if NEW_RELIC_ENABLED is set.
 *
 * @remarks
 * - Uses LogLevel type for type safety and direct compatibility with Pino.
 * - All logs are written to stdout by default.
 */
@Injectable()
export class LoggerService implements Logger {
  private readonly logger: PinoLogger;

  /**
   * Constructs a new LoggerService instance.
   * Applies New Relic log enrichment in production using NewRelicService,
   * and pretty-printing in development. Follows latest best practices for Pino and New Relic integration.
   * @param configService - The configuration service instance
   * @param newRelicService - The New Relic enrichment service instance
   * @param pinoLogger - (optional) A Pino logger instance, for child loggers
   * @remarks
   * @eslint-disable-next-line max-params Justified for DI and child logger injection.
   */
  // eslint-disable-next-line max-params
  constructor(
    private readonly configService: ConfigService,
    private readonly newRelicService: NewRelicService,
    pinoLogger?: PinoLogger,
  ) {
    if (pinoLogger) {
      this.logger = pinoLogger;
      return;
    }
    const nodeEnv = this.configService.get('NODE_ENV');
    const logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
    const enableNewRelic =
      nodeEnv === NodeEnv.PRODUCTION && this.configService.get('NEW_RELIC_ENABLED');

    // Base options
    const pinoOptions: pino.LoggerOptions = { level: logLevel };

    // Environment-specific options
    if (nodeEnv === NodeEnv.DEVELOPMENT) {
      pinoOptions.transport = {
        target: 'pino-pretty',
        options: { colorize: true },
      };
      pinoOptions.timestamp = pino.stdTimeFunctions.isoTime;
    }

    // Use NewRelicService to enrich options if needed
    const enrichedOptions = this.newRelicService.enrichLoggerOptions({
      options: pinoOptions,
      enabled: enableNewRelic,
    });
    this.logger = pino(enrichedOptions);
  }

  /**
   * Log a message at the specified level. Private, use level-specific methods instead.
   * @param level - Log level
   * @param msg - Log message
   * @param meta - Optional metadata
   * @remarks
   * @eslint-disable-next-line max-params Justified for internal utility.
   */
  // eslint-disable-next-line max-params
  private log(level: LogLevel, msg: string, meta?: unknown): void {
    if (meta !== undefined) {
      this.logger[level](meta, msg);
    } else {
      this.logger[level](msg);
    }
  }

  /**
   * Log a fatal message.
   * @param msg - Log message
   * @param meta - Optional metadata
   */
  fatal(msg: string, meta?: unknown): void {
    this.log('fatal', msg, meta);
  }

  /**
   * Log an error message.
   * @param msg - Log message
   * @param meta - Optional metadata
   */
  error(msg: string, meta?: unknown): void {
    this.log('error', msg, meta);
  }

  /**
   * Log a warning message.
   * @param msg - Log message
   * @param meta - Optional metadata
   */
  warn(msg: string, meta?: unknown): void {
    this.log('warn', msg, meta);
  }

  /**
   * Log an info message.
   * @param msg - Log message
   * @param meta - Optional metadata
   */
  info(msg: string, meta?: unknown): void {
    this.log('info', msg, meta);
  }

  /**
   * Log a debug message.
   * @param msg - Log message
   * @param meta - Optional metadata
   */
  debug(msg: string, meta?: unknown): void {
    this.log('debug', msg, meta);
  }

  /**
   * Log a trace message.
   * @param msg - Log message
   * @param meta - Optional metadata
   */
  trace(msg: string, meta?: unknown): void {
    this.log('trace', msg, meta);
  }

  /**
   * Create a child logger with additional bindings.
   * Returns a new LoggerService instance with the child logger.
   * @param bindings - Key-value pairs to add to every log line
   * @returns A Logger instance with the specified bindings
   */
  child(bindings: Record<string, unknown>): Logger {
    const childLogger = this.logger.child(bindings);
    return new LoggerService(this.configService, this.newRelicService, childLogger);
  }

  /**
   * Create a child logger with a component binding.
   * Returns a new LoggerService instance with the component set.
   * @param component - The component name (e.g., 'UserService')
   * @returns A Logger instance with the component binding
   */
  component(component: string): Logger {
    return this.child({ component });
  }

  /**
   * Cleanup method for future extensibility (e.g., flush logs, close streams).
   * Currently a no-op, but ready for New Relic or other integrations.
   */
  async cleanup(): Promise<void> {
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
