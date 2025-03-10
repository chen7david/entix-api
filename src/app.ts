import 'reflect-metadata';
import express from 'express';
import path from 'path';
import { useExpressServer } from 'routing-controllers';
import { logger } from '@/services/logger.service';
import { NotFoundMiddleware } from './middleware/not-found.middleware';
import { ErrorMiddleware } from './middleware/error.middleware';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { Environment } from './types/app.types';
import { env } from './config/env.config';
import { corsOptions } from './config/cors.config';

/**
 * Creates and configures the Express application
 * @returns Configured Express application
 */
export function createApp(): express.Application {
  // Create Express app
  const app = express();

  // Basic Express configuration
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Configure routing-controllers
  useExpressServer(app, {
    controllers: [path.join(__dirname, '/features/**/*.controller.{ts,js}')],
    middlewares: [
      RequestLoggerMiddleware,
      ErrorMiddleware,
      NotFoundMiddleware, // This must be registered last
    ],
    defaultErrorHandler: false,
    cors: corsOptions,
    routePrefix: '/api',
    development: env.NODE_ENV !== Environment.Production,
  });

  logger.info('Express application configured with routing-controllers');

  return app;
}
