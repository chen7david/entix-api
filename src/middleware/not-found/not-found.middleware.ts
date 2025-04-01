import { Request, Response, NextFunction } from 'express';
import { logger } from '@src/services/logger/logger.service';

/**
 * Not Found Middleware
 *
 * This middleware is implemented as a traditional Express middleware to handle
 * 404 Not Found errors across the entire application, not just for API routes.
 *
 * When placed at the end of the middleware chain (after all routes), this middleware
 * will catch any requests that weren't handled by previous routes and respond with
 * a standardized 404 error response.
 *
 * Important:
 * - This middleware should be registered after all routes and other middleware
 * - Unlike the routing-controllers version, this middleware can handle all requests,
 *   including those outside the API prefix
 */
export const notFoundMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  // If no route has matched and no response has been sent yet
  if (!response.headersSent) {
    logger.debug(`Route not found: ${request.method} ${request.path}`);

    response.status(404).json({
      status: 404,
      message: 'Not found',
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    });
  } else {
    next();
  }
};
