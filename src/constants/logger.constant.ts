/**
 * Log levels supported by the logger
 */
export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
  SILENT = 'silent',
}

/**
 * Destination types for logger output
 */
export enum LogDestination {
  STDOUT = 'stdout',
  FILE = 'file',
  CUSTOM = 'custom',
}
