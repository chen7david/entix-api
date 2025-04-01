import { randomUUID } from 'crypto';
import { ZodError } from 'zod';
import {
  AppErrorOptions,
  ErrorDetail,
  ErrorResponse,
  HTTP_ERROR_MESSAGES,
} from '@src/utils/error/error.util.type';

/**
 * Base error class for all application errors
 */
export class AppError extends Error {
  /** HTTP status code */
  readonly status: number;
  /** Unique error ID for tracking in logs */
  readonly errorId: string;
  /** Original error that caused this error */
  readonly cause?: Error;
  /** Additional error details, e.g., for validation errors */
  readonly details: ErrorDetail[];
  /** Additional context for logging */
  readonly logContext: Record<string, unknown>;
  /** Whether the error details should be exposed to the client */
  readonly expose: boolean;
  /** Error type for categorization */
  readonly type: string;

  /**
   * Creates a new application error
   * @param options - Error configuration options
   */
  constructor(options: AppErrorOptions = {}) {
    const status = options.status || 500;
    const message = options.message || HTTP_ERROR_MESSAGES[status] || 'Unknown Error';

    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.errorId = randomUUID();
    this.cause = options.cause;
    this.details = options.details || [];
    this.logContext = options.logContext || {};
    this.expose = options.expose !== undefined ? options.expose : status < 500;
    this.type = this.constructor.name.replace(/Error$/, '').toLowerCase();

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converts the error to a client-safe response object
   * @returns Error response suitable for sending to clients
   */
  toResponse(): ErrorResponse {
    // Only include errorId for server errors (500+) that are masked
    const errorResponse: ErrorResponse = {
      status: this.status,
      type: this.type,
      message: this.expose
        ? this.message
        : HTTP_ERROR_MESSAGES[this.status] || 'Internal Server Error',
    };

    // Include errorId for internal errors to aid in troubleshooting
    if (this.status >= 500) {
      errorResponse.errorId = this.errorId;
    }

    // Include validation details if they exist and the error should be exposed
    if (this.expose && this.details.length > 0) {
      errorResponse.details = this.details;
    }

    return errorResponse;
  }

  /**
   * Creates an error from a ZodError validation error
   * @param zodError - Zod validation error
   * @param message - Optional custom message
   * @returns A validation error with formatted details
   */
  static fromZodError(zodError: ZodError, message = 'Validation failed'): ValidationError {
    const details: ErrorDetail[] = zodError.errors.map(err => ({
      path: Array.isArray(err.path) ? err.path.map(p => String(p)) : String(err.path),
      message: err.message,
      code: err.code,
    }));

    return new ValidationError({
      message,
      details,
      cause: zodError,
    });
  }
}

/**
 * Error thrown when a requested resource is not found
 */
export class NotFoundError extends AppError {
  constructor(options: AppErrorOptions = {}) {
    super({
      status: 404,
      message: options.message || 'Resource not found',
      ...options,
    });
  }
}

/**
 * Error thrown when a request is invalid or malformed
 */
export class BadRequestError extends AppError {
  constructor(options: AppErrorOptions = {}) {
    super({
      status: 400,
      message: options.message || 'Bad request',
      ...options,
    });
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends AppError {
  constructor(options: AppErrorOptions = {}) {
    super({
      status: 422,
      message: options.message || 'Validation failed',
      ...options,
    });
  }
}

/**
 * Error thrown when authentication is required but missing or invalid
 */
export class UnauthorizedError extends AppError {
  constructor(options: AppErrorOptions = {}) {
    super({
      status: 401,
      message: options.message || 'Authentication required',
      ...options,
    });
  }
}

/**
 * Error thrown when the user lacks permission for the requested operation
 */
export class ForbiddenError extends AppError {
  constructor(options: AppErrorOptions = {}) {
    super({
      status: 403,
      message: options.message || 'Access denied',
      ...options,
    });
  }
}

/**
 * Error thrown when a conflict occurs (e.g., duplicate resource)
 */
export class ConflictError extends AppError {
  constructor(options: AppErrorOptions = {}) {
    super({
      status: 409,
      message: options.message || 'Resource conflict',
      ...options,
    });
  }
}

/**
 * Error thrown when a service is unavailable or times out
 */
export class ServiceError extends AppError {
  constructor(options: AppErrorOptions = {}) {
    super({
      status: 503,
      message: options.message || 'Service unavailable',
      ...options,
      expose: false, // Mask service errors by default
    });
  }
}

/**
 * Error thrown for any internal server error
 */
export class InternalError extends AppError {
  constructor(options: AppErrorOptions = {}) {
    super({
      status: 500,
      message: options.message || 'Internal server error',
      ...options,
      expose: false, // Mask internal errors by default
    });
  }
}

/**
 * Creates an appropriate application error from any error
 * @param error - Original error to convert
 * @returns An AppError instance
 */
export function createAppError(error: unknown): AppError {
  // Already an AppError, return as is
  if (error instanceof AppError) {
    return error;
  }

  // Handle ZodError validation errors
  if (error instanceof ZodError) {
    return AppError.fromZodError(error);
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return new InternalError({
      message: 'An unexpected error occurred',
      cause: error,
      logContext: {
        originalError: {
          name: error.name,
          message: error.message,
        },
      },
    });
  }

  // Handle non-Error objects
  return new InternalError({
    message: 'An unknown error occurred',
    logContext: {
      originalError: error,
    },
  });
}
