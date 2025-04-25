import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { Injectable } from '@shared/utils/ioc.util';
import { ConfigService } from '@shared/services/config/config.service';
import * as schema from '@database/schema';

/**
 * Service for managing the PostgreSQL database connection using Drizzle ORM.
 * Injects ConfigService for configuration and exposes a cleanup method for graceful shutdown.
 */
@Injectable()
export class DatabaseService {
  private pool: Pool;
  public db;

  /**
   * Constructs the DatabaseService and initializes the Drizzle instance.
   * @param configService - The injected ConfigService for environment variables.
   */
  constructor(private readonly configService: ConfigService) {
    const dbUrl = this.configService.get('DATABASE_URL');
    this.pool = new Pool({ connectionString: dbUrl });
    this.db = drizzle(this.pool, { schema });
  }

  /**
   * Gracefully closes the database connection pool.
   * Should be called by the ServerService before shutdown.
   */
  async cleanup(): Promise<void> {
    await this.pool.end();
  }
}
