import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

/**
 * Interface for API endpoint configuration
 */
export interface Endpoint {
  /** HTTP method (get, post, put, patch, delete) */
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  /** Path relative to the base path */
  path: string;
  /** Handler function for the endpoint */
  handler: (req: Record<string, unknown>) => Promise<TypedJsonResponse<unknown>>;
  /** OpenAPI documentation for the endpoint */
  documentation: {
    /** Tags for grouping endpoints */
    tags: string[];
    /** Short summary */
    summary: string;
    /** Longer description */
    description?: string;
    /** Path parameters */
    parameters?: Array<{
      name: string;
      in: string;
      required: boolean;
      schema: Record<string, unknown>;
    }>;
    /** Request body schema */
    requestBody?: {
      required: boolean;
      content: Record<string, { schema: Record<string, unknown> }>;
    };
    /** Response schemas */
    responses: Record<number, unknown>;
  };
}

/**
 * Interface for router configuration
 */
export interface RouterOptions {
  /** Base path for all endpoints */
  basePath: string;
  /** List of endpoints */
  endpoints: Endpoint[];
}

/**
 * Type for JSON response with status code
 */
export type TypedJsonResponse<T> = {
  /** HTTP status code */
  status: number;
  /** Response body */
  body: T;
};

/**
 * Creates a typed response schema for OpenAPI
 * @param registry - The OpenAPI registry
 * @param options - Schema options
 * @returns The response schema
 */
export function createTypedResponseSchema(
  registry: OpenAPIRegistry,
  options: {
    response: Record<string, unknown>;
    description: string;
  },
): Record<string, unknown> {
  return {
    description: options.description,
    content: {
      'application/json': {
        schema: options.response,
      },
    },
  };
}
