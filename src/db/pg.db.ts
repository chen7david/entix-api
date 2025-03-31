import { env } from '@src/config/env.config';
import { Pool } from 'pg';
import { logger } from '@src/services/logger.service';
import { InternalError } from '@src/utils/error.util';

/**
 * Singleton pool instance to be reused across the application
 */
let poolInstance: Pool | null = null;

/**
 * Creates database connection configuration object from environment variables
 * @returns Database configuration object
 */
const createDbConfig = () => ({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

/**
 * Creates a new database pool and sets up event listeners
 * @returns A new Pool instance
 */
const createPool = (): Pool => {
  const dbConfig = createDbConfig();
  const pool = new Pool(dbConfig);

  logger.info('DB connection pool created', { dbConfig });

  pool.on('connect', () => {
    logger.info('A new connection has been opened');
  });

  pool.on('remove', () => {
    logger.info('A connection has been closed');
  });

  pool.on('error', err => {
    logger.error('Unexpected error on idle client', { error: err });
  });

  return pool;
};

/**
 * Gets a PostgreSQL connection pool instance
 * Creates a new pool if none exists or if the existing pool has ended
 * @returns Active PostgreSQL connection pool
 */
export const getPool = (): Pool => {
  if (!poolInstance || poolInstance.ended) {
    poolInstance = createPool();
  }
  return poolInstance;
};

/**
 * Shuts down the PostgreSQL connection pool
 * @returns Promise that resolves when the pool has been shut down
 */
export const shutdownDb = async (): Promise<void> => {
  if (!poolInstance) {
    logger.info('No active pool to shut down');
    return;
  }

  try {
    await poolInstance.end();
    logger.info('Pool has ended all connections');
  } catch (error) {
    const internalError = new InternalError({
      message: 'Error during pool shutdown',
      cause: error instanceof Error ? error : new Error(String(error)),
    });
    logger.error('Error during pool shutdown:', { error: internalError });
    throw internalError;
  }
};
