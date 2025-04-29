/**
 * LogLevel represents the valid log levels for the logger service and Pino.
 * Matches Pino's built-in levels for type safety and autocompletion.
 */
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

/**
 * Logger defines the public logging interface for LoggerService and its children.
 * Only exposes level-specific methods, child, component, and cleanup.
 */
export type Logger = {
  /** Log a fatal message */
  fatal(msg: string, meta?: unknown): void;
  /** Log an error message */
  error(msg: string, meta?: unknown): void;
  /** Log a warning message */
  warn(msg: string, meta?: unknown): void;
  /** Log an info message */
  info(msg: string, meta?: unknown): void;
  /** Log a debug message */
  debug(msg: string, meta?: unknown): void;
  /** Log a trace message */
  trace(msg: string, meta?: unknown): void;
  /** Create a child logger with additional bindings */
  child(bindings: Record<string, unknown>): Logger;
  /** Create a child logger with a component binding */
  component(component: string): Logger;
  /** Cleanup method for flushing logs, etc. */
  cleanup(): Promise<void>;
};
