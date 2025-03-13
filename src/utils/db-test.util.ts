import { Pool } from 'pg';
import { getDbConfig, GetDbConfigOptions } from '@src/config/db.config';

export const getRandomTestDbName = () =>
  `test_db_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

/**
 * Configuration options for database operations with a required database name
 */
type GetDbConfigOptionsWithName = Omit<GetDbConfigOptions, 'database'> & { database: string };

/**
 * Result of creating a test database
 */
type CreateTestDb = {
  /** Pool client connected to the test database */
  testClient: Pool;
  /** Name of the created test database */
  testDbName: string;
};

/**
 * Creates a new database with the specified configuration
 *
 * @param mainClient - PostgreSQL client with permissions to create databases
 * @param config - Configuration including the database name to create
 * @returns A new Pool connected to the created database
 */
export const createDb = async (
  mainClient: Pool,
  config: GetDbConfigOptionsWithName,
): Promise<Pool> => {
  await mainClient.query(`CREATE DATABASE ${config.database}`);

  return new Pool(getDbConfig(config));
};

/**
 * Drops a database
 *
 * @param mainClient - PostgreSQL client with permissions to drop databases
 * @param database - Name of the database to drop
 * @returns Promise that resolves when the database is dropped
 */
export const dropDb = async (mainClient: Pool, database: string): Promise<void> => {
  if (!database) {
    throw new Error('Database name is required to drop a database');
  }

  // Terminate all connections to the database before dropping it
  await mainClient.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${database}'
      AND pid <> pg_backend_pid()
    `);

  // Drop the database
  await mainClient.query(`DROP DATABASE IF EXISTS ${database}`);
};

/**
 * Creates a test database with the specified configuration
 *
 * @param mainClient - PostgreSQL client with permissions to create databases
 * @param config - Configuration including the database name to create
 * @returns Object containing the test client and database name
 */
export const createTestDb = async (
  mainClient: Pool,
  config?: GetDbConfigOptionsWithName,
): Promise<CreateTestDb> => {
  const testDbName = config?.database || getRandomTestDbName();

  const testClient = await createDb(mainClient, { ...config, database: testDbName });

  return { testClient, testDbName };
};
