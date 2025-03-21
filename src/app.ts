import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import {
  useExpressServer,
  getMetadataArgsStorage,
  JsonController,
  Get,
  Param,
  QueryParam,
} from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { logger } from '@src/services/logger.service';
import { env } from '@src/config/env.config';
import { Environment, HTTPMethod } from '@src/constants/app.constant';

/**
 * Configuration for creating the Express application with routing-controllers
 */
type AppConfig = {
  /** Whether to enable CORS for the application */
  cors?: boolean;
  /** Whether to enable detailed logging for requests */
  detailedLogging?: boolean;
};

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
  }

  /**
   * Sets up the middleware for the Express application
   * @param config - Configuration options for middleware
   */
  private setupMiddleware(config: AppConfig): void {
    // Enable CORS if configured
    if (config.cors) {
      this.app.use(
        cors({
          origin: '*',
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization'],
        }),
      );
      logger.debug('CORS middleware enabled');
    }

    // Configure JSON middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Add request logging middleware
    if (config.detailedLogging && env.NODE_ENV !== Environment.PRODUCTION) {
      this.app.use((req, res, next) => {
        const startTime = Date.now();

        // Log request
        logger.info(`${req.method} ${req.url}`, {
          method: req.method,
          url: req.url,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });

        // Log response time when request is complete
        res.on('finish', () => {
          const duration = Date.now() - startTime;
          logger.debug(`Request processed in ${duration}ms`, {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration,
          });
        });

        next();
      });
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
      controllers: [TestController],
      defaultErrorHandler: false,
      routePrefix: '/api',
      development: env.NODE_ENV !== Environment.PRODUCTION,
      validation: {
        whitelist: true,
        forbidNonWhitelisted: true,
      },
      classTransformer: true,
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
  const app = new App(config);
  return app.app;
};

/**
 * Test controller for demonstration purposes
 */
@JsonController('/test')
class TestController {
  /**
   * Simple health check endpoint
   * @returns Object with status message
   */
  @Get('/')
  getAll(): { message: string } {
    logger.info('TestController.getAll called');
    return { message: 'Test controller is working!' };
  }

  /**
   * Endpoint with a query parameter
   * @param name - Optional name query parameter
   * @returns Greeting message
   */
  @Get('/hello')
  getGreeting(@QueryParam('name') name?: string): { greeting: string } {
    const greeting = name ? `Hello, ${name}!` : 'Hello, World!';
    logger.info(`TestController.getGreeting called with name: ${name || 'undefined'}`);
    return { greeting };
  }

  /**
   * Endpoint with a path parameter
   * @param id - The ID parameter from the URL
   * @returns Object with the provided ID
   */
  @Get('/:id')
  getOne(@Param('id') id: string): { id: string; timestamp: string } {
    logger.info(`TestController.getOne called with id ${id}`);
    return {
      id,
      timestamp: new Date().toISOString(),
    };
  }
}
