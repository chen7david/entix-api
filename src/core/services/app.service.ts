import 'reflect-metadata';
import { GlobalErrorMiddleware } from '@core/middleware/global-error.middleware';
import { LoggerService } from '@core/services/logger.service';
import { Injectable } from '@core/utils/di.util';
import { ConfigService } from '@core/services/config.service';
import { CleanupHandler } from '@core/types/app.types';
import { useExpressServer } from 'routing-controllers';
import { useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

@Injectable()
export class AppService implements CleanupHandler {
  private readonly logger: LoggerService;
  private readonly app: express.Application;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.app = express();
    this.logger = loggerService.setContext('AppService');

    // Register container before anything else
    this.registerContainer();
    this.registerMiddlewares();
    this.registerControllers();
  }

  private registerMiddlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(helmet());
  }

  private registerControllers(): void {
    useExpressServer(this.app, {
      routePrefix: '/api',
      controllers: [__dirname + '/../../modules/**/*.controller.{ts,js}'],
      defaultErrorHandler: false,
      validation: false,
      middlewares: [GlobalErrorMiddleware],
    });
  }

  private registerContainer(): void {
    // Set up TypeDI as the container for routing-controllers
    useContainer(Container);
  }

  /**
   * Returns the Express application instance
   * @returns Express application
   */
  getApp(): express.Application {
    return this.app;
  }

  /**
   * Clean up application resources
   */
  public async cleanup(): Promise<void> {
    this.logger.info('Cleaning up application resources');
    // Add any app-specific cleanup logic here if needed
  }
}
