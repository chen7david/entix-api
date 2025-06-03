import { Request, Response, NextFunction } from 'express';
import { ZodSchema, z } from 'zod';

/**
 * Base validation class for validating request parts
 */
class Validator {
  constructor(private schema: ZodSchema) {}

  /**
   * Validates the given data against the schema
   */
  validate(data: unknown): unknown {
    return this.schema.parse(data);
  }

  /**
   * Creates an error response for validation errors
   */
  createErrorResponse(error: z.ZodError, message: string): Record<string, unknown> {
    return {
      message,
      errors: error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    };
  }
}

/**
 * Creates a middleware function that validates a request part
 */
// eslint-disable-next-line max-params
function createValidationMiddleware(
  validator: Validator,
  source: 'body' | 'params' | 'query' | 'headers',
): (req: Request, res: Response, next: NextFunction) => void {
  // Return a function that captures request in closure
  const handleRequest = (req: Request): void => {
    const data = req[source];
    const validatedData = validator.validate(data);

    // Only assign back if not headers (which are readonly)
    if (source !== 'headers') {
      // Using type assertion with Record to specify the correct type
      (req[source] as Record<string, unknown>) = validatedData as Record<string, unknown>;
    }
  };

  // Return the middleware function with a custom type for the middleware function
  // eslint-disable-next-line max-params
  const middleware = function validationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    try {
      handleRequest(req);
      next();
    } catch (error) {
      next(error);
    }
  };

  return middleware;
}

/**
 * Creates a middleware that validates request body against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  const validator = new Validator(schema);
  return createValidationMiddleware(validator, 'body');
}

/**
 * Creates a middleware that validates request headers against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateHeaders<T extends ZodSchema>(schema: T) {
  const validator = new Validator(schema);
  return createValidationMiddleware(validator, 'headers');
}

/**
 * Creates a middleware that validates request params against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateParams<T extends ZodSchema>(schema: T) {
  const validator = new Validator(schema);
  return createValidationMiddleware(validator, 'params');
}

/**
 * Creates a middleware that validates request query against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  const validator = new Validator(schema);
  return createValidationMiddleware(validator, 'query');
}
