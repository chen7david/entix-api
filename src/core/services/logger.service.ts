import { Injectable } from '@core/utils/di.util';
import { ConfigService } from '@core/services/config.service';
import pino, { Logger as PinoLogger } from 'pino';
import { enrichWithNewRelic } from '@core/utils/newrelic-pino.util';

@Injectable()
export class LoggerService {
  private readonly logger: PinoLogger;

  constructor(
    private readonly configService: ConfigService,
    loggerInstance?: PinoLogger,
  ) {
    this.logger = loggerInstance ?? pino(this.getPinoConfig());
  }

  private getPinoConfig() {
    let options: pino.LoggerOptions = {
      level: this.configService.get('LOG_LEVEL'),
    };

    if (this.configService.isDevelopment()) {
      options.transport = {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      };
      options.timestamp = pino.stdTimeFunctions.isoTime;
    }

    if (this.configService.isNewRelicEnabled() && this.configService.isProduction()) {
      options = enrichWithNewRelic(options);
    }

    return options;
  }

  setContext(moduleName: string) {
    const childLogger = this.logger.child({ module: moduleName });
    return new LoggerService(this.configService, childLogger);
  }

  /**
   * Log a fatal message.
   * @param msg - Log message
   * @param meta - Optional metadata
   */
  fatal(msg: string, meta?: unknown): void {
    this.logger.fatal(meta, msg);
  }

  /**
   * Log an error message.
   * @param msg - Log message
   * @param meta - Optional metadata
   */
  error(msg: string, meta?: unknown): void {
    this.logger.error(meta, msg);
  }

  /**
   * Log a warning message.
   * @param msg - Log message
   * @param meta - Optional metadata
   */
  warn(msg: string, meta?: unknown): void {
    this.logger.warn(meta, msg);
  }

  /**
   * Log an info message.
   * @param msg - Log message
   * @param meta - Optional metadata
   */
  info(msg: string, meta?: unknown): void {
    this.logger.info(meta, msg);
  }

  /**
   * Log a debug message.
   * @param msg - Log message
   * @param meta - Optional metadata
   */
  debug(msg: string, meta?: unknown): void {
    this.logger.debug(meta, msg);
  }

  /**
   * Log a trace message.
   * @param msg - Log message
   * @param meta - Optional metadata
   */
  trace(msg: string, meta?: unknown): void {
    this.logger.trace(meta, msg);
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
