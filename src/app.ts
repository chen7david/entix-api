import 'reflect-metadata';
import { useExpressServer, getMetadataArgsStorage, useContainer } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { Environment } from '@src/constants/app.constant';
import { httpLogger, logger } from '@src/services/logger.service';
import { AppConfig } from '@src/types/app.type';
import { env } from '@src/config/env.config';
import { Container } from 'typedi';
import { corsMiddleware } from './middleware/cors.middleware';
import { notFoundMiddleware } from './middleware/not-found.middleware';
import express from 'express';
import path from 'path';

// Configure TypeDI container
useContainer(Container);

/**
 * Represents the Express application with routing-controllers configuration
 */
export class App {
  /** The Express application instance */
  public app: express.Application;

  /**
   * Creates a new application instance
   * @param config - Configuration options for the application
   */
  constructor(config: AppConfig = { cors: true, detailedLogging: true }) {
    this.app = express();
    this.setupMiddleware(config);
    this.setupControllers();

    // Register the not found middleware last to catch all unhandled routes
    this.app.use(notFoundMiddleware);
  }

  /**
   * Sets up the middleware for the Express application
   * @param config - Configuration options for middleware
   */
  private setupMiddleware(config: AppConfig): void {
    // Enable CORS if configured
    if (config.cors) {
      this.app.use(corsMiddleware);
      logger.debug('CORS middleware enabled');
    }

    // Configure JSON middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Add request logging middleware
    if (config.detailedLogging && env.NODE_ENV !== Environment.PRODUCTION) {
      this.app.use(httpLogger);
    }

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  /**
   * Sets up the controllers using routing-controllers
   */
  private setupControllers(): void {
    // Register controllers with routing-controllers
    useExpressServer(this.app, {
      controllers: [path.join(__dirname, 'domains', '**', '*.controller.{ts,js}')],
      defaultErrorHandler: false,
      routePrefix: '/api',
      development: env.NODE_ENV !== Environment.PRODUCTION,
      // Use Zod instead of class-validator and class-transformer
      validation: false,
      classTransformer: false,
      cors: true,
    });

    // Log registered routes in development
    if (env.NODE_ENV === Environment.DEVELOPMENT) {
      const metadataStorage = getMetadataArgsStorage();
      const spec = routingControllersToSpec(metadataStorage);

      logger.debug(`Registered ${spec.paths ? Object.keys(spec.paths).length : 0} API routes`, {
        routes: spec.paths ? Object.keys(spec.paths) : [],
      });
    }
  }
}

/**
 * Creates and returns an Express application instance
 * @param config - Configuration options for the application
 * @returns The configured Express application
 */
export const createApp = (config?: AppConfig): express.Application => {
  const appInstance = new App(config);
  return appInstance.app;
};
