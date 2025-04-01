/**
 * Standard error response structure sent to clients
 */
export type ErrorResponse = {
  /** Error status code */
  status: number;
  /** Error type identifier */
  type: string;
  /** Human-readable error message */
  message: string;
  /** Unique error ID for tracking in logs */
  errorId?: string;
  /** Optional details for validation errors */
  details?: ErrorDetail[];
};

/**
 * Structure for individual error details, primarily for validation errors
 */
export type ErrorDetail = {
  /** Path to the field with the error */
  path: string | string[];
  /** Error message for this field */
  message: string;
  /** Error code identifier */
  code?: string;
  /** Expected value or type */
  expected?: string;
  /** Received value or type */
  received?: string;
};

/**
 * Options for creating a new application error
 */
export type AppErrorOptions = {
  /** HTTP status code for the error */
  status?: number;
  /** Error message */
  message?: string;
  /** Original error that caused this error */
  cause?: Error;
  /** Additional error details for field validation errors */
  details?: ErrorDetail[];
  /** Additional properties to include in error logging */
  logContext?: Record<string, unknown>;
  /** Whether to expose the detailed error to the client */
  expose?: boolean;
};

/**
 * Map of HTTP status codes to standard error messages
 */
export const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};
