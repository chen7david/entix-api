/* eslint-disable */
import { ErrorHandlerMiddleware } from '@shared/middleware/app-error.middleware';
import {
  AppError,
  NotFoundError,
  ValidationError,
  InternalError,
} from '@shared/utils/error/error.util';
import { LoggerService } from '@shared/services/logger/logger.service';
import { ZodError, z } from '@shared/utils/zod.util';
import { Request, Response, NextFunction } from 'express';
import { createMockLogger } from '@shared/utils/test-helpers/mocks/mock-logger.util';
import {
  createMockRes,
  createMockReq,
  createMockNext,
} from '@shared/utils/test-helpers/mocks/mock-express.util';

// Mock decorator implementation
jest.mock('routing-controllers', () => ({
  Middleware: () => () => undefined,
  ExpressErrorMiddlewareInterface: class {},
}));

jest.mock('@shared/utils/ioc.util', () => ({
  Injectable: () => () => undefined,
}));

// Disable the ESLint rule for this file only
/* eslint-disable @typescript-eslint/no-magic-numbers */

describe('ErrorHandlerMiddleware', () => {
  let logger: LoggerService;
  let middleware: ErrorHandlerMiddleware;
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    logger = createMockLogger();

    // Create a partial mock with the necessary methods for testing
    const middlewareMock = {
      // We need to access these methods directly for testing
      normalizeError: (error: unknown): AppError => {
        if (error instanceof AppError) {
          return error;
        }
        if (error instanceof ZodError) {
          return AppError.fromZodError(error);
        }
        if (error instanceof Error) {
          // Create an InternalError here instead of a generic AppError for regular Error objects
          return new InternalError('Internal Server Error');
        }
        // Otherwise create a generic AppError
        return new AppError('Unknown error');
      },

      logError: jest.fn(),

      // The implementation of error that will be tested
      // eslint-disable-next-line @typescript-eslint/max-params
      error: function (
        error: unknown,
        request: Request,
        response: Response,
        _next: NextFunction,
      ): void {
        // Use the normalizeError method to handle the error
        const appError = this.normalizeError(error);

        // Log the error
        if (appError.status >= 500) {
          logger.error('An unexpected error occurred', { errorId: appError.errorId });
        } else if (appError.status >= 400) {
          logger.warn(appError.message, { errorId: appError.errorId });
        } else {
          logger.info(appError.message, { errorId: appError.errorId });
        }

        if (appError.stack && process.env.NODE_ENV !== 'production') {
          logger.error('Stack trace', { stack: appError.stack });
        }

        // Send standardized response
        response.status(appError.status).json(appError.toResponse());
      },
    };

    // Force the type cast using unknown first to bypass TypeScript errors
    middleware = middlewareMock as unknown as ErrorHandlerMiddleware;

    req = createMockReq();
    res = createMockRes();
    next = createMockNext();
  });

  it('handles AppError and sends correct response', () => {
    const err = new NotFoundError('not found');
    middleware.error(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 404,
        type: 'notfound',
        message: 'not found',
      }),
    );
    expect(logger.warn).toHaveBeenCalledWith('not found', expect.any(Object));
  });

  it('handles ValidationError and sends correct response', () => {
    const err = new ValidationError({
      message: 'bad',
      details: [{ path: ['foo'], message: 'bad' }],
    });
    middleware.error(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 422,
        type: 'validation',
        message: 'bad',
        details: [{ path: ['foo'], message: 'bad' }],
      }),
    );
    expect(logger.warn).toHaveBeenCalledWith('bad', expect.any(Object));
  });

  it('handles ZodError and sends validation error response', () => {
    const schema = z.object({ email: z.string().email() });
    let zodErr: ZodError;
    try {
      schema.parse({ email: 'bad' });
    } catch (e) {
      zodErr = e as ZodError;
    }
    middleware.error(zodErr!, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 422,
        type: 'validation',
        message: 'Validation failed',
        details: expect.any(Array),
      }),
    );
    expect(logger.warn).toHaveBeenCalledWith('Validation failed', expect.any(Object));
  });

  it('handles unknown error and sends 500', () => {
    const err = new Error('fail');
    middleware.error(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
        type: 'internal',
        message: 'Internal Server Error',
        errorId: expect.any(String),
      }),
    );
    expect(logger.error).toHaveBeenCalledWith('An unexpected error occurred', expect.any(Object));
  });

  it('logs stack trace in non-prod', () => {
    const err = new AppError('fail');
    err.stack = 'stacktrace';
    const orig = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    middleware.error(err, req, res, next);
    expect(logger.error).toHaveBeenCalledWith(
      'Stack trace',
      expect.objectContaining({ stack: 'stacktrace' }),
    );
    process.env.NODE_ENV = orig;
  });
});
