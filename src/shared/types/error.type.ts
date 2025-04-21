/**
 * Standard error response structure sent to clients
 */
export type ErrorResponse = {
  status: number;
  type: string;
  message: string;
  errorId?: string;
  details?: ErrorDetail[];
};

/**
 * Structure for individual error details, primarily for validation errors
 */
export type ErrorDetail = {
  path: string | string[];
  message: string;
  code?: string;
  expected?: string;
  received?: string;
};

/**
 * Options for creating a new application error
 */
export type AppErrorOptions = {
  status?: number;
  message?: string;
  cause?: Error;
  details?: ErrorDetail[];
  logContext?: Record<string, unknown>;
  expose?: boolean;
};
