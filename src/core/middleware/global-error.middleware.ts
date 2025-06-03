import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';
import { NextFunction, Request, Response } from 'express';
import { Injectable } from '@core/utils/di.util';
import { LoggerService } from '@core/services/logger.service';
import {
  fromZodError,
  InternalError,
  isZodError,
  isCognitoError,
  fromCognitoError,
  AppError,
} from '@sentientarts/errors';

/**
 * Global error handling middleware for the application
 *
 * This middleware captures all errors thrown during request processing,
 * normalizes them into a consistent format, and returns appropriate
 * HTTP responses with standardized error structures.
 */
@Middleware({ type: 'after' })
@Injectable()
export class GlobalErrorMiddleware implements ExpressErrorMiddlewareInterface {
  private readonly logger: LoggerService;

  /**
   * Creates a new GlobalErrorMiddleware instance
   *
   * @param loggerService - The logger service for logging errors
   */
  constructor(private readonly loggerService: LoggerService) {
    this.logger = loggerService.setContext('GlobalErrorMiddleware');
  }

  /**
   * Handles errors thrown during request processing
   *
   * @param error - The error that was thrown
   * @param _request - The Express request object
   * @param response - The Express response object
   * @param _next - The next middleware function
   */
  // eslint-disable-next-line max-params
  error(error: Error, _request: Request, response: Response, _next: NextFunction): void {
    const appError = this.normalizeError(error);

    // Log the error with additional context
    this.logger.error('Request error', {
      errorType: appError.constructor.name,
      status: appError.status,
      originalError: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    response.status(appError.status).json(appError.toResponse());
  }

  /**
   * Normalizes different error types into a consistent AppError format
   *
   * @param error - The error to normalize
   * @returns A standardized AppError instance
   */
  private normalizeError(error: unknown): AppError {
    // If it's already an AppError, return it directly
    if (error instanceof AppError) return error;

    // Handle Zod validation errors
    if (isZodError(error)) {
      return fromZodError(error, 'Validation error');
    }

    // Handle Cognito authentication/authorization errors
    else if (isCognitoError(error)) {
      return fromCognitoError(error);
    }

    // Handle all other errors as internal server errors
    else {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      // Log the unexpected error with stack trace for debugging
      this.logger.error('Unhandled error', {
        error: errorMessage,
        stack: errorStack,
      });

      return new InternalError('Internal server error');
    }
  }
}
