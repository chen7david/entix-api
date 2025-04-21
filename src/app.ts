import 'reflect-metadata';
import express from 'express';
import { notFoundMiddleware } from '@src/middleware/not-found.middleware';
import { healthController } from '@src/domains/health/health.controller';
import { AppService } from '@src/services/app/app.service';
import { ErrorHandlerMiddleware } from '@src/middleware/error.middleware';
import path from 'path';
import { Container } from '@src/shared/utils/typedi/typedi.util';

export function registerAppServiceWithOptions() {
  Container.set(
    AppService,
    new AppService({
      routePrefix: '/api',
      controllers: [
        path.join(__dirname, 'domains', '**', '*.controller.{ts,js}'),
      ],
      middlewares: [ErrorHandlerMiddleware],
      beforeRoutes: async (app) => {
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.get('/health', healthController);
      },
      afterRoutes: async (app) => {
        app.use(notFoundMiddleware);
      },
    })
  );
}
