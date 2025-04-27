import { Injectable } from '@shared/utils/ioc.util';
import pino, { Logger as PinoLogger } from 'pino';
import { ConfigService } from '@shared/services/config/config.service';
import { NodeEnv } from '@shared/constants/app.constants';
import type { LogLevel } from '@shared/types/logger.type';
import type { NewRelicPinoEnricher } from '@shared/types/newrelic.type';

// Create a function to get the New Relic enricher
function getNrPinoEnricher(): NewRelicPinoEnricher {
  if (process.env.NODE_ENV === NodeEnv.TEST) {
    // Mock implementation for tests
    return () => ({});
  }

  try {
    // Use dynamic import for better compatability with various bundlers
    // Ignoring the next line because the linter doesn't like dynamic imports
    // but it's the most compatible way to handle conditional imports
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const importedModule = globalThis.require?.('@newrelic/pino-enricher');
    return importedModule || (() => ({}));
  } catch {
    // Fallback if module not available
    return () => ({});
  }
}

// Get the New Relic enricher once at module load time
const nrPinoEnricher = getNrPinoEnricher();

export * from 'pino';
/**
 * LoggerService provides a singleton, environment-aware logger using Pino.
 * It supports pretty-printing in development and structured JSON in production.
 * In production, it enriches logs with New Relic metadata for APM integration.
 * Use LogLevel string literal type for type safety and direct compatibility with Pino.
 */
@Injectable()
export class LoggerService {
  private readonly logger: PinoLogger;

  constructor(private readonly configService: ConfigService) {
    const level: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
    const nodeEnv = this.configService.get('NODE_ENV') as NodeEnv;
    const isDev = nodeEnv === NodeEnv.DEVELOPMENT;
    const isTest = nodeEnv === NodeEnv.TEST;
    console.log({ key: configService.get('NEW_RELIC_APP_NAME') });
    // Configure logger options based on environment
    if (isDev) {
      // Development: use pretty printing
      this.logger = pino({
        level,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            levelFirst: true,
            translateTime: 'SYS:standard',
          },
        },
      });
    } else if (isTest) {
      // Test: minimal logging
      this.logger = pino({
        level: 'silent', // Silence logs during tests
      });
    } else {
      // Production: JSON logs with New Relic enrichment
      this.logger = pino({
        level,
        timestamp: pino.stdTimeFunctions.isoTime,
        ...nrPinoEnricher({
          attributes: {
            service: configService.get('NEW_RELIC_APP_NAME') || 'prod-entix-api',
            environment: nodeEnv,
          },
        }),
      });
    }
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
   * Cleanup method for extensibility (e.g., flush logs, close streams).
   * Important for New Relic to ensure all logs are sent before application exit.
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
