import 'reflect-metadata';
import http from 'http';
import { createApp } from '@src/app';
import { logger } from '@src/services/logger.service';
import { env } from '@src/config/env.config';

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

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
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
