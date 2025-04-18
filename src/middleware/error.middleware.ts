import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, createAppError } from '@src/shared/utils/errors/error.util';
import { NodeEnv } from '@src/shared/constants/app.constants';
import { env } from '@src/config/env.config';
import { Injectable } from '@src/shared/utils/typedi/typedi.util';
import {
  ExpressErrorMiddlewareInterface,
  Middleware,
} from 'routing-controllers';
/**
 * Global error handler middleware that intercepts and processes all errors
 * from the application, formats them appropriately, and returns a standardized
 * error response to the client.
 */
@Middleware({ type: 'after' })
@Injectable()
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  /**
   * Handles all errors in the application
   * @param error - Error that was thrown
   * @param request - Express request object
   * @param response - Express response object
   * @param next - Express next function
   */
  error(
    error: unknown,
    request: Request,
    response: Response,
    _next: NextFunction
  ): void {
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
    const context = {
      url: request.url,
      method: request.method,
      errorId: error.errorId,
      errorType: error.type,
      status: error.status,
    };

    // For now, just console log errors until a proper logger is implemented
    if (error.status >= 500) {
      // Server errors
      console.error(`Server error: ${error.message}`, context);
    } else if (error.status >= 400) {
      // Client errors
      console.warn(`Client error: ${error.message}`, context);
    } else {
      // Other errors
      console.info(`Error: ${error.message}`, context);
    }

    // In development, log the stack trace for easier debugging
    if (env.NODE_ENV !== NodeEnv.PROD && error.stack) {
      console.debug(`Stack trace: ${error.stack}`);
    }
  }
}
