import { ZodError, z } from 'zod';
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalError,
  NotFoundError,
  ServiceError,
  UnauthorizedError,
  ValidationError,
  createAppError,
} from './error.util';
import { AppErrorOptions } from './error.util.types';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create an error with default values', () => {
      const error = new AppError();

      expect(error).toBeInstanceOf(Error);
      expect(error.status).toBe(500);
      expect(error.message).toBe('Internal Server Error');
      expect(error.details).toEqual([]);
      expect(error.expose).toBe(false);
      expect(error.errorId).toBeDefined();
      expect(error.type).toBe('app');
    });

    it('should create an error with custom values', () => {
      const cause = new Error('Original error');
      const details = [{ path: 'field', message: 'Invalid value' }];
      const logContext = { userId: '123' };

      const error = new AppError({
        status: 400,
        message: 'Custom message',
        cause,
        details,
        logContext,
        expose: true,
      });

      expect(error.status).toBe(400);
      expect(error.message).toBe('Custom message');
      expect(error.cause).toBe(cause);
      expect(error.details).toBe(details);
      expect(error.logContext).toBe(logContext);
      expect(error.expose).toBe(true);
      expect(error.type).toBe('app');
    });

    it('should set expose to true for client errors by default', () => {
      const clientError = new AppError({ status: 400 });
      expect(clientError.expose).toBe(true);

      const serverError = new AppError({ status: 500 });
      expect(serverError.expose).toBe(false);
    });
  });

  describe('toResponse', () => {
    it('should return exposed error details for client errors', () => {
      const error = new BadRequestError({
        message: 'Invalid data',
        details: [{ path: 'field', message: 'Required field' }],
      });

      const response = error.toResponse();

      expect(response).toEqual({
        status: 400,
        type: 'badrequest',
        message: 'Invalid data',
        details: [{ path: 'field', message: 'Required field' }],
      });
    });

    it('should mask server error details', () => {
      const error = new InternalError({
        message: 'Database connection failed',
        details: [{ path: 'connection', message: 'Connection timeout' }],
      });

      const response = error.toResponse();

      expect(response).toEqual({
        status: 500,
        type: 'internal',
        message: 'Internal Server Error',
        errorId: error.errorId,
      });
      expect(response.details).toBeUndefined();
    });

    it('should include errorId for server errors', () => {
      const error = new ServiceError();
      const response = error.toResponse();

      expect(response.errorId).toBe(error.errorId);
    });
  });

  describe('fromZodError', () => {
    it('should convert ZodError to ValidationError', () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
        age: z.number().min(18),
      });

      try {
        schema.parse({ name: 'Test', email: 'invalid', age: 16 });
        fail('ZodError should be thrown');
      } catch (err) {
        const validationError = AppError.fromZodError(err as ZodError);

        expect(validationError).toBeInstanceOf(ValidationError);
        expect(validationError.status).toBe(422);
        expect(validationError.details.length).toBe(2); // Invalid email and age < 18
        expect(validationError.details[0].path).toBeDefined();
        expect(validationError.details[0].message).toBeDefined();
        expect(validationError.details[0].code).toBeDefined();
      }
    });

    it('should use custom message when provided', () => {
      const schema = z.object({ name: z.string() });

      try {
        schema.parse({ name: 123 });
        fail('ZodError should be thrown');
      } catch (err) {
        const validationError = AppError.fromZodError(
          err as ZodError,
          'Custom validation message'
        );

        expect(validationError.message).toBe('Custom validation message');
      }
    });
  });
});

describe('Error subclasses', () => {
  it('should create BadRequestError with correct defaults', () => {
    const error = new BadRequestError();

    expect(error.status).toBe(400);
    expect(error.message).toBe('Bad request');
    expect(error.type).toBe('badrequest');
    expect(error.expose).toBe(true);
  });

  it('should create NotFoundError with correct defaults', () => {
    const error = new NotFoundError();

    expect(error.status).toBe(404);
    expect(error.message).toBe('Resource not found');
    expect(error.type).toBe('notfound');
    expect(error.expose).toBe(true);
  });

  it('should create ValidationError with correct defaults', () => {
    const error = new ValidationError();

    expect(error.status).toBe(422);
    expect(error.message).toBe('Validation failed');
    expect(error.type).toBe('validation');
    expect(error.expose).toBe(true);
  });

  it('should create UnauthorizedError with correct defaults', () => {
    const error = new UnauthorizedError();

    expect(error.status).toBe(401);
    expect(error.message).toBe('Authentication required');
    expect(error.type).toBe('unauthorized');
    expect(error.expose).toBe(true);
  });

  it('should create ForbiddenError with correct defaults', () => {
    const error = new ForbiddenError();

    expect(error.status).toBe(403);
    expect(error.message).toBe('Access denied');
    expect(error.type).toBe('forbidden');
    expect(error.expose).toBe(true);
  });

  it('should create ConflictError with correct defaults', () => {
    const error = new ConflictError();

    expect(error.status).toBe(409);
    expect(error.message).toBe('Resource conflict');
    expect(error.type).toBe('conflict');
    expect(error.expose).toBe(true);
  });

  it('should create ServiceError with correct defaults', () => {
    const error = new ServiceError();

    expect(error.status).toBe(503);
    expect(error.message).toBe('Service unavailable');
    expect(error.type).toBe('service');
    expect(error.expose).toBe(false); // Server errors should not be exposed
  });

  it('should create InternalError with correct defaults', () => {
    const error = new InternalError();

    expect(error.status).toBe(500);
    expect(error.message).toBe('Internal server error');
    expect(error.type).toBe('internal');
    expect(error.expose).toBe(false); // Server errors should not be exposed
  });
});

describe('createAppError', () => {
  it('should return AppError instances as is', () => {
    const original = new NotFoundError();
    const result = createAppError(original);

    expect(result).toBe(original);
  });

  it('should convert ZodError to ValidationError', () => {
    const schema = z.object({ name: z.string() });

    try {
      schema.parse({ name: 123 });
      fail('ZodError should be thrown');
    } catch (err) {
      const result = createAppError(err);

      expect(result).toBeInstanceOf(ValidationError);
    }
  });

  it('should convert Error to InternalError', () => {
    const error = new Error('Test error');
    const result = createAppError(error);

    expect(result).toBeInstanceOf(InternalError);
    expect(result.cause).toBe(error);
    expect(result.status).toBe(500);
  });

  it('should handle non-Error objects', () => {
    const result = createAppError('string error');

    expect(result).toBeInstanceOf(InternalError);
    expect(result.status).toBe(500);
    expect(result.logContext.originalError).toBe('string error');
  });

  it('should handle null and undefined', () => {
    expect(createAppError(null)).toBeInstanceOf(InternalError);
    expect(createAppError(undefined)).toBeInstanceOf(InternalError);
  });
});

export class RateLimitError extends AppError {
  constructor(options: AppErrorOptions = {}) {
    super({
      status: 429,
      message: options.message || 'Too many requests',
      ...options,
    });
  }
}
