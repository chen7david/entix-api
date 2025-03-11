import { ExpressErrorMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/services/logger.service';
import { Environment } from '@src/types/app.types';

@Middleware({ type: 'after' })
@Service()
export class ErrorMiddleware implements ExpressErrorMiddlewareInterface {
  error(error: any, request: Request, response: Response, next: NextFunction): void {
    const status = error.httpCode || error.status || 500;
    const message = error.message || 'Internal Server Error';

    logger.error(`Error handling request: ${message}`, error, {
      path: request.path,
      method: request.method,
      status,
    });

    // Create a standardized error response
    const errorResponse = {
      status,
      message,
      timestamp: new Date().toISOString(),
      path: request.path,
    };

    // Add error details in non-production environments
    if (process.env.NODE_ENV !== Environment.Production && error.stack) {
      Object.assign(errorResponse, {
        stack: error.stack.split('\n'),
        name: error.name,
      });
    }

    response.status(status).json(errorResponse);
  }
}
