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
  client: Pool;
  /** Name of the created test database */
  dbName: string;
};

/**
 * Creates a new Pool connected to the database
 *
 * @param config - Configuration options for the database connection
 * @returns A new Pool connected to the database
 */
export const getPool = (config?: GetDbConfigOptions): Pool => {
  return new Pool(getDbConfig(config));
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

  return getPool(config);
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
  const dbName = config?.database || getRandomTestDbName();

  const client = await createDb(mainClient, { ...config, database: dbName });

  return { client, dbName };
};

/**
 * Safely cleans up a test database by closing connections and dropping the database
 * Extracts the database name from the test client
 *
 * @param mainClient - PostgreSQL client with permissions to drop databases
 * @param testClient - Client connected to the database that should be removed
 * @throws Error if database name doesn't include 'test' or if database name cannot be determined
 * @returns Promise that resolves when the cleanup is complete
 */
export const cleanUpTestDb = async (mainClient: Pool, testClient: Pool): Promise<void> => {
  try {
    // Extract database name from the test client
    const result = await testClient.query('SELECT current_database()');
    const dbName = result.rows[0]?.current_database;

    // Close the test client connection
    await testClient.end();

    if (!dbName) {
      throw new Error('Failed to determine database name from client');
    }

    // Safety check: only drop databases with 'test' in the name
    if (!dbName.toLowerCase().includes('test')) {
      throw new Error('Cannot drop database: name must include "test" for safety');
    }

    // Reuse existing dropDb function
    await dropDb(mainClient, dbName);
  } catch (error) {
    // Make sure client is closed even if there's an error
    if (testClient) {
      await testClient.end().catch(() => {});
    }
    throw error;
  }
};
