import { Pool } from 'pg';
import { createDb, createTestDb, dropDb, getRandomTestDbName } from './test.util';
import { pool } from '@src/config/postgres.config';

describe('Database Test Utilities', () => {
  const mainClient = pool;
  const uniqueDbName = getRandomTestDbName();
  let testClient: Pool;
  let testDbName: string;

  beforeAll(async () => {
    // Ensure we're not running tests on production database
    expect(process.env.NODE_ENV).toBe('test');
  });

  afterAll(async () => {
    // Clean up any test databases that might have been created
    if (testClient) {
      await testClient.end();
    }

    if (testDbName) {
      await dropDb(mainClient, testDbName);
    }

    // Close the main client connection
    await mainClient.end();
  });

  describe('createDb', () => {
    it('should create a new database', async () => {
      // Create a test database
      const dbConfig = {
        database: uniqueDbName,
      };

      const client = await createDb(mainClient, dbConfig);

      // Verify the database exists by querying for its name
      const result = await client.query('SELECT current_database()');
      expect(result.rows[0].current_database).toBe(uniqueDbName);

      // Clean up
      await client.end();
      await dropDb(mainClient, uniqueDbName);
    });
  });

  describe('createTestDb', () => {
    it('should create a test database and return client and name', async () => {
      // Create a test database
      const dbConfig = {
        database: uniqueDbName,
      };

      const result = await createTestDb(mainClient, dbConfig);
      testClient = result.testClient;
      testDbName = result.testDbName;

      // Verify the database exists and client is connected to it
      const queryResult = await testClient.query('SELECT current_database()');
      expect(queryResult.rows[0].current_database).toBe(uniqueDbName);
      expect(testDbName).toBe(uniqueDbName);
    });
  });

  describe('dropDb', () => {
    it('should drop a database', async () => {
      // Create a temporary database to drop
      const { testClient, testDbName } = await createTestDb(mainClient);
      await testClient.end();

      // Check the Db was created
      const checkExistQuery = await mainClient.query(
        'SELECT datname FROM pg_database WHERE datname = $1',
        [testDbName],
      );
      expect(checkExistQuery.rows.length).toBe(1);
      // Drop the database
      await dropDb(mainClient, testDbName);

      // Verify the database no longer exists by querying pg_database
      const checkDeletedQuery = await mainClient.query(
        'SELECT datname FROM pg_database WHERE datname = $1',
        [testDbName],
      );
      expect(checkDeletedQuery.rows.length).toBe(0);
    });

    it('should throw an error if database name is not provided', async () => {
      await expect(dropDb(mainClient, '')).rejects.toThrow('Database name is required');
    });
  });
});
