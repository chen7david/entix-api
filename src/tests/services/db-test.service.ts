import { getDbConfig, GetDbConfigOptions } from '@src/config/db.config';
import { Pool } from 'pg';

/**
 * Configuration for creating a database with a required database name
 */
type DatabaseConfig = Omit<GetDbConfigOptions, 'database'> & { database: string };

/**
 * Represents a created test database with its connection pool
 */
type TestDatabase = {
  /** The name of the database */
  name: string;
  /** The connection pool for the database */
  pool: Pool;
  /** Creation timestamp for tracking purposes */
  createdAt: Date;
};

/**
 * Service for managing test databases during testing
 *
 * This service handles creation, connection, and cleanup of test databases
 * to ensure proper isolation between tests and prevent resource leaks.
 */
export class DbTestService {
  private readonly adminPool: Pool;
  private managedDatabases: TestDatabase[] = [];

  /**
   * Creates a new DbTestService
   *
   * @param adminPool - PostgreSQL client with permissions to create/drop databases
   */
  constructor(adminPool: Pool) {
    if (!adminPool) {
      throw new Error('Admin pool is required to create a DbTestService');
    }
    this.adminPool = adminPool;
  }

  /**
   * Generates a random database name for testing
   *
   * @returns A unique database name prefixed with "test_db_"
   */
  generateTestDbName(): string {
    return `test_db_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * Creates a new database connection pool with the specified configuration
   *
   * @param config - Optional configuration options for the database connection
   * @returns A new database connection pool
   */
  createConnectionPool(config?: GetDbConfigOptions): Pool {
    const poolConfig = getDbConfig({
      // Set reasonable defaults for test databases
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 1000,
      max: 3,
      ...config,
    });

    return new Pool(poolConfig);
  }

  /**
   * Creates a new database and returns a connection pool for it
   *
   * @param config - Configuration including the database name to create
   * @returns The created database information including its connection pool
   * @throws Error if database creation fails
   */
  async createDatabase(config: DatabaseConfig): Promise<TestDatabase> {
    if (!config.database) {
      throw new Error('Database name is required to create a database');
    }

    if (!config.database.includes('test')) {
      throw new Error('For safety, database names must include "test"');
    }

    try {
      await this.adminPool.query(`CREATE DATABASE "${config.database}"`);

      const pool = this.createConnectionPool(config);
      const testDb: TestDatabase = {
        name: config.database,
        pool,
        createdAt: new Date(),
      };

      this.managedDatabases.push(testDb);
      return testDb;
    } catch (error) {
      throw new Error(
        `Failed to create database ${config.database}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Creates a test database with a random name or specified configuration
   *
   * @param config - Optional configuration for the test database
   * @returns The created test database information
   * @throws Error if database creation fails
   */
  async createTestDatabase(config?: Partial<DatabaseConfig>): Promise<TestDatabase> {
    const dbName = config?.database || this.generateTestDbName();
    return this.createDatabase({ ...config, database: dbName });
  }

  /**
   * Drops a database and cleans up its connection pool
   *
   * @param dbName - Name of the database to drop
   * @throws Error if the database cannot be found or dropped
   */
  async dropDatabase(dbName: string): Promise<void> {
    if (!dbName) {
      throw new Error('Database name is required to drop a database');
    }

    if (!dbName.includes('test')) {
      throw new Error('For safety, can only drop databases with "test" in the name');
    }

    const databaseToRemove = this.managedDatabases.find(db => db.name === dbName);
    if (!databaseToRemove) {
      throw new Error(`Database ${dbName} not found in managed databases`);
    }

    try {
      // First end all client connections
      await databaseToRemove.pool.end();

      // Terminate all connections to the database before dropping it
      await this.adminPool.query(
        `
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid()
        `,
        [dbName],
      );

      // Drop the database
      await this.adminPool.query(`DROP DATABASE IF EXISTS "${dbName}"`);

      // Remove from managed databases
      this.managedDatabases = this.managedDatabases.filter(db => db.name !== dbName);
    } catch (error) {
      throw new Error(
        `Failed to drop database ${dbName}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Cleans up all managed databases and their connection pools
   *
   * @returns Promise that resolves when all databases are cleaned up
   */
  async cleanupAllDatabases(): Promise<void> {
    const errors: Error[] = [];

    // Copy the array since we'll be modifying it during iteration
    const databasesToCleanup = [...this.managedDatabases];

    for (const { name, pool } of databasesToCleanup) {
      try {
        // First close the pool connection
        await pool.end();

        // Terminate other connections to the database
        await this.adminPool.query(
          `
          SELECT pg_terminate_backend(pg_stat_activity.pid)
          FROM pg_stat_activity
          WHERE pg_stat_activity.datname = $1
          AND pid <> pg_backend_pid()
          `,
          [name],
        );

        // Drop the database
        await this.adminPool.query(`DROP DATABASE IF EXISTS "${name}"`);
      } catch (error) {
        errors.push(
          new Error(
            `Failed to clean up database ${name}: ${error instanceof Error ? error.message : String(error)}`,
          ),
        );
      }
    }

    // Clear the managed databases list
    this.managedDatabases.length = 0;

    // If there were any errors, throw a combined error
    if (errors.length > 0) {
      throw new Error(`Errors occurred during cleanup: ${errors.map(e => e.message).join(', ')}`);
    }
  }

  /**
   * Gets the list of currently managed databases
   *
   * @returns Array of managed database information
   */
  getManagedDatabases(): ReadonlyArray<TestDatabase> {
    return [...this.managedDatabases];
  }
}
