import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/services/logger.service';

/**
 * Middleware to handle 404 Not Found errors with JSON responses
 * This middleware should be registered last in the middleware chain
 */
@Middleware({ type: 'after' })
@Service()
export class NotFoundMiddleware implements ExpressMiddlewareInterface {
  use(request: Request, response: Response, next: NextFunction): void {
    // If no route has matched and no response has been sent yet
    if (!response.headersSent) {
      logger.debug(`Route not found: ${request.method} ${request.path}`);

      response.status(404).json({
        status: 404,
        message: 'Resource not found',
        path: request.originalUrl,
        timestamp: new Date().toISOString(),
      });
    } else {
      next();
    }
  }
}
