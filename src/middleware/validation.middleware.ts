import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodObject } from 'zod';
import { ValidationError } from '@src/utils/error.util';

/**
 * Request location to validate
 * Specifies which part of the request should be validated
 */
export enum ValidationTarget {
  BODY = 'body',
  PARAMS = 'params',
  QUERY = 'query',
  HEADERS = 'headers',
  COOKIES = 'cookies',
}

/**
 * Configuration options for the validation middleware
 */
export type ValidationOptions = {
  /** Optional error message to use when validation fails */
  errorMessage?: string;
  /** Whether to strip unknown properties (defaults to false) */
  stripUnknown?: boolean;
};

/**
 * Core validation logic used by all validation middleware classes
 * @param req - Express request object
 * @param schema - Zod schema to validate against
 * @param target - Part of the request to validate
 * @param options - Validation options
 */
function validateRequest<T extends ZodSchema>(
  req: Request,
  schema: T,
  target: ValidationTarget,
  options: ValidationOptions,
): void {
  const data = req[target as keyof Request];

  // Handle the validation differently based on whether we need to strip unknown properties
  let result;

  if (options.stripUnknown && schema instanceof z.ZodObject) {
    // For object schemas, we can use the strip() method to create a new schema that removes unknown keys
    const strippedSchema = schema.strip();
    result = strippedSchema.safeParse(data);
  } else {
    // For other schema types or when stripUnknown is false, use the original schema
    result = schema.safeParse(data);
  }

  if (!result.success) {
    // Validation failed, throw a ValidationError with formatted details
    throw new ValidationError({
      message: options.errorMessage || `Invalid ${target}`,
      cause: result.error,
    });
  }

  // Update the request with the validated and potentially transformed data
  (req as any)[target] = result.data;
}

/**
 * Base validation middleware class for routing-controllers
 * @param schema - Zod schema to validate against
 * @param target - Part of the request to validate
 * @param options - Validation options
 */
export function ValidationMiddleware<T extends ZodSchema>(
  schema: T,
  target: ValidationTarget = ValidationTarget.BODY,
  options: ValidationOptions = {},
) {
  class ZodValidationMiddleware {
    use(req: Request, res: Response, next: NextFunction): void {
      try {
        validateRequest(req, schema, target, options);
        next();
      } catch (error) {
        next(error);
      }
    }
  }

  return ZodValidationMiddleware;
}

/**
 * Creates a middleware class for validating request body
 * Use with the @UseBefore decorator in routing-controllers
 *
 * @param schema - Zod schema to validate the request body against
 * @param options - Validation options
 * @returns A middleware class for routing-controllers
 */
export function ValidateBody<T extends ZodSchema>(schema: T, options: ValidationOptions = {}) {
  return ValidationMiddleware(schema, ValidationTarget.BODY, options);
}

/**
 * Creates a middleware class for validating route parameters
 * Use with the @UseBefore decorator in routing-controllers
 *
 * @param schema - Zod schema to validate the route parameters against
 * @param options - Validation options
 * @returns A middleware class for routing-controllers
 */
export function ValidateParams<T extends ZodSchema>(schema: T, options: ValidationOptions = {}) {
  return ValidationMiddleware(schema, ValidationTarget.PARAMS, options);
}

/**
 * Creates a middleware class for validating query parameters
 * Use with the @UseBefore decorator in routing-controllers
 *
 * @param schema - Zod schema to validate the query parameters against
 * @param options - Validation options
 * @returns A middleware class for routing-controllers
 */
export function ValidateQuery<T extends ZodSchema>(schema: T, options: ValidationOptions = {}) {
  return ValidationMiddleware(schema, ValidationTarget.QUERY, options);
}

/**
 * Creates a middleware class for validating request headers
 * Use with the @UseBefore decorator in routing-controllers
 *
 * @param schema - Zod schema to validate the request headers against
 * @param options - Validation options
 * @returns A middleware class for routing-controllers
 */
export function ValidateHeaders<T extends ZodSchema>(schema: T, options: ValidationOptions = {}) {
  return ValidationMiddleware(schema, ValidationTarget.HEADERS, options);
}

/**
 * Creates a middleware class for validating cookies
 * Use with the @UseBefore decorator in routing-controllers
 *
 * @param schema - Zod schema to validate the cookies against
 * @param options - Validation options
 * @returns A middleware class for routing-controllers
 */
export function ValidateCookies<T extends ZodSchema>(schema: T, options: ValidationOptions = {}) {
  return ValidationMiddleware(schema, ValidationTarget.COOKIES, options);
}
