import { NewRelicService } from '@shared/services/newrelic/newrelic.service';
import { Injectable } from '@shared/utils/ioc.util';
import pino, { Logger as PinoLogger } from 'pino';
import { ConfigService } from '@shared/services/config/config.service';
import { NodeEnv } from '@shared/constants/app.constants';
import type { LogLevel } from '@shared/types/logger.type';

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
export class LoggerService {
  private readonly logger: PinoLogger;

  /**
   * Constructs a new LoggerService instance.
   * Applies New Relic log enrichment in production using NewRelicService,
   * and pretty-printing in development. Follows latest best practices for Pino and New Relic integration.
   * @param configService - The configuration service instance
   * @param newRelicService - The New Relic enrichment service instance
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly newRelicService: NewRelicService,
  ) {
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
   * Get the underlying Pino logger instance.
   * @returns The Pino logger instance
   */
  getLogger(): PinoLogger {
    return this.logger;
  }

  /**
   * Log a message at the specified level.
   * @param options - Log options: level, msg, and optional meta
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
   * @param bindings - Key-value pairs to add to every log line
   * @returns A Pino child logger with the specified bindings
   */
  child(bindings: Record<string, unknown>): PinoLogger {
    return this.logger.child(bindings);
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
