import { Injectable } from '@src/shared/utils/typedi/typedi.util';
import pino from 'pino';
import createPinoEnricher from '@newrelic/pino-enricher';
import { LoggerOptions } from './logger.types';
import { DEFAULT_OPTIONS } from './logger.constants';
import { LoggerService } from './logger.service';
import { HttpLoggerService } from './http-logger.service';

@Injectable()
export class LoggerFactory {
  createLogger(options: LoggerOptions = {}): LoggerService {
    const config = { ...DEFAULT_OPTIONS, ...options };
    const pinoLogger = this.createPinoLogger(config);
    return new LoggerService(pinoLogger, config);
  }

  createHttpLogger(logger: LoggerService): HttpLoggerService {
    return new HttpLoggerService(logger);
  }

  private createPinoLogger(config: LoggerOptions): pino.Logger {
    const transport = config.pretty
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
      : {};

    const pinoOptions: pino.LoggerOptions = {
      name: config.name,
      level: config.level,
      ...transport,
      timestamp: pino.stdTimeFunctions.isoTime,
      enabled:
        process.env.NODE_ENV !== 'test' || process.env.LOG_IN_TESTS === 'true',
      base: {
        ...config.baseContext,
        env: process.env.NODE_ENV,
      },
    };

    // Add New Relic enricher if enabled
    if (config.newRelicEnabled) {
      const enricher = createPinoEnricher as (
        options: pino.LoggerOptions
      ) => pino.LoggerOptions;
      return pino(enricher(pinoOptions));
    }

    return pino(pinoOptions);
  }
}
