// src/services/logger/logger.service.ts
import { Injectable } from '@src/shared/utils/typedi/typedi.util';
import pino from 'pino';
import { AppError } from '@src/shared/utils/errors/error.util';
import { LogContext, LoggerOptions } from './logger.types';
import { ErrorLogFormatter } from './logger.util';
import { LogLevel } from './logger.constants';

@Injectable()
export class LoggerService {
  constructor(
    private logger: pino.Logger,
    private options: LoggerOptions = {}
  ) {}

  getPinoLogger(): pino.Logger {
    return this.logger;
  }

  createContext(context: LogContext): LoggerService {
    const childLogger = new LoggerService(
      this.logger.child(context),
      this.options
    );
    return childLogger;
  }

  forComponent(component: string, context: LogContext = {}): LoggerService {
    return this.createContext({ component, ...context });
  }

  private log(
    level: LogLevel,
    message: string,
    context: LogContext = {}
  ): void {
    this.logger[level](context, message);
  }

  trace(message: string, context: LogContext = {}): void {
    this.log(LogLevel.TRACE, message, context);
  }

  debug(message: string, context: LogContext = {}): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context: LogContext = {}): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context: LogContext = {}): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(
    error: AppError | Error | unknown,
    message?: string,
    context: LogContext = {}
  ): void {
    const errorFormatter = new ErrorLogFormatter(error, message, context);
    const { formattedMessage, formattedContext } = errorFormatter.format();
    this.logger.error(formattedContext, formattedMessage);

    if (errorFormatter.hasCause()) {
      this.logger.error(
        errorFormatter.getCauseContext(),
        errorFormatter.getCauseMessage()
      );
    }
  }

  fatal(message: string, context: LogContext = {}): void {
    this.log(LogLevel.FATAL, message, context);
  }

  logStart(operation: string, context: LogContext = {}): void {
    this.info(`Starting ${operation}`, {
      event: 'start',
      operation,
      ...context,
    });
  }

  logSuccess(
    operation: string,
    durationMs?: number,
    context: LogContext = {}
  ): void {
    this.info(
      `Completed ${operation}${durationMs ? ` in ${durationMs}ms` : ''}`,
      {
        event: 'success',
        operation,
        ...(durationMs ? { durationMs } : {}),
        ...context,
      }
    );
  }

  logFailure(
    operation: string,
    error: AppError | Error | unknown,
    context: LogContext = {}
  ): void {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    this.error(error, `Failed ${operation}: ${errorMessage}`, {
      event: 'failure',
      operation,
      ...context,
    });
  }
}
