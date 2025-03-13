import { Pool, PoolConfig } from 'pg';
import { env } from '@src/config/env.config';
import { Environment } from '@src/types/app.types';
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

export const getDbConfig = (config?: GetDbConfigOptions): PoolConfig => {
  const baseConfig = {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    connectionTimeoutMillis: 5000,
    max: 20,
    idleTimeoutMillis: 30000,
    ...config,
  };

  if (env.NODE_ENV === Environment.Test) {
    return {
      ...baseConfig,
      max: 2,
    };
  }

  return baseConfig;
};

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
