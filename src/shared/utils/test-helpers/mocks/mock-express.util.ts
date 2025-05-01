import type { Response, Request, NextFunction } from 'express';

/**
 * Returns a mock Express response object with chainable status and json methods.
 * @returns {Response} A mock response object
 */
export function createMockRes(): Response {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

/**
 * Returns a mock Express request object with optional overrides.
 * @param {Partial<Request>} props Optional properties to override
 * @returns {Request} A mock request object
 */
export function createMockReq(props: Partial<Request> = {}): Request {
  return {
    url: '/test',
    method: 'GET',
    ...props,
  } as Request;
}

/**
 * Returns a mock Express next function.
 * @returns {NextFunction} A mock next function
 */
export function createMockNext(): NextFunction {
  return jest.fn();
}
