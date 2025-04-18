import 'reflect-metadata';
import express from 'express';
import { useExpressServer, useContainer } from 'routing-controllers';
import { AppServiceOptions } from './app.types';
import { Container } from '@src/shared/utils/typedi/typedi.util';

/**
 * AppService creates and configures an Express application
 * with routing-controllers integration.
 */
export class AppService {
  private app: express.Application;

  /**
   * Creates a new AppService instance with the provided options.
   *
   * @param options - Configuration options for the Express application
   */
  constructor(options: AppServiceOptions) {
    /**
     * Use the Container from typedi for routing-controllers
     */
    useContainer(Container);

    if (!options) {
      throw new Error('AppServiceOptions is required');
    }

    this.app = express();

    if (typeof options.beforeRoutes !== 'function') {
      throw new Error('beforeRoutes must be a function');
    }

    if (typeof options.afterRoutes !== 'function') {
      throw new Error('afterRoutes must be a function');
    }

    options.beforeRoutes(this.app);
    this.applyRoutes(options);
    options.afterRoutes(this.app);
  }

  /**
   * Returns the configured Express application.
   *
   * @returns The Express application instance
   */
  public getApp(): express.Application {
    return this.app;
  }

  /**
   * Applies routes and middleware to the Express application
   * using routing-controllers.
   *
   * @param options - Configuration options for routing-controllers
   */
  public applyRoutes({
    controllers,
    routePrefix,
    middlewares,
    authorizationChecker,
    currentUserChecker,
  }: AppServiceOptions): void {
    if (!controllers || controllers.length === 0) {
      throw new Error('At least one controller is required');
    }

    useExpressServer(this.app, {
      routePrefix,
      validation: false,
      classTransformer: false,
      defaultErrorHandler: false,
      cors: true,
      controllers,
      middlewares,
      authorizationChecker,
      currentUserChecker,
    });
  }
}
