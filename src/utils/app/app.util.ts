import { shutdownDb } from '@src/db/pg.db';
import { logger } from '@src/services/logger/logger.service';
import http from 'http';

/**
 * Handles graceful shutdown of the server and database connections
 * @param server - HTTP server instance
 * @param signal - Signal that triggered the shutdown
 */
export const gracefulShutdown = async (server: http.Server, signal: string): Promise<void> => {
  logger.info(`${signal} received, shutting down gracefully`);

  try {
    // Close database connections
    await shutdownDb();
    logger.info('Database connections closed');

    // Close the HTTP server
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error during shutdown', { error: err });
    process.exit(1);
  }
};
