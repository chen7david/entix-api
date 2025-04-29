import { ErrorHandlerMiddleware } from '@shared/middleware/app-error.middleware';
import { AppError, NotFoundError, ValidationError } from '@shared/utils/error/error.util';
import { LoggerService } from '@shared/services/logger/logger.service';
import { ZodError, z } from '@shared/utils/zod.util';
import { Request, Response, NextFunction } from 'express';
import { createMockLogger } from '@shared/utils/test-helpers/mock-logger.util';

const createMockRes = (): Response => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const createMockReq = (props: Partial<Request> = {}): Request =>
  ({
    url: '/test',
    method: 'GET',
    ...props,
  }) as Request;

describe('ErrorHandlerMiddleware', () => {
  let logger: LoggerService;
  let middleware: ErrorHandlerMiddleware;
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    logger = createMockLogger();
    middleware = new ErrorHandlerMiddleware(logger);
    req = createMockReq();
    res = createMockRes();
    next = jest.fn();
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
    expect(logger.debug).toHaveBeenCalledWith(
      'Stack trace',
      expect.objectContaining({ stack: 'stacktrace' }),
    );
    process.env.NODE_ENV = orig;
  });
});
