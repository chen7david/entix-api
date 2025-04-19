import { LoggerOptions } from './logger.types';
import { env } from '@src/config/env.config';
import { NodeEnv } from '@src/shared/constants/app.constants';

export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * Default configuration for the logger
 */
export const DEFAULT_OPTIONS: LoggerOptions = {
  name: env.APP_NAME || 'app',
  level: env.LOG_LEVEL || LogLevel.INFO,
  pretty: env.NODE_ENV !== NodeEnv.PROD,
  newRelicEnabled: env.NEW_RELIC_ENABLED === true,
  baseContext: {},
  httpLoggingEnabled: true,
};
