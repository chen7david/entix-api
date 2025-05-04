import { ZodTypeAny, z } from 'zod';

/**
 * Utility function to extract and validate request data.
 * Extracts specified parts from the request and validates them against zod schemas.
 *
 * @param req - The request object
 * @param schemas - Object with zod schemas for body, params, query, headers
 * @returns Object with validated data from request
 */
export function extractRequest<
  B extends ZodTypeAny = never,
  P extends ZodTypeAny = never,
  Q extends ZodTypeAny = never,
  H extends ZodTypeAny = never,
>(
  req: Record<string, unknown>,
  schemas: {
    body?: B;
    params?: P;
    query?: Q;
    headers?: H;
  },
): {
  body?: z.infer<B>;
  params?: z.infer<P>;
  query?: z.infer<Q>;
  headers?: z.infer<H>;
  id?: string;
} {
  const result: {
    body?: z.infer<B>;
    params?: z.infer<P>;
    query?: z.infer<Q>;
    headers?: z.infer<H>;
    id?: string;
  } = {};

  if (schemas.body && req.body) {
    result.body = schemas.body.parse(req.body);
  }

  if (schemas.params && req.params) {
    result.params = schemas.params.parse(req.params);
    // For convenience, extract ID from params if it exists
    if (result.params && typeof result.params === 'object' && 'id' in result.params) {
      result.id = result.params.id;
    }
  }

  if (schemas.query && req.query) {
    result.query = schemas.query.parse(req.query);
  }

  if (schemas.headers && req.headers) {
    result.headers = schemas.headers.parse(req.headers);
  }

  return result;
}
