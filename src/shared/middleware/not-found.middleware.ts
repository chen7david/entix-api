import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import { Injectable } from '@shared/utils/ioc.util';
import { LoggerService } from '@shared/services/logger/logger.service';

/**
 * Middleware to handle unmatched routes and return a standardized 404 response.
 */
@Middleware({ type: 'after' })
@Injectable()
export class NotFoundMiddleware implements ExpressMiddlewareInterface {
  constructor(private readonly loggerService: LoggerService) {}

  /**
   * Called when no other route has handled the request.
   */
  // eslint-disable-next-line max-params
  use(request: Request, response: Response, next: NextFunction): void {
    if (!response.headersSent) {
      const logger = this.loggerService.child({ service: 'NotFoundMiddleware' });
      logger.debug(`Route not found: ${request.method} ${request.originalUrl}`);
      response.status(404).json({
        status: 404,
        message: 'Not found',
        path: request.originalUrl,
        timestamp: new Date().toISOString(),
      });
    } else {
      next();
    }
  }
}
