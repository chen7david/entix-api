import { ErrorHandlerMiddleware } from '@shared/middleware/app-error.middleware';
import { NotFoundMiddleware } from '@shared/middleware/not-found.middleware';
import { useContainer, useExpressServer } from 'routing-controllers';
import { Injectable } from '@shared/utils/ioc.util';
import express, { Express } from 'express';
import { Container } from 'typedi';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';

/**
 * AppService configures the Express app with routing-controllers and DI.
 */
@Injectable()
export class AppService {
  private app: Express;

  /**
   * Constructs and configures the Express app instance.
   *
   * @remarks
   * Adds security middleware (Helmet, CORS) before routing-controllers setup.
   *
   * @param _deps Dependency injection object (future-proof for logger, etc.)
   */
  constructor(_deps?: Record<string, unknown>) {
    useContainer(Container);
    this.app = express();
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Configure routing-controllers with all controllers and middlewares
    useExpressServer(this.app, {
      controllers: [path.join(__dirname, '../../../domains/**/*.controller.{ts,js}')],
      validation: false, // Disable class-validator
      classTransformer: false, // Disable class-transformer
      middlewares: [ErrorHandlerMiddleware, NotFoundMiddleware],
      defaultErrorHandler: false,
    });
  }

  /**
   * Get the configured Express app instance.
   */
  getApp(): Express {
    return this.app;
  }
}
