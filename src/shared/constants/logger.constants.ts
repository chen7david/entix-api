/**
 * The allowed log levels for the logger.
 * This is the single source of truth for log levels.
 */
export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];
