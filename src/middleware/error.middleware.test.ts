import { Request, Response } from 'express';
import { ZodError, z } from 'zod';
import { ErrorHandlerMiddleware } from './error.middleware';
import { AppError, BadRequestError, InternalError } from '@src/utils/error.util';
import { logger } from '@src/services/logger.service';

// Mock the logger to avoid actual logging during tests
jest.mock('@src/services/logger.service', () => ({
  logger: {
    createRequestContext: jest.fn().mockReturnValue({ correlationId: 'test-id' }),
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}));

describe('ErrorHandlerMiddleware', () => {
  let middleware: ErrorHandlerMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    middleware = new ErrorHandlerMiddleware();

    mockRequest = {
      method: 'GET',
      url: '/test',
      headers: { 'user-agent': 'test-agent' },
      ip: '127.0.0.1',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle AppError properly', () => {
    const error = new BadRequestError({ message: 'Invalid request' });

    middleware.error(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      type: 'badrequest',
      message: 'Invalid request',
    });
    expect(logger.warn).toHaveBeenCalled();
  });

  it('should handle ZodError and convert to ValidationError', () => {
    const schema = z.object({ name: z.string() });
    let zodError: ZodError;

    try {
      schema.parse({ name: 123 });
    } catch (err) {
      zodError = err as ZodError;

      middleware.error(zodError, mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 422,
          type: 'validation',
          message: 'Validation failed',
          details: expect.any(Array),
        }),
      );
      expect(logger.warn).toHaveBeenCalled();
    }
  });

  it('should mask internal server errors', () => {
    const sensitiveError = new InternalError({
      message: 'Database credentials exposed',
      logContext: { sensitive: 'data' },
    });

    middleware.error(sensitiveError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 500,
      type: 'internal',
      message: 'Internal Server Error',
      errorId: expect.any(String),
    });
    expect(logger.error).toHaveBeenCalled();
  });

  it('should convert unknown errors to InternalError', () => {
    const unknownError = new Error('Unknown error');

    middleware.error(unknownError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
        type: 'internal',
        message: 'Internal Server Error',
        errorId: expect.any(String),
      }),
    );
    expect(logger.error).toHaveBeenCalled();
  });

  it('should include error ID for masked errors', () => {
    const error = new InternalError();

    middleware.error(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errorId: error.errorId,
      }),
    );
  });

  it('should log different error types at appropriate levels', () => {
    // Client error (400 range) - should log as warning
    const clientError = new BadRequestError();
    middleware.error(clientError, mockRequest as Request, mockResponse as Response, mockNext);
    expect(logger.warn).toHaveBeenCalled();
    jest.clearAllMocks();

    // Server error (500 range) - should log as error
    const serverError = new InternalError();
    middleware.error(serverError, mockRequest as Request, mockResponse as Response, mockNext);
    expect(logger.error).toHaveBeenCalled();
  });

  it('should include request context in logs', () => {
    const error = new AppError();

    middleware.error(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(logger.createRequestContext).toHaveBeenCalledWith(mockRequest);
    expect(logger.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        correlationId: 'test-id',
        errorId: error.errorId,
      }),
    );
  });
});
