import { pool, getDbConfig } from '@src/config/db.config';
import { Pool } from 'pg';
import { env } from '@src/config/env.config';
import { createTestDb, getRandomTestDbName, cleanUpTestDb } from '@src/utils/db-test.util';

/**
 * Test database constants and queries
 */
// Test table definition
const TEST_TABLE_NAME = 'test_users';
const CREATE_TEST_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS ${TEST_TABLE_NAME} (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;
const DROP_TEST_TABLE_QUERY = `DROP TABLE IF EXISTS ${TEST_TABLE_NAME}`;
const TRUNCATE_TEST_TABLE_QUERY = `DELETE FROM ${TEST_TABLE_NAME}`;

// Common test data
const TEST_USER = { name: 'John Doe', email: 'john@example.com' };
const TEST_USER_JANE = { name: 'Jane Smith', email: 'jane@example.com' };
const TEST_USER_BOB = { name: 'Bob Wilson', email: 'bob@example.com' };
const TEST_USER_ALICE = { name: 'Alice Brown', email: 'alice@example.com' };
const TEST_USER_TRANSACTION = { name: 'Transaction User', email: 'transaction@example.com' };

// Common queries
const INSERT_USER_QUERY = `
  INSERT INTO ${TEST_TABLE_NAME} (name, email) 
  VALUES ($1, $2) 
  RETURNING *
`;
const INSERT_USER_RETURNING_ID_QUERY = `
  INSERT INTO ${TEST_TABLE_NAME} (name, email) 
  VALUES ($1, $2) 
  RETURNING id
`;
const SELECT_USER_BY_EMAIL_QUERY = `
  SELECT * FROM ${TEST_TABLE_NAME} WHERE email = $1
`;
const SELECT_USER_BY_ID_QUERY = `
  SELECT * FROM ${TEST_TABLE_NAME} WHERE id = $1
`;
const UPDATE_USER_NAME_QUERY = `
  UPDATE ${TEST_TABLE_NAME} SET name = $1 WHERE id = $2
`;
const DELETE_USER_BY_EMAIL_QUERY = `
  DELETE FROM ${TEST_TABLE_NAME} WHERE email = $1
`;
const SELECT_CURRENT_TIME_QUERY = 'SELECT NOW()';

/**
 * Tests for the database connection configuration utilities
 */
describe('Database Configuration', () => {
  /**
   * Tests for the default database pool
   */
  describe('Default Pool', () => {
    let adminPool: Pool;
    let testPool: Pool;
    let testDbName: string;

    beforeAll(async () => {
      // Use the default pool
      adminPool = pool;

      // create a test pool
      const testDbConfig = {
        database: getRandomTestDbName(),
      };

      const result = await createTestDb(adminPool, testDbConfig);
      testPool = result.client;
      testDbName = result.dbName;

      // Create test table
      await testPool.query(CREATE_TEST_TABLE_QUERY);
    });

    afterAll(async () => {
      // Drop test table and close connection
      await testPool.query(DROP_TEST_TABLE_QUERY);
      await cleanUpTestDb(adminPool, testPool);
    });

    afterEach(async () => {
      // Clean up data after each test
      await testPool.query(TRUNCATE_TEST_TABLE_QUERY);
    });

    beforeEach(async () => {
      // Clean up data before each test
      await testPool.query(TRUNCATE_TEST_TABLE_QUERY);
    });

    it('should connect to the database successfully', async () => {
      const result = await testPool.query(SELECT_CURRENT_TIME_QUERY);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].now).toBeDefined();
    });

    it('should create and insert data successfully', async () => {
      const result = await testPool.query(INSERT_USER_QUERY, [TEST_USER.name, TEST_USER.email]);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].name).toBe(TEST_USER.name);
      expect(result.rows[0].email).toBe(TEST_USER.email);
      expect(result.rows[0].id).toBeDefined();
      expect(result.rows[0].created_at).toBeDefined();
    });

    it('should read data successfully', async () => {
      // Insert test data
      await testPool.query(INSERT_USER_QUERY, [TEST_USER_JANE.name, TEST_USER_JANE.email]);

      const result = await testPool.query(SELECT_USER_BY_EMAIL_QUERY, [TEST_USER_JANE.email]);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].name).toBe(TEST_USER_JANE.name);
      expect(result.rows[0].email).toBe(TEST_USER_JANE.email);
    });

    it('should update data successfully', async () => {
      // Insert test data
      const insertResult = await testPool.query(INSERT_USER_RETURNING_ID_QUERY, [
        TEST_USER_BOB.name,
        TEST_USER_BOB.email,
      ]);
      const userId = insertResult.rows[0].id;
      const updatedName = 'Robert Wilson';

      // Update the record
      await testPool.query(UPDATE_USER_NAME_QUERY, [updatedName, userId]);

      // Verify the update
      const result = await testPool.query(SELECT_USER_BY_ID_QUERY, [userId]);
      expect(result.rows[0].name).toBe(updatedName);
      expect(result.rows[0].email).toBe(TEST_USER_BOB.email);
    });

    it('should delete data successfully', async () => {
      // Insert test data
      await testPool.query(INSERT_USER_QUERY, [TEST_USER_ALICE.name, TEST_USER_ALICE.email]);

      // Verify data exists
      let result = await testPool.query(SELECT_USER_BY_EMAIL_QUERY, [TEST_USER_ALICE.email]);
      expect(result.rows).toHaveLength(1);

      // Delete the record
      await testPool.query(DELETE_USER_BY_EMAIL_QUERY, [TEST_USER_ALICE.email]);

      // Verify deletion
      result = await testPool.query(SELECT_USER_BY_EMAIL_QUERY, [TEST_USER_ALICE.email]);
      expect(result.rows).toHaveLength(0);
    });

    it('should handle concurrent transactions correctly', async () => {
      const client = await testPool.connect();

      try {
        await client.query('BEGIN');

        await client.query(INSERT_USER_QUERY, [
          TEST_USER_TRANSACTION.name,
          TEST_USER_TRANSACTION.email,
        ]);

        // Verify data is visible within transaction
        const transactionResult = await client.query(SELECT_USER_BY_EMAIL_QUERY, [
          TEST_USER_TRANSACTION.email,
        ]);
        expect(transactionResult.rows).toHaveLength(1);

        await client.query('COMMIT');

        // Verify data is visible after commit
        const finalResult = await testPool.query(SELECT_USER_BY_EMAIL_QUERY, [
          TEST_USER_TRANSACTION.email,
        ]);
        expect(finalResult.rows).toHaveLength(1);
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    });
  });

  /**
   * Tests for the database configuration generation
   */
  describe('Database Configuration Generation', () => {
    it('should generate default config with environment variables', () => {
      const config = getDbConfig();

      expect(config.host).toBe(env.POSTGRES_HOST);
      expect(config.port).toBe(env.POSTGRES_PORT);
      expect(config.user).toBe(env.POSTGRES_USER);
      expect(config.password).toBe(env.POSTGRES_PASSWORD);
      expect(config.database).toBe(env.POSTGRES_DB);
      expect(config.connectionTimeoutMillis).toBe(env.CONNECTION_TIMEOUT_MILLIS);
      expect(config.max).toBe(env.MAX);
      expect(config.idleTimeoutMillis).toBe(env.IDLE_TIMEOUT_MILLIS);
    });

    it('should override default config with provided options', () => {
      const customOptions = {
        host: 'custom-host',
        port: 5433,
        user: 'custom-user',
        password: 'custom-password',
        database: 'custom-db',
        max: 10,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 10000,
      };

      const config = getDbConfig(customOptions);

      expect(config.host).toBe(customOptions.host);
      expect(config.port).toBe(customOptions.port);
      expect(config.user).toBe(customOptions.user);
      expect(config.password).toBe(customOptions.password);
      expect(config.database).toBe(customOptions.database);
      expect(config.connectionTimeoutMillis).toBe(customOptions.connectionTimeoutMillis);
      expect(config.max).toBe(customOptions.max);
      expect(config.idleTimeoutMillis).toBe(customOptions.idleTimeoutMillis);
    });

    it('should partially override config with provided options', () => {
      const customOptions = {
        max: 15,
        connectionTimeoutMillis: 7500,
      };

      const config = getDbConfig(customOptions);

      expect(config.host).toBe(env.POSTGRES_HOST);
      expect(config.port).toBe(env.POSTGRES_PORT);
      expect(config.user).toBe(env.POSTGRES_USER);
      expect(config.password).toBe(env.POSTGRES_PASSWORD);
      expect(config.database).toBe(env.POSTGRES_DB);
      expect(config.connectionTimeoutMillis).toBe(customOptions.connectionTimeoutMillis);
      expect(config.max).toBe(customOptions.max);
      expect(config.idleTimeoutMillis).toBe(env.IDLE_TIMEOUT_MILLIS);
    });
  });

  /**
   * Tests for the singleton pool instance
   */
  describe('Singleton Pool Instance', () => {
    it('should return a shared pool instance when using the imported pool', async () => {
      // The imported pool should be a singleton
      const result = await pool.query(SELECT_CURRENT_TIME_QUERY);
      expect(result.rows).toHaveLength(1);
    });
  });
});
