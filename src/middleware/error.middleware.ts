import { ExpressErrorMiddlewareInterface, Middleware } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/services/logger.service';

@Middleware({ type: 'after' })
export class ErrorMiddleware implements ExpressErrorMiddlewareInterface {
  error(error: any, request: Request, response: Response, next: NextFunction): void {
    const status = error.httpCode || 500;
    const message = error.message || 'Internal Server Error';

    logger.error(`Error handling request: ${message}`, error, {
      path: request.path,
      method: request.method,
      status,
    });

    response.status(status).json({
      status,
      message,
      timestamp: new Date().toISOString(),
      path: request.path,
    });
  }
}
