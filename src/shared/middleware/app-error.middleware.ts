import { ExpressErrorMiddlewareInterface, Middleware } from 'routing-controllers';
import { AppError, createAppError } from '@src/shared/utils/error/error.util';
import { LoggerService } from '@shared/services/logger/logger.service';
import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '@shared/types/error.types';
import { Injectable } from '@shared/utils/ioc.util';
import { ZodError } from 'zod';

/**
 * Global error handler middleware that intercepts and processes all errors
 * from the application, formats them appropriately, and returns a standardized
 * error response to the client.
 */
@Middleware({ type: 'after' })
@Injectable()
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  constructor(private readonly logger: LoggerService) {}
  /**
   * Handles all errors in the application
   * @param error - Error that was thrown
   * @param request - Express request object
   * @param response - Express response object
   * @param _next - Express next function
   */
  /* eslint-disable-next-line max-params */
  error(error: unknown, request: Request, response: Response, _next: NextFunction): void {
    // Convert to AppError for consistent handling
    const appError = this.normalizeError(error);

    // Log the error
    this.logError(appError, request);

    // Send standardized response
    const errorResponse: ErrorResponse = appError.toResponse();
    response.status(appError.status).json(errorResponse);
  }

  /**
   * Normalizes any error into an AppError
   * @param error - Error to normalize
   * @returns Normalized AppError
   */
  private normalizeError(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (error instanceof ZodError) return AppError.fromZodError(error);
    return createAppError(error);
  }

  /**
   * Logs the error with appropriate context and level
   * @param error - AppError to log
   * @param request - Express request object
   */
  private logError(error: AppError, request: Request): void {
    const context = {
      url: request.url,
      method: request.method,
      errorId: error.errorId,
      errorType: error.type,
      status: error.status,
      ...error.logContext,
    };
    if (error.status >= 500) {
      this.logger.log({ level: 'error', msg: error.message, meta: context });
    } else if (error.status >= 400) {
      this.logger.log({ level: 'warn', msg: error.message, meta: context });
    } else {
      this.logger.log({ level: 'info', msg: error.message, meta: context });
    }
    if (process.env.NODE_ENV !== 'prod' && error.stack) {
      this.logger.log({
        level: 'debug',
        msg: 'Stack trace',
        meta: { stack: error.stack, ...context },
      });
    }
  }
}
