import { drizzle } from 'drizzle-orm/node-postgres';
import { Injectable } from '@shared/utils/ioc.util';
import { ConfigService } from '@shared/services/config/config.service';
import * as schema from '@database/schema';
import { type PoolClient, Pool } from 'pg';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

/**
 * Service for managing the PostgreSQL database connection using Drizzle ORM.
 * Injects ConfigService for configuration and exposes a cleanup method for graceful shutdown.
 */
@Injectable()
export class DatabaseService {
  private pool: Pool;
  public db: NodePgDatabase<typeof schema> & { $client: Pool | PoolClient };
  private transactionClient?: PoolClient;

  /**
   * Constructs the DatabaseService and initializes the Drizzle instance.
   * @param configService - The injected ConfigService for environment variables.
   */
  constructor(private readonly configService: ConfigService) {
    const dbUrl = this.configService.get('DATABASE_URL');
    this.pool = new Pool({ connectionString: dbUrl });
    // Initialize Drizzle to use the pool
    this.db = drizzle(this.pool, { schema });
  }

  /**
   * Gracefully closes the database connection pool.
   * Should be called by the ServerService before shutdown.
   */
  async cleanup(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Begins a new transaction and switches Drizzle to use the transactional client.
   */
  public async beginTransaction(): Promise<void> {
    // Acquire a client for the transaction
    this.transactionClient = await this.pool.connect();
    // Switch Drizzle to use the transactional client
    this.db = drizzle(this.transactionClient, { schema });
    // Start the transaction
    await this.transactionClient.query('BEGIN');
  }

  /**
   * Rolls back the current transaction and restores Drizzle to use the pool.
   */
  public async rollbackTransaction(): Promise<void> {
    if (!this.transactionClient) return;
    // Roll back changes
    await this.transactionClient.query('ROLLBACK');
    // Release the transactional client
    await this.transactionClient.release();
    this.transactionClient = undefined;
    // Restore Drizzle to use the pool
    this.db = drizzle(this.pool, { schema });
  }
}
