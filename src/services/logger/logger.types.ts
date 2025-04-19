import { LogLevel } from './logger.constants';

/**
 * Logger context for adding structured data to logs
 */
export type LogContext = Record<string, unknown>;

/**
 * Configuration options for the logger
 */
export type LoggerOptions = {
  /** The name of the logger, typically the service or module name */
  name?: string;
  /** The minimum log level to output */
  level?: LogLevel;
  /** Whether to enable pretty printing in development */
  pretty?: boolean;
  /** Whether to enable New Relic integration */
  newRelicEnabled?: boolean;
  /** Base context to include with all logs */
  baseContext?: LogContext;
  /** Whether to enable request logging middleware */
  httpLoggingEnabled?: boolean;
};
