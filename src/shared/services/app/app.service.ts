import { ErrorHandlerMiddleware } from '@src/shared/middleware/app-error.middleware';
import { useContainer, useExpressServer, getMetadataArgsStorage } from 'routing-controllers';
import { Injectable } from '@shared/utils/ioc.util';
import express, { Express } from 'express';
import { Container } from 'typedi';
import path from 'path';
import { routingControllersToSpec } from 'routing-controllers-openapi';

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

    useExpressServer(this.app, {
      routePrefix: '/api',
      controllers: [path.join(__dirname, '../../../domains/**/*.controller.{ts,js}')],
      validation: false, // Disable class-validator
      classTransformer: false, // Disable class-transformer
      middlewares: [ErrorHandlerMiddleware],
      defaultErrorHandler: false,
    });

    /**
     * Serve the OpenAPI spec at /api/openapi.json
     */
    this.app.get('/api/openapi.json', (_req, res) => {
      const storage = getMetadataArgsStorage();
      const spec = routingControllersToSpec(
        storage,
        {
          routePrefix: '/api',
        },
        {
          info: {
            title: 'Entix API',
            version: '1.0.0',
            description: 'OpenAPI documentation for Entix API',
          },
          components: {},
        },
      );
      res.json(spec);
    });
  }

  /**
   * Get the configured Express app instance.
   */
  getApp(): Express {
    return this.app;
  }
}
