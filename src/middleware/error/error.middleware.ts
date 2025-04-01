import { Request, Response, NextFunction } from 'express';
import { ExpressErrorMiddlewareInterface, Middleware } from 'routing-controllers';
import { ZodError } from 'zod';
import { logger } from '@src/services/logger/logger.service';
import { AppError, createAppError } from '@src/utils/error/error.util';
import { Environment } from '@src/app/app.constant';
import { env } from '@src/config/env.config';
import { Injectable } from '@src/utils/di/di.util';

/**
 * Global error handler middleware that intercepts and processes all errors
 * from the application, formats them appropriately, and returns a standardized
 * error response to the client.
 */
@Injectable()
@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  /**
   * Handles all errors in the application
   * @param error - Error that was thrown
   * @param request - Express request object
   * @param response - Express response object
   * @param next - Express next function
   */
  error(error: unknown, request: Request, response: Response, next: NextFunction): void {
    // Convert to AppError for consistent handling
    const appError = this.normalizeError(error);

    // Log the error
    this.logError(appError, request);

    // Send standardized response
    const errorResponse = appError.toResponse();

    // Set status and send error response
    response.status(appError.status).json(errorResponse);
  }

  /**
   * Normalizes any error into an AppError
   * @param error - Error to normalize
   * @returns Normalized AppError
   */
  private normalizeError(error: unknown): AppError {
    // Handle common error types
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof ZodError) {
      return AppError.fromZodError(error);
    }

    // Convert any other error type to an AppError
    return createAppError(error);
  }

  /**
   * Logs the error with appropriate context and level
   * @param error - AppError to log
   * @param request - Express request object
   */
  private logError(error: AppError, request: Request): void {
    // Create log context with request details
    const logContext = logger.createRequestContext(request);

    // Add error details to context
    const context = {
      ...logContext,
      ...error.logContext,
      errorId: error.errorId,
      errorType: error.type,
      status: error.status,
    };

    // Include the original error if available
    if (error.cause) {
      context.error = error.cause;
    }

    // Choose log level based on error severity
    if (error.status >= 500) {
      // Server errors are logged as errors
      logger.error(`Server error: ${error.message}`, context);
    } else if (error.status >= 400) {
      // Client errors are logged as warnings
      logger.warn(`Client error: ${error.message}`, context);
    } else {
      // Other errors are logged as info
      logger.info(`Error: ${error.message}`, context);
    }

    // In development, log the stack trace for easier debugging
    if (env.NODE_ENV !== Environment.PRODUCTION && error.stack) {
      logger.debug(`Stack trace: ${error.stack}`, context);
    }
  }
}
