import 'reflect-metadata';
import express from 'express';
import { notFoundMiddleware } from '@src/middleware/not-found.middleware';
import { healthController } from '@src/domains/health/health.controller';
import { AppService } from '@src/services/app/app.service';
import path from 'path';

export const appService = new AppService({
  routePrefix: '/api',
  controllers: [path.join(__dirname, 'domains', '**', '*.controller.{ts,js}')],

  beforeRoutes: async (app) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.get('/health', healthController);
  },

  afterRoutes: async (app) => {
    app.use(notFoundMiddleware);
  },
});
