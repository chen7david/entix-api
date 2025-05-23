import { z } from '@shared/utils/zod.util';
import {
  validateBody,
  validateQuery,
  validateParams,
  validateHeaders,
  validateRequest,
} from '@shared/middleware/validation.middleware';
import { ValidationError } from '@shared/utils/error/error.util';
import httpMocks from 'node-mocks-http';
import { faker } from '@faker-js/faker';

describe('validation.middleware', () => {
  const next = jest.fn();
  const mockUserId = faker.string.uuid();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateBody', () => {
    const schema = z.object({ foo: z.string() });

    it('calls next and assigns parsed value for valid body', () => {
      const req = httpMocks.createRequest({ body: { foo: 'bar' } });
      const res = httpMocks.createResponse();
      validateBody(schema)(req, res, next);
      expect(req.body).toEqual({ foo: 'bar' });
      expect(next).toHaveBeenCalledWith();
    });

    it('calls next with ValidationError for invalid body', () => {
      const req = httpMocks.createRequest({ body: { foo: 123 } });
      const res = httpMocks.createResponse();
      validateBody(schema)(req, res, next);
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
    });

    it('calls next with ValidationError for empty body', () => {
      const req = httpMocks.createRequest({ body: {} });
      const res = httpMocks.createResponse();
      validateBody(schema)(req, res, next);
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
      expect(next.mock.calls[0][0].message).toMatch(/required/i);
    });
  });

  describe('validateQuery', () => {
    const schema = z.object({ page: z.coerce.number() });

    it('coerces and assigns query', () => {
      const req = httpMocks.createRequest({ query: { page: '2' } });
      const res = httpMocks.createResponse();
      validateQuery(schema)(req, res, next);
      expect(req.query).toEqual({ page: 2 });
      expect(next).toHaveBeenCalledWith();
    });

    it('calls next with ValidationError for invalid query', () => {
      const req = httpMocks.createRequest({ query: { page: 'not-a-number' } });
      const res = httpMocks.createResponse();
      validateQuery(schema)(req, res, next);
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
    });
  });

  describe('validateParams', () => {
    const schema = z.object({ id: z.string().uuid() });

    it('assigns params for valid input', () => {
      const req = httpMocks.createRequest({
        params: { id: mockUserId },
      });
      const res = httpMocks.createResponse();
      validateParams(schema)(req, res, next);
      expect(req.params).toEqual({ id: mockUserId });
      expect(next).toHaveBeenCalledWith();
    });

    it('calls next with ValidationError for invalid params', () => {
      const req = httpMocks.createRequest({ params: { id: 'not-a-uuid' } });
      const res = httpMocks.createResponse();
      validateParams(schema)(req, res, next);
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
    });
  });

  describe('validateHeaders', () => {
    const schema = z.object({ 'x-custom': z.string() });

    it('assigns headers for valid input', () => {
      const req = httpMocks.createRequest({ headers: { 'x-custom': 'abc' } });
      const res = httpMocks.createResponse();
      validateHeaders(schema)(req, res, next);
      expect(req.headers['x-custom']).toEqual('abc');
      expect(next).toHaveBeenCalledWith();
    });

    it('calls next with ValidationError for invalid headers', () => {
      // Use string for header key, but value must be string or string[]
      const req = httpMocks.createRequest({ headers: { 'x-custom': '123' } });
      // Now forcibly set to a number to simulate the error
      req.headers['x-custom'] = 123 as unknown as string;
      const res = httpMocks.createResponse();
      validateHeaders(schema)(req, res, next);
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
    });
  });

  describe('validateRequest', () => {
    const schemas = {
      body: z.object({ foo: z.string() }),
      query: z.object({ page: z.coerce.number() }),
    };

    it('assigns all sources for valid input', () => {
      const req = httpMocks.createRequest({ body: { foo: 'bar' }, query: { page: '1' } });
      const res = httpMocks.createResponse();
      validateRequest(schemas)(req, res, next);
      expect(req.body).toEqual({ foo: 'bar' });
      expect(req.query).toEqual({ page: 1 });
      expect(next).toHaveBeenCalledWith();
    });

    it('calls next with ValidationError for any invalid input', () => {
      const req = httpMocks.createRequest({ body: { foo: 123 }, query: { page: 'not-a-number' } });
      const res = httpMocks.createResponse();
      validateRequest(schemas)(req, res, next);
      expect(next.mock.calls[0][0]).toBeInstanceOf(ValidationError);
    });
  });
});
