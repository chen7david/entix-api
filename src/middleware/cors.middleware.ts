import { corsConfig } from '@src/config/cors.config';
import { NextFunction } from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import cors from 'cors';
import { Injectable } from '@src/utils/typedi.util';

/**
 * The CORS middleware
 */
@Middleware({ type: 'before' })
@Injectable()
class CorsMiddleware implements ExpressMiddlewareInterface {
  use(req: Request, res: Response, next: NextFunction): void {
    cors(corsConfig);
  }
}

export const corsMiddleware = new CorsMiddleware();
