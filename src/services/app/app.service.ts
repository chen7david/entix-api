import 'reflect-metadata';
import path from 'path';
import express from 'express';
import { useExpressServer } from 'routing-controllers';
import { AppServiceOptions } from './app.types';

export class AppService {
  private app: express.Application;

  constructor(options: AppServiceOptions) {
    this.app = express();
    options.beforeRoutes(this.app);
    this.applyRoutes();
    options.afterRoutes(this.app);
  }

  public getApp() {
    return this.app;
  }

  public applyRoutes() {
    useExpressServer(this.app, {
      routePrefix: '/api',
      validation: false,
      classTransformer: false,
      defaultErrorHandler: false,
      cors: true,
      controllers: [
        path.join(__dirname, '..', 'domains', '**', '*.controller.{ts,js}'),
      ],
    });
  }
}
