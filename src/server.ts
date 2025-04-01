import 'reflect-metadata';
import { env } from '@src/config/env.config';
import { createApp } from '@src/app/app';
import { gracefulShutdown } from './utils/app/app.util';
import { logger } from '@src/services/logger/logger.service';
import http from 'http';

/**
 * Starts the HTTP server with the Express application
 */
async function bootstrap(): Promise<void> {
  try {
    // Create Express app
    const app = createApp();

    // Create HTTP server
    const server = http.createServer(app);

    // Start the server
    server.listen(env.PORT, () => {
      logger.info(`Server started successfully`, {
        port: env.PORT,
        environment: env.NODE_ENV,
        appName: env.APP_NAME,
      });
    });

    // Handle server errors
    server.on('error', (error: Error) => {
      logger.error('Server error occurred', { error });
      process.exit(1);
    });

    // Handle graceful shutdown for different signals
    process.on('SIGTERM', async () => await gracefulShutdown(server, 'SIGTERM'));
    process.on('SIGINT', async () => await gracefulShutdown(server, 'SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error : new Error(String(error)),
    });
    process.exit(1);
  }
}

// Start the server
bootstrap().catch((error: unknown) => {
  logger.fatal('Failed to bootstrap application', {
    error: error instanceof Error ? error : new Error(String(error)),
  });
  process.exit(1);
});
