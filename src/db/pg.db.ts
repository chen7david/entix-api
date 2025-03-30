import { env } from '@src/config/env.config';
import { Pool } from 'pg';
import { logger } from '@src/services/logger.service';
import { InternalError } from '@src/utils/error.util';

class Pg {
  private static instance: Pg;
  private pool: Pool;

  private constructor() {
    const dbConfig = {
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
    };

    this.pool = new Pool(dbConfig);
    logger.info('DB connection pool created', { dbConfig });

    this.pool.on('connect', client => {
      logger.info('A new connection has been opened');
    });

    this.pool.on('remove', client => {
      logger.info('A connection has been closed');
    });

    this.pool.on('error', err => {
      logger.error('Unexpected error on idle client', { error: err });
    });
  }

  public static getInstance(): Pg {
    if (!Pg.instance) {
      Pg.instance = new Pg();
    }
    return Pg.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async shutdown(): Promise<void> {
    try {
      await this.pool.end();
      logger.info('Pool has ended all connections');
    } catch (error) {
      const internalError = new InternalError({
        message: 'Error during pool shutdown',
        cause: error instanceof Error ? error : new Error(String(error)),
      });
      logger.error('Error during pool shutdown:', { error: internalError });
      throw internalError;
    }
  }
}

export const pg = Pg.getInstance();
export const getPool = () => pg.getPool();
export const shutdownDb = () => pg.shutdown();
