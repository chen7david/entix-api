import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from '@shared/utils/zod.util';
import { ValidationError } from '@shared/utils/error/error.util';
import type { RequestSource, ValidationSchemas } from '@shared/types/validation.type';

/**
 * Throws a ValidationError if validation fails, otherwise returns parsed data.
 * @param schema - Zod schema to validate against
 * @param context - Object containing data and source
 * @returns Parsed data if valid
 * @throws ValidationError if invalid
 */
function parseOrThrow<T>(schema: ZodTypeAny, context: { data: unknown; source: RequestSource }): T {
  // Reject empty body for 'body' source
  if (
    context.source === 'body' &&
    (!context.data ||
      (typeof context.data === 'object' && Object.keys(context.data as object).length === 0))
  ) {
    throw new ValidationError('Request body is required');
  }
  try {
    return schema.parse(context.data);
  } catch (err) {
    if (err instanceof ZodError) {
      throw ValidationError.fromZodError(err, `Invalid ${context.source}`);
    }
    throw err;
  }
}

/**
 * Creates a routing-controllers-compatible middleware that validates a specific request source.
 * Overwrites req[source] with the validated and transformed data.
 * @param source - The request source to validate ('body', 'query', 'params', 'headers')
 * @param schema - The Zod schema to use for validation
 * @returns Middleware function
 */
export function validateSource<T = unknown>(source: RequestSource, schema: ZodTypeAny) {
  // eslint-disable-next-line max-params
  return function (req: Request, _res: Response, next: NextFunction) {
    try {
      const parsed = parseOrThrow<T>(schema, { data: req[source], source });
      req[source] = parsed;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Middleware to validate request body using a Zod schema.
 * @param schema - Zod schema for the request body
 * @returns Middleware function
 */
export const validateBody = <T = unknown>(schema: ZodTypeAny) => validateSource<T>('body', schema);

/**
 * Middleware to validate request query using a Zod schema.
 * @param schema - Zod schema for the request query
 * @returns Middleware function
 */
export const validateQuery = <T = unknown>(schema: ZodTypeAny) =>
  validateSource<T>('query', schema);

/**
 * Middleware to validate request params using a Zod schema.
 * @param schema - Zod schema for the request params
 * @returns Middleware function
 */
export const validateParams = <T = unknown>(schema: ZodTypeAny) =>
  validateSource<T>('params', schema);

/**
 * Middleware to validate request headers using a Zod schema.
 * @param schema - Zod schema for the request headers
 * @returns Middleware function
 */
export const validateHeaders = <T = unknown>(schema: ZodTypeAny) =>
  validateSource<T>('headers', schema);

/**
 * Middleware to validate multiple request sources at once.
 * Overwrites req[source] with the validated and transformed data for each source.
 * @param schemas - Object with Zod schemas for any of body, query, params, headers
 * @returns Middleware function
 */
export function validateRequest(schemas: ValidationSchemas) {
  // eslint-disable-next-line max-params
  return function (req: Request, _res: Response, next: NextFunction) {
    try {
      for (const source of Object.keys(schemas) as RequestSource[]) {
        const schema = schemas[source];
        if (schema) {
          const parsed = parseOrThrow(schema, { data: req[source], source });
          req[source] = parsed;
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
