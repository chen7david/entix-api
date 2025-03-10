import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/services/logger.service';

@Middleware({ type: 'before' })
export class RequestLoggerMiddleware implements ExpressMiddlewareInterface {
  use(request: Request, response: Response, next: NextFunction): void {
    const startTime = Date.now();

    logger.debug(`Incoming request`, {
      method: request.method,
      path: request.path,
      ip: request.ip,
    });

    // Add listener for when response finishes
    response.on('finish', () => {
      const duration = Date.now() - startTime;

      logger.debug(`Request completed`, {
        method: request.method,
        path: request.path,
        statusCode: response.statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  }
}
