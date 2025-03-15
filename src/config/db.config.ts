import { Pool, PoolConfig } from 'pg';
import { env } from '@src/config/env.config';
import { logger } from '@/services/logger.service';

const dbLogger = logger.setContext('Database');

export type GetDbConfigOptions = {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  max?: number;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
};

/**
 * Gets database configuration with optional overrides
 *
 * @param config - Optional configuration overrides
 * @returns Pool configuration object
 */
export const getDbConfig = (config?: GetDbConfigOptions): PoolConfig => ({
  host: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
  connectionTimeoutMillis: env.CONNECTION_TIMEOUT_MILLIS,
  max: env.MAX_POOL_SIZE,
  idleTimeoutMillis: env.IDLE_TIMEOUT_MILLIS,
  ...config,
});

/**
 * Singleton database connection pool
 */
export const pool = new Pool(getDbConfig());

pool.on('error', (err, client) => {
  dbLogger.error('Database connection error', err);
});

pool.on('connect', () => {
  dbLogger.info('New client connected to database');
});

pool.on('remove', () => {
  dbLogger.debug('Database connection removed from pool');
});

process.on('SIGTERM', () => {
  pool.end().then(() => {
    console.log('Database pool has ended');
    process.exit(0);
  });
});
