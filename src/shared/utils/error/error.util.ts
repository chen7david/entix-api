import { AppErrorOptions, ErrorDetail, ErrorResponse } from '@shared/types/error.type';
import { HTTP_ERROR_MESSAGES } from '@shared/constants/error.constants';
import { randomUUID } from 'crypto';
import { ZodError } from 'zod';

/**
 * Base error class for all application errors
 */
export class AppError extends Error {
  readonly status: number;
  readonly errorId: string;
  readonly cause?: Error;
  readonly details: ErrorDetail[];
  readonly logContext: Record<string, unknown>;
  readonly expose: boolean;
  readonly type: string;

  /**
   * Create an AppError with a message or options object.
   * @param messageOrOptions Error message string or options object
   */
  constructor(message: string);
  constructor(options?: AppErrorOptions);
  constructor(messageOrOptions?: string | AppErrorOptions) {
    let options: AppErrorOptions;
    if (typeof messageOrOptions === 'string') {
      options = { message: messageOrOptions };
    } else {
      options = messageOrOptions || {};
    }
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
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converts the error to a client-safe response object
   */
  toResponse(): ErrorResponse {
    const errorResponse: ErrorResponse = {
      status: this.status,
      type: this.type,
      message: this.expose
        ? this.message
        : HTTP_ERROR_MESSAGES[this.status] || 'Internal Server Error',
    };
    if (this.status >= 500) {
      errorResponse.errorId = this.errorId;
    }
    if (this.expose && this.details.length > 0) {
      errorResponse.details = this.details;
    }
    return errorResponse;
  }

  /**
   * Creates an error from a ZodError validation error
   */
  static fromZodError(zodError: ZodError, message = 'Validation failed'): ValidationError {
    const details: ErrorDetail[] = zodError.errors.map((err) => ({
      path: Array.isArray(err.path) ? err.path.map((p) => String(p)) : String(err.path),
      message: err.message,
      code: err.code,
    }));
    return new ValidationError({ message, details, cause: zodError });
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      errorId: this.errorId,
      type: this.type,
      details: this.details,
      ...(process.env.NODE_ENV !== 'prod' && { stack: this.stack }),
    };
  }
}

export class NotFoundError extends AppError {
  constructor(message?: string);
  constructor(options?: AppErrorOptions);
  constructor(arg?: string | AppErrorOptions) {
    if (typeof arg === 'string') {
      super({ status: 404, message: arg });
    } else {
      super({ status: 404, ...arg });
    }
  }
}
export class BadRequestError extends AppError {
  constructor(message?: string);
  constructor(options?: AppErrorOptions);
  constructor(arg?: string | AppErrorOptions) {
    if (typeof arg === 'string') {
      super({ status: 400, message: arg });
    } else {
      super({ status: 400, ...arg });
    }
  }
}
export class ValidationError extends AppError {
  constructor(message?: string);
  constructor(options?: AppErrorOptions);
  constructor(arg?: string | AppErrorOptions) {
    if (typeof arg === 'string') {
      super({ status: 422, message: arg });
    } else {
      super({ status: 422, ...arg });
    }
  }
}
export class UnauthorizedError extends AppError {
  constructor(message?: string);
  constructor(options?: AppErrorOptions);
  constructor(arg?: string | AppErrorOptions) {
    if (typeof arg === 'string') {
      super({ status: 401, message: arg });
    } else {
      super({ status: 401, ...arg });
    }
  }
}
export class ForbiddenError extends AppError {
  constructor(message?: string);
  constructor(options?: AppErrorOptions);
  constructor(arg?: string | AppErrorOptions) {
    if (typeof arg === 'string') {
      super({ status: 403, message: arg });
    } else {
      super({ status: 403, ...arg });
    }
  }
}
export class ConflictError extends AppError {
  constructor(message?: string);
  constructor(options?: AppErrorOptions);
  constructor(arg?: string | AppErrorOptions) {
    if (typeof arg === 'string') {
      super({ status: 409, message: arg });
    } else {
      super({ status: 409, ...arg });
    }
  }
}
export class ServiceError extends AppError {
  constructor(message?: string);
  constructor(options?: AppErrorOptions);
  constructor(arg?: string | AppErrorOptions) {
    if (typeof arg === 'string') {
      super({ status: 503, message: arg, expose: false });
    } else {
      super({ status: 503, expose: false, ...arg });
    }
  }
}
export class InternalError extends AppError {
  constructor(message?: string);
  constructor(options?: AppErrorOptions);
  constructor(arg?: string | AppErrorOptions) {
    if (typeof arg === 'string') {
      super({ status: 500, message: arg, expose: false });
    } else {
      super({ status: 500, expose: false, ...arg });
    }
  }
}
export class RateLimitError extends AppError {
  constructor(message?: string);
  constructor(options?: AppErrorOptions);
  constructor(arg?: string | AppErrorOptions) {
    if (typeof arg === 'string') {
      super({ status: 429, message: arg });
    } else {
      super({ status: 429, ...arg });
    }
  }
}

/**
 * Creates an appropriate application error from any error
 */
export function createAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof ZodError) return AppError.fromZodError(error);
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
  return new InternalError({
    message: 'An unknown error occurred',
    logContext: { originalError: error },
  });
}
