import { useContainer, useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';
import express, { Express } from 'express';
import path from 'path';
import { Injectable } from '@shared/utils/ioc.util';

/**
 * AppService configures the Express app with routing-controllers and DI.
 */
@Injectable()
export class AppService {
  private app: Express;

  constructor() {
    useContainer(Container);
    this.app = express();
    useExpressServer(this.app, {
      routePrefix: '/api',
      controllers: [path.join(__dirname, '../../domains/**/*.controller.{ts,js}')],
      validation: false, // Disable class-validator
      classTransformer: false, // Disable class-transformer
    });
  }

  /**
   * Get the configured Express app instance.
   */
  getApp(): Express {
    return this.app;
  }
}
