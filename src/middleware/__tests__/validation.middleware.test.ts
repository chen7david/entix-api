import { Request, Response } from 'express';
import { z } from 'zod';
import {
  ValidationMiddleware,
  ValidateBody,
  ValidateParams,
  ValidateQuery,
  ValidateHeaders,
  ValidateCookies,
  ValidationTarget,
} from '@src/middleware/validation.middleware';
import { ValidationError } from '@src/utils/error.util';

describe('Validation Middleware', () => {
  // Mock Express request, response, and next function
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
      headers: {},
      cookies: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('ValidationMiddleware function', () => {
    it('should call next() when validation passes', () => {
      // Create a simple schema
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      // Set up valid request data
      mockRequest.body = {
        name: 'John',
        age: 30,
      };

      // Create middleware class
      const MiddlewareClass = ValidationMiddleware(schema);
      const middleware = new MiddlewareClass();

      // Call middleware
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      // Expect next to be called without errors
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should pass validation error to next() when validation fails', () => {
      // Create a simple schema
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      // Set up invalid request data
      mockRequest.body = {
        name: 123, // Should be a string
        age: 'thirty', // Should be a number
      };

      // Create middleware class
      const MiddlewareClass = ValidationMiddleware(schema);
      const middleware = new MiddlewareClass();

      // Call middleware
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      // Expect next to be called with ValidationError
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext.mock.calls[0][0]).toBeInstanceOf(ValidationError);
    });

    it('should use custom error message when provided', () => {
      // Create a simple schema
      const schema = z.object({
        name: z.string(),
      });

      // Set up invalid request data
      mockRequest.body = {
        name: 123, // Should be a string
      };

      // Create middleware with custom error message
      const MiddlewareClass = ValidationMiddleware(schema, ValidationTarget.BODY, {
        errorMessage: 'Custom validation error',
      });
      const middleware = new MiddlewareClass();

      // Call middleware
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      // Expect next to be called with ValidationError with custom message
      expect(mockNext).toHaveBeenCalledTimes(1);
      const error = mockNext.mock.calls[0][0] as ValidationError;
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Custom validation error');
    });

    it('should strip unknown properties when stripUnknown is true', () => {
      // Create a simple schema
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      // Set up request data with extra property
      mockRequest.body = {
        name: 'John',
        age: 30,
        extraProperty: 'should be removed',
      };

      // Create middleware with stripUnknown option
      const MiddlewareClass = ValidationMiddleware(schema, ValidationTarget.BODY, {
        stripUnknown: true,
      });
      const middleware = new MiddlewareClass();

      // Call middleware
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      // Expect next to be called without errors and extra property to be removed
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockRequest.body).toEqual({
        name: 'John',
        age: 30,
      });
      expect(mockRequest.body).not.toHaveProperty('extraProperty');
    });

    it('should validate different request targets', () => {
      // Test params
      const paramsSchema = z.object({ id: z.string() });
      mockRequest.params = { id: '123' };
      const ParamsMiddlewareClass = ValidationMiddleware(paramsSchema, ValidationTarget.PARAMS);
      const paramsMiddleware = new ParamsMiddlewareClass();
      paramsMiddleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();

      // Reset mock
      mockNext.mockClear();

      // Test query
      const querySchema = z.object({ search: z.string().optional() });
      mockRequest.query = { search: 'test' };
      const QueryMiddlewareClass = ValidationMiddleware(querySchema, ValidationTarget.QUERY);
      const queryMiddleware = new QueryMiddlewareClass();
      queryMiddleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();

      // Reset mock
      mockNext.mockClear();

      // Test headers
      const headersSchema = z.object({
        'content-type': z.string().optional(),
        authorization: z.string().optional(),
      });
      mockRequest.headers = { 'content-type': 'application/json' };
      const HeadersMiddlewareClass = ValidationMiddleware(headersSchema, ValidationTarget.HEADERS);
      const headersMiddleware = new HeadersMiddlewareClass();
      headersMiddleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('convenience factory functions', () => {
    it('ValidateBody should create middleware class that validates request body', () => {
      const schema = z.object({ name: z.string() });
      mockRequest.body = { name: 'John' };
      const BodyMiddlewareClass = ValidateBody(schema);
      const middleware = new BodyMiddlewareClass();
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('ValidateParams should create middleware class that validates request params', () => {
      const schema = z.object({ id: z.string() });
      mockRequest.params = { id: '123' };
      const ParamsMiddlewareClass = ValidateParams(schema);
      const middleware = new ParamsMiddlewareClass();
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('ValidateQuery should create middleware class that validates request query', () => {
      const schema = z.object({ search: z.string().optional() });
      mockRequest.query = { search: 'test' };
      const QueryMiddlewareClass = ValidateQuery(schema);
      const middleware = new QueryMiddlewareClass();
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('ValidateHeaders should create middleware class that validates request headers', () => {
      const schema = z.object({
        'content-type': z.string().optional(),
      });
      mockRequest.headers = { 'content-type': 'application/json' };
      const HeadersMiddlewareClass = ValidateHeaders(schema);
      const middleware = new HeadersMiddlewareClass();
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('ValidateCookies should create middleware class that validates cookies', () => {
      const schema = z.object({
        sessionId: z.string().optional(),
      });
      mockRequest.cookies = { sessionId: 'abc123' };
      const CookiesMiddlewareClass = ValidateCookies(schema);
      const middleware = new CookiesMiddlewareClass();
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
