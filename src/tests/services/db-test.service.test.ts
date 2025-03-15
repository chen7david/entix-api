import { Pool } from 'pg';
import { DbTestService } from './db-test.service';
import { pool as appPool } from '@src/config/db.config';

// Import the TestDatabase type by examining the exports
type TestDatabase = {
  name: string;
  pool: Pool;
  createdAt: Date;
};

/**
 * Tests for the Database Test Service
 */
describe('DbTestService', () => {
  let adminPool: Pool;
  let dbTestService: DbTestService;

  // Keep track of databases created during tests
  const createdDatabaseNames: string[] = [];

  beforeAll(() => {
    // Use the main application pool for admin operations
    adminPool = appPool;

    // Create a new service instance for testing
    dbTestService = new DbTestService(adminPool);
  });

  afterAll(async () => {
    // Clean up any databases that might have been left over
    for (const dbName of createdDatabaseNames) {
      try {
        await adminPool.query(
          `
          SELECT pg_terminate_backend(pg_stat_activity.pid)
          FROM pg_stat_activity
          WHERE pg_stat_activity.datname = $1
          AND pid <> pg_backend_pid()
        `,
          [dbName],
        );

        await adminPool.query(`DROP DATABASE IF EXISTS "${dbName}"`);
      } catch (error) {
        console.error(`Error cleaning up test database ${dbName}:`, error);
      }
    }
  });

  /**
   * Tests for the constructor
   */
  describe('constructor', () => {
    it('should create a new instance with valid pool', () => {
      const service = new DbTestService(adminPool);

      expect(service).toBeInstanceOf(DbTestService);
    });

    it('should throw an error if pool is null', () => {
      expect(() => new DbTestService(null as unknown as Pool)).toThrow('Admin pool is required');
    });
  });

  /**
   * Tests for the random database name generation
   */
  describe('generateTestDbName', () => {
    it('should generate a name with test_db prefix', () => {
      const dbName = dbTestService.generateTestDbName();

      expect(dbName).toContain('test_db_');
    });

    it('should generate unique names for multiple calls', () => {
      const dbName1 = dbTestService.generateTestDbName();
      // Add a small delay to ensure different timestamp
      const dbName2 = dbTestService.generateTestDbName();

      expect(dbName1).not.toEqual(dbName2);
    });
  });

  /**
   * Tests for the connection pool creation
   */
  describe('createConnectionPool', () => {
    it('should create a pool with default settings', () => {
      const pool = dbTestService.createConnectionPool();

      expect(pool).toBeInstanceOf(Pool);

      // Clean up
      pool.end();
    });

    it('should respect custom configuration', () => {
      const maxConnections = 5;
      const pool = dbTestService.createConnectionPool({ max: maxConnections });

      expect(pool).toBeInstanceOf(Pool);
      expect(pool.options.max).toBe(maxConnections);

      // Clean up
      pool.end();
    });
  });

  /**
   * Tests for database creation
   */
  describe('createDatabase', () => {
    it('should create a database with the specified name', async () => {
      const dbName = `test_db_create_${Date.now()}`;
      createdDatabaseNames.push(dbName);

      const result = await dbTestService.createDatabase({ database: dbName });

      expect(result.name).toBe(dbName);
      expect(result.pool).toBeInstanceOf(Pool);
      expect(result.createdAt).toBeInstanceOf(Date);

      // Verify the database exists
      const checkResult = await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [
        dbName,
      ]);

      expect(checkResult.rows.length).toBe(1);

      // Clean up
      await dbTestService.dropDatabase(dbName);
    });

    it('should throw an error if database name is missing', async () => {
      await expect(dbTestService.createDatabase({ database: '' })).rejects.toThrow(
        'Database name is required',
      );
    });

    it('should throw an error if database name doesn\'t include "test"', async () => {
      await expect(dbTestService.createDatabase({ database: 'production_db' })).rejects.toThrow(
        'must include "test"',
      );
    });
  });

  /**
   * Tests for test database creation
   */
  describe('createTestDatabase', () => {
    it('should create a database with a random name if none is provided', async () => {
      const result = await dbTestService.createTestDatabase();
      createdDatabaseNames.push(result.name);

      expect(result.name).toContain('test_db_');
      expect(result.pool).toBeInstanceOf(Pool);

      // Clean up
      await dbTestService.dropDatabase(result.name);
    });

    it('should create a database with the specified name', async () => {
      const dbName = `test_db_custom_${Date.now()}`;
      createdDatabaseNames.push(dbName);

      const result = await dbTestService.createTestDatabase({ database: dbName });

      expect(result.name).toBe(dbName);

      // Clean up
      await dbTestService.dropDatabase(dbName);
    });
  });

  /**
   * Tests for database dropping
   */
  describe('dropDatabase', () => {
    it('should drop a database and remove it from managed databases', async () => {
      // Create a database to drop
      const dbName = `test_db_drop_${Date.now()}`;
      createdDatabaseNames.push(dbName);

      await dbTestService.createDatabase({ database: dbName });

      // Verify it exists
      let checkResult = await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [
        dbName,
      ]);

      expect(checkResult.rows.length).toBe(1);

      // Drop it
      await dbTestService.dropDatabase(dbName);

      // Verify it's gone
      checkResult = await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);

      expect(checkResult.rows.length).toBe(0);

      // Verify it's no longer in managed databases
      expect(dbTestService.getManagedDatabases().find(db => db.name === dbName)).toBeUndefined();
    });

    it('should throw an error if database name is missing', async () => {
      await expect(dbTestService.dropDatabase('')).rejects.toThrow('Database name is required');
    });

    it('should throw an error if database name doesn\'t include "test"', async () => {
      await expect(dbTestService.dropDatabase('production_db')).rejects.toThrow(
        'can only drop databases',
      );
    });

    it('should throw an error if database is not managed', async () => {
      await expect(dbTestService.dropDatabase('test_db_nonexistent')).rejects.toThrow(
        'not found in managed databases',
      );
    });
  });

  /**
   * Tests for cleaning up all databases
   */
  describe('cleanupAllDatabases', () => {
    it('should clean up all managed databases', async () => {
      // Create a few test databases
      const dbName1 = `test_db_cleanup1_${Date.now()}`;
      const dbName2 = `test_db_cleanup2_${Date.now()}`;
      createdDatabaseNames.push(dbName1, dbName2);

      await dbTestService.createDatabase({ database: dbName1 });
      await dbTestService.createDatabase({ database: dbName2 });

      // Verify we have managed databases
      const managedBefore = dbTestService.getManagedDatabases();
      expect(managedBefore.length).toBeGreaterThanOrEqual(2);

      // Clean up all databases
      await dbTestService.cleanupAllDatabases();

      // Verify all databases are removed from managed list
      const managedAfter = dbTestService.getManagedDatabases();
      expect(managedAfter.length).toBe(0);

      // Verify databases are actually dropped
      const checkResult1 = await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [
        dbName1,
      ]);

      const checkResult2 = await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [
        dbName2,
      ]);

      expect(checkResult1.rows.length).toBe(0);
      expect(checkResult2.rows.length).toBe(0);
    });
  });

  /**
   * Tests for getting managed databases
   */
  describe('getManagedDatabases', () => {
    it('should return a copy of the managed databases array', async () => {
      // Create a test database
      const dbName = `test_db_getmanaged_${Date.now()}`;
      createdDatabaseNames.push(dbName);

      await dbTestService.createDatabase({ database: dbName });

      // Get the managed databases
      const managed = dbTestService.getManagedDatabases();

      // Verify the database is in the list
      expect(managed.some(db => db.name === dbName)).toBe(true);

      // Verify it's a copy by checking that modifying it doesn't affect the original
      const originalLength = managed.length;
      (managed as TestDatabase[]).pop(); // Cast to mutable array and modify

      const managedAfter = dbTestService.getManagedDatabases();
      expect(managedAfter.length).toBe(originalLength);

      // Clean up
      await dbTestService.dropDatabase(dbName);
    });
  });
});
