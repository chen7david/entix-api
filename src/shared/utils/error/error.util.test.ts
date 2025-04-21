import {
  AppError,
  NotFoundError,
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ServiceError,
  InternalError,
  RateLimitError,
  createAppError,
} from '@shared/utils/error/error.util';
import { ZodError, z } from 'zod';

describe('AppError and subclasses', () => {
  it('constructs with a message (overload)', () => {
    const err = new AppError('fail');
    expect(err.message).toBe('fail');
    expect(err.status).toBe(500);
    expect(err.errorId).toMatch(/[0-9a-f-]+/);
    expect(err.type).toBe('app');
  });

  it('constructs with options (overload)', () => {
    const err = new AppError({ status: 418, message: 'teapot', expose: true });
    expect(err.status).toBe(418);
    expect(err.message).toBe('teapot');
    expect(err.expose).toBe(true);
  });

  it('toResponse() returns correct structure', () => {
    const err = new AppError({ status: 500, message: 'fail', expose: false });
    const res = err.toResponse();
    expect(res.status).toBe(500);
    expect(res.type).toBe('app');
    expect(res.message).toBe('Internal Server Error');
    expect(res.errorId).toBeDefined();
  });

  it('subclasses set correct status and type', () => {
    expect(new NotFoundError().status).toBe(404);
    expect(new NotFoundError().type).toBe('notfound');
    expect(new BadRequestError().status).toBe(400);
    expect(new ValidationError().status).toBe(422);
    expect(new UnauthorizedError().status).toBe(401);
    expect(new ForbiddenError().status).toBe(403);
    expect(new ConflictError().status).toBe(409);
    expect(new ServiceError().status).toBe(503);
    expect(new InternalError().status).toBe(500);
    expect(new RateLimitError().status).toBe(429);
  });

  it('subclasses accept message or options', () => {
    expect(new NotFoundError('nope').message).toBe('nope');
    expect(new NotFoundError({ message: 'gone' }).message).toBe('gone');
    expect(
      new BadRequestError({ details: [{ path: 'foo', message: 'bad' }] }).details[0].message,
    ).toBe('bad');
  });

  it('ServiceError and InternalError always set expose: false', () => {
    expect(new ServiceError('fail').expose).toBe(false);
    expect(new InternalError('fail').expose).toBe(false);
  });
});

describe('fromZodError', () => {
  it('creates a ValidationError from a ZodError', () => {
    const schema = z.object({ email: z.string().email() });
    let zodErr: ZodError;
    try {
      schema.parse({ email: 'bad' });
    } catch (e) {
      zodErr = e as ZodError;
    }
    const err = ValidationError.fromZodError(zodErr!);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.details[0].path).toEqual(['email']);
    expect(err.details[0].message).toMatch(/email/);
  });
});

describe('createAppError', () => {
  it('returns AppError as-is', () => {
    const err = new NotFoundError('nope');
    expect(createAppError(err)).toBe(err);
  });

  it('wraps ZodError as ValidationError', () => {
    const schema = z.object({ foo: z.string().min(3) });
    let zodErr: ZodError;
    try {
      schema.parse({ foo: 'a' });
    } catch (e) {
      zodErr = e as ZodError;
    }
    const err = createAppError(zodErr!);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.details[0].path).toEqual(['foo']);
  });

  it('wraps Error as InternalError', () => {
    const err = createAppError(new Error('fail'));
    expect(err).toBeInstanceOf(InternalError);
    expect(err.message).toBe('An unexpected error occurred');
    expect(err.cause).toBeInstanceOf(Error);
  });

  it('wraps unknown as InternalError', () => {
    const err = createAppError(123);
    expect(err).toBeInstanceOf(InternalError);
    expect(err.message).toBe('An unknown error occurred');
  });
});

describe('Custom error extension', () => {
  class PaymentRequiredError extends AppError {
    constructor(message?: string);
    constructor(options?: unknown);
    constructor(arg?: string | unknown) {
      if (typeof arg === 'string') {
        super({ status: 402, message: arg });
      } else if (arg && typeof arg === 'object') {
        super({ status: 402, ...(arg as object) });
      } else {
        super({ status: 402 });
      }
    }
  }
  it('works with string or options', () => {
    expect(new PaymentRequiredError('pay').status).toBe(402);
    expect(new PaymentRequiredError({ message: 'pay' }).message).toBe('pay');
  });
});
