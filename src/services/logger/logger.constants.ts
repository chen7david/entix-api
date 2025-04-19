import { LoggerOptions } from './logger.types';
// import { env } from '@src/config/env.config';
// import { NodeEnv } from '@src/shared/constants/app.constants';

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
  name: 'app',
  level: LogLevel.INFO,
  pretty: true,
  newRelicEnabled: false,
  baseContext: {},
  httpLoggingEnabled: true,
};
