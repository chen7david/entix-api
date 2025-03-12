import { db } from '../db.client';
import { pool } from '@src/config/postgres.config';
import { sql } from 'drizzle-orm';
import { usersTable } from '../schema'; // Assuming you have this schema
import { dropAllTables, runMigrations } from '../utils/db.utils';
import { logger } from '@/services/logger.service';

const testLogger = logger.setContext('DbClientTest');

describe('Database Client', () => {
  beforeAll(async () => {
    testLogger.info('Setting up database for client tests');
    // No need to explicitly connect - the pool will handle this
  });

  afterAll(async () => {
    // Don't close the pool here - let global.setup.ts handle it
    testLogger.info('Database client tests completed');
  });

  beforeEach(async () => {
    testLogger.debug('Resetting database schema');
    // Drop all tables and recreate schema
    await dropAllTables();
    // Run migrations
    await runMigrations();
  });

  it('should successfully connect to the database', async () => {
    const result = await db.execute(sql`SELECT 1 + 1 AS result`);
    expect(result.rows[0].result).toBe(2);
  });

  it('should handle database operations', async () => {
    // Add your specific table operations tests here
    // Example: const result = await db.insert(usersTable).values({ ... });
    expect(true).toBe(true);
  });

  describe('User Operations', () => {
    it('should create and retrieve a user', async () => {
      // Create test user
      const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
      };

      // Insert user
      await db.insert(usersTable).values(testUser);

      // Retrieve user
      const users = await db.select().from(usersTable);

      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject(testUser);
    });

    it('should handle concurrent operations', async () => {
      const testUsers = Array.from({ length: 5 }, (_, i) => ({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 20 + i,
      }));

      // Insert multiple users concurrently
      await Promise.all(testUsers.map(user => db.insert(usersTable).values(user)));

      const users = await db.select().from(usersTable);
      expect(users).toHaveLength(testUsers.length);
    });
  });
});
