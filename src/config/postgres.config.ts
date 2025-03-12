import { Pool, PoolConfig } from 'pg';
import { env } from '@src/config/env.config';
import { Environment } from '@src/types/app.types';
import { logger } from '@/services/logger.service';

const dbLogger = logger.setContext('Database');

/**
 * Gets the database configuration based on the current environment
 * @returns PostgreSQL pool configuration
 */
export const getDbConfig = (): PoolConfig => {
  const baseConfig = {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    connectionTimeoutMillis: 5000,
    max: 20,
    idleTimeoutMillis: 30000,
  };

  if (env.NODE_ENV === Environment.Test) {
    dbLogger.info('Using test database configuration', { database: env.POSTGRES_DB });
    return {
      ...baseConfig,
      max: 2, // Limit connections for tests
      idleTimeoutMillis: 10000, // Shorter idle timeout for tests
    };
  }

  return baseConfig;
};

// Create a single pool instance for the application
export const pool = new Pool(getDbConfig());

// Log connection events
pool.on('error', (err, client) => {
  dbLogger.error('Database connection error', err);
});

pool.on('connect', () => {
  dbLogger.info('New client connected to database');
});

pool.on('remove', () => {
  dbLogger.debug('Database connection removed from pool');
});

// Handle application shutdown gracefully
process.on('SIGTERM', async () => {
  dbLogger.info('SIGTERM received, closing database pool');
  try {
    await pool.end();
    dbLogger.info('Database pool has ended gracefully');
  } catch (err) {
    dbLogger.error(
      'Error closing database pool during shutdown',
      err instanceof Error ? err : new Error(String(err)),
    );
  } finally {
    process.exit(0);
  }
});

// Also handle SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  dbLogger.info('SIGINT received, closing database pool');
  try {
    await pool.end();
    dbLogger.info('Database pool has ended gracefully');
  } catch (err) {
    dbLogger.error(
      'Error closing database pool during shutdown',
      err instanceof Error ? err : new Error(String(err)),
    );
  } finally {
    process.exit(0);
  }
});
