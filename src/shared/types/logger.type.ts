/**
 * LogLevel represents the valid log levels for the logger service and Pino.
 * Matches Pino's built-in levels for type safety and autocompletion.
 */
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
