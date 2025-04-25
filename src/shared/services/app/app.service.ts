import { ErrorHandlerMiddleware } from '@shared/middleware/app-error.middleware';
import { useContainer, useExpressServer } from 'routing-controllers';
import { Injectable } from '@shared/utils/ioc.util';
import express, { Express, Request, Response } from 'express';
import { Container } from 'typedi';
import path from 'path';
import { NotFoundMiddleware } from '@shared/middleware/not-found.middleware';

/**
 * AppService configures the Express app with routing-controllers and DI.
 */
@Injectable()
export class AppService {
  private app: Express;

  /**
   * @param _deps Dependency injection object (future-proof for logger, etc.)
   */
  constructor(_deps?: Record<string, unknown>) {
    useContainer(Container);
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Configure routing-controllers with all controllers and middlewares
    useExpressServer(this.app, {
      routePrefix: '/api',
      controllers: [
        path.join(__dirname, '../../../domains/**/*.controller.{ts,js}'),
        path.join(__dirname, '../../../shared/controllers/**/*.controller.{ts,js}'),
      ],
      validation: false, // Disable class-validator
      classTransformer: false, // Disable class-transformer
      middlewares: [ErrorHandlerMiddleware, NotFoundMiddleware],
      defaultErrorHandler: false,
    });

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res
        .status(200)
        .json({ status: 'ok', message: 'API is running', timestamp: new Date().toISOString() });
    });
  }

  /**
   * Get the configured Express app instance.
   */
  getApp(): Express {
    return this.app;
  }
}
