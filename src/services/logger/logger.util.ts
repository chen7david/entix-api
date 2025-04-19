import { AppError } from '@src/shared/utils/errors/error.util';
import { LogContext } from './logger.types';

export class ErrorLogFormatter {
  private readonly error: unknown;
  private readonly message?: string;
  private readonly context: LogContext;

  constructor(error: unknown, message?: string, context: LogContext = {}) {
    this.error = error;
    this.message = message;
    this.context = context;
  }

  format(): { formattedMessage: string; formattedContext: LogContext } {
    if (this.error instanceof AppError) {
      return this.formatAppError();
    } else if (this.error instanceof Error) {
      return this.formatStandardError();
    } else {
      return this.formatUnknownError();
    }
  }

  hasCause(): boolean {
    return this.error instanceof AppError && !!this.error.cause;
  }

  getCauseMessage(): string {
    if (this.error instanceof AppError && this.error.cause) {
      return `Caused by: ${this.error.cause.message}`;
    }
    return '';
  }

  getCauseContext(): LogContext {
    if (this.error instanceof AppError) {
      return { errorId: this.error.errorId, cause: true };
    }
    return {};
  }

  private formatAppError(): {
    formattedMessage: string;
    formattedContext: LogContext;
  } {
    const appError = this.error as AppError;
    const formattedContext = {
      ...this.context,
      errorId: appError.errorId,
      errorType: appError.type,
      status: appError.status,
      ...appError.logContext,
      ...(appError.details && appError.details.length > 0
        ? { details: appError.details }
        : {}),
    };

    const formattedMessage =
      this.message || `${appError.name}: ${appError.message}`;

    return { formattedMessage, formattedContext };
  }

  private formatStandardError(): {
    formattedMessage: string;
    formattedContext: LogContext;
  } {
    const error = this.error as Error;
    const formattedContext = {
      ...this.context,
      error: { name: error.name, stack: error.stack },
    };

    const formattedMessage = this.message || error.message;

    return { formattedMessage, formattedContext };
  }

  private formatUnknownError(): {
    formattedMessage: string;
    formattedContext: LogContext;
  } {
    const formattedContext = {
      ...this.context,
      error: this.error,
    };

    const formattedMessage = this.message || 'Unknown error occurred';

    return { formattedMessage, formattedContext };
  }
}
