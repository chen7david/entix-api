import 'reflect-metadata';
import express from 'express';
import { notFoundMiddleware } from '@src/middleware/not-found.middleware';
import { healthController } from '@src/domains/health/health.controller';
import { AppService } from '@src/services/app/app.service';

export const appService = new AppService({
  beforeRoutes: (app) => {
    // Middleware to parse JSON bodies
    app.use(express.json());

    // Middleware to parse URL-encoded bodies
    app.use(express.urlencoded({ extended: true }));

    // Health check route
    app.get('/health', healthController);
  },

  afterRoutes: (app) => {
    // Not found middleware (must be called last)
    app.use(notFoundMiddleware);
  },
});
