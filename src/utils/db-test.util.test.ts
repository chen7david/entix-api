import { pool } from '@src/config/db.config';
import { env } from '@src/config/env.config';
import {
  createDb,
  createTestDb,
  dropDb,
  getRandomTestDbName,
  getPool,
  cleanUpTestDb,
} from './db-test.util';

describe('Database Test Utilities', () => {
  const adminPool = pool;

  beforeAll(async () => {
    // Ensure we're not running tests on production database
    expect(env.NODE_ENV).toBe('test');
  });

  describe('createDb', () => {
    it('should create a new database', async () => {
      // Create a test database
      const testDbConfig = {
        database: getRandomTestDbName(),
      };

      // Create the test database
      const testClient = await createDb(adminPool, testDbConfig);
      const testDbName = testDbConfig.database;

      // Verify the database exists by querying for its name
      const result = await testClient.query('SELECT current_database()');
      expect(result.rows[0].current_database).toBe(testDbName);

      // Clean up the test database
      await cleanUpTestDb(adminPool, testClient);
    });
  });

  describe('createTestDb', () => {
    it('should create a test database and return client and name', async () => {
      // Create a test database
      const testDbConfig = {
        database: getRandomTestDbName(),
      };

      // Create the test database
      const { client: testClient, dbName: testDbName } = await createTestDb(
        adminPool,
        testDbConfig,
      );

      // Verify the database exists and client is connected to it
      const queryResult = await testClient.query('SELECT current_database()');
      expect(queryResult.rows[0].current_database).toBe(testDbName);
      expect(testDbName).toBe(testDbConfig.database);

      // Clean up the test database
      await cleanUpTestDb(adminPool, testClient);
    });
  });

  describe('dropDb', () => {
    it('should drop a database', async () => {
      // Create the test database
      const { client: testClient, dbName: testDbName } = await createTestDb(adminPool);

      // Check the Db was created
      const checkExistQuery = await adminPool.query(
        'SELECT datname FROM pg_database WHERE datname = $1',
        [testDbName],
      );
      expect(checkExistQuery.rows.length).toBe(1);

      // Clean up the test database
      await cleanUpTestDb(adminPool, testClient);

      // Verify the database no longer exists by querying pg_database
      const checkDeletedQuery = await adminPool.query(
        'SELECT datname FROM pg_database WHERE datname = $1',
        [testDbName],
      );
      expect(checkDeletedQuery.rows.length).toBe(0);
    });

    it('should throw an error if database name is not provided', async () => {
      await expect(dropDb(adminPool, '')).rejects.toThrow('Database name is required');
    });
  });

  /**
   * Tests for the getPool function
   */
  describe('getPool', () => {
    it('should create a pool with custom max connections', async () => {
      const maxConnections = 5;
      const testClient = getPool({ max: maxConnections });

      // Verify the connection works
      const result = await testClient.query('SELECT NOW()');
      expect(result.rows).toHaveLength(1);

      // Check internal properties
      expect(testClient.options.max).toBe(maxConnections);

      // close the test client
      await testClient.end();
    });

    it('should create a pool with custom timeouts', async () => {
      const connectionTimeout = 5000;
      const idleTimeout = 10000;

      const testClient = getPool({
        connectionTimeoutMillis: connectionTimeout,
        idleTimeoutMillis: idleTimeout,
      });

      // Verify the connection works
      const result = await testClient.query('SELECT NOW()');
      expect(result.rows).toHaveLength(1);

      // Check internal properties
      expect(testClient.options.connectionTimeoutMillis).toBe(connectionTimeout);
      expect(testClient.options.idleTimeoutMillis).toBe(idleTimeout);

      // close the test client
      await testClient.end();
    });

    it('should respect custom database name in pool configuration', async () => {
      // Use the same database for testing but demonstrate that the custom config is used
      const { client: testClient1, dbName: testDbName1 } = await createTestDb(adminPool);
      const testClient2 = getPool({ database: testDbName1 });

      // Verify connection works
      const result = await testClient2.query('SELECT current_database()');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].current_database).toBe(testDbName1);

      // close the test client
      await testClient2.end();

      // clean up the test database
      await cleanUpTestDb(adminPool, testClient1);
    });

    it('should create separate pool instances when using getPool', async () => {
      const pool1 = getPool();
      const pool2 = getPool();

      // Verify connections work
      await pool1.query('SELECT 1');
      await pool2.query('SELECT 1');

      // Cleanup
      await pool1.end();
      await pool2.end();

      // They should be different instances
      expect(pool1).not.toBe(pool2);
    });
  });
});
