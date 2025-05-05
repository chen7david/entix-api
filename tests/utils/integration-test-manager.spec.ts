import 'reflect-metadata';
import { IntegrationTestManager } from '@tests/utils/integration-test-manager.util';
import { Container } from 'typedi';
import { AppService } from '@shared/services/app/app.service';
import { DatabaseService } from '@shared/services/database/database.service';
import { users } from '@domains/user/user.schema';
import { userTenants } from '@domains/tenant/user-tenant.schema';
import { tenants } from '@domains/tenant/tenant.schema';
import { sql } from 'drizzle-orm';
import { faker } from '@faker-js/faker';

describe('IntegrationTestManager', () => {
  let manager: IntegrationTestManager;
  let dbService: DatabaseService;

  beforeAll(async () => {
    // Initialize container and services
    Container.reset();
    const appService = Container.get(AppService);
    dbService = Container.get(DatabaseService);
    manager = new IntegrationTestManager(appService, dbService);

    // First ensure the test database is in a known state
    // Remove data from tables with foreign key constraints first
    await dbService.db.delete(userTenants).where(sql`true`);
    await dbService.db.delete(users).where(sql`true`);
    await dbService.db.delete(tenants).where(sql`true`);
  });

  afterAll(async () => {
    await manager.close();
  });

  it('should properly initialize with Express app and supertest agent', () => {
    expect(manager.app).toBeDefined();
    expect(manager.request).toBeDefined();
    expect(manager.db).toBeDefined();
  });

  it('should begin and rollback transactions correctly', async () => {
    // 1. Get initial count
    const initialCount = await dbService.db.select({ count: sql<number>`count(*)` }).from(users);

    // 2. Begin a transaction
    await manager.beginTransaction();

    try {
      // 3. Insert a user within transaction
      const email = faker.internet.email();
      const username = faker.internet.username();

      await dbService.db.insert(users).values({
        email,
        username,
        isActive: true,
      });

      // 4. Verify user was created in transaction
      const duringTransactionCount = await dbService.db
        .select({ count: sql<number>`count(*)` })
        .from(users);

      // Count should be higher than initial
      expect(Number(duringTransactionCount[0].count)).toBeGreaterThan(
        Number(initialCount[0].count),
      );

      // 5. Find the specific user to confirm it exists
      const foundUser = await dbService.db
        .select()
        .from(users)
        .where(sql`email = ${email}`);

      expect(foundUser.length).toBe(1);
      expect(foundUser[0].email).toBe(email);
      expect(foundUser[0].username).toBe(username);
    } finally {
      // 6. Rollback the transaction
      await manager.rollbackTransaction();
    }

    // 7. Verify the count is back to the initial count after rollback
    const finalCount = await dbService.db.select({ count: sql<number>`count(*)` }).from(users);

    expect(Number(finalCount[0].count)).toBe(Number(initialCount[0].count));
  });

  it('should maintain isolation between multiple transactions', async () => {
    // Initial state
    const initialCount = await dbService.db.select({ count: sql<number>`count(*)` }).from(users);

    // First transaction
    await manager.beginTransaction();

    let email1 = faker.internet.email();
    try {
      // Insert user in first transaction
      await dbService.db.insert(users).values({
        email: email1,
        username: faker.internet.username(),
        isActive: true,
      });

      // Verify user exists in first transaction
      const firstTxUsers = await dbService.db
        .select()
        .from(users)
        .where(sql`email = ${email1}`);

      expect(firstTxUsers.length).toBe(1);
    } finally {
      await manager.rollbackTransaction();
    }

    // Second transaction
    await manager.beginTransaction();

    try {
      // Insert different user in second transaction
      const email2 = faker.internet.email();

      await dbService.db.insert(users).values({
        email: email2,
        username: faker.internet.username(),
        isActive: true,
      });

      // Verify second user exists in this transaction
      const secondTxUsers = await dbService.db
        .select()
        .from(users)
        .where(sql`email = ${email2}`);

      expect(secondTxUsers.length).toBe(1);

      // Try to find first user - should not exist due to transaction isolation
      const firstUserInSecondTx = await dbService.db
        .select()
        .from(users)
        .where(sql`email = ${email1}`);

      // Should not find the user from the first transaction
      expect(firstUserInSecondTx.length).toBe(0);
    } finally {
      await manager.rollbackTransaction();
    }

    // Verify final count matches initial count (both transactions rolled back)
    const finalCount = await dbService.db.select({ count: sql<number>`count(*)` }).from(users);

    expect(Number(finalCount[0].count)).toBe(Number(initialCount[0].count));
  });

  it('should work with HTTP requests maintaining transaction context', async () => {
    // Initial count
    const initialUserCount = await dbService.db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    // Begin transaction
    await manager.beginTransaction();

    try {
      // Create a user via API
      const userData = {
        email: faker.internet.email(),
        username: faker.internet.username(),
        isActive: true,
      };

      const createResponse = await manager.request.post('/api/v1/users').send(userData);

      expect(createResponse.status).toBe(201);

      // Get user and verify it exists in the transaction
      const getUserResponse = await manager.request.get('/api/v1/users');
      expect(getUserResponse.status).toBe(200);

      // Count should be higher than initial
      const duringTransactionCount = await dbService.db
        .select({ count: sql<number>`count(*)` })
        .from(users);

      expect(Number(duringTransactionCount[0].count)).toBeGreaterThan(
        Number(initialUserCount[0].count),
      );
    } finally {
      await manager.rollbackTransaction();
    }

    // Verify count is back to initial after rollback
    const finalCount = await dbService.db.select({ count: sql<number>`count(*)` }).from(users);

    expect(Number(finalCount[0].count)).toBe(Number(initialUserCount[0].count));
  });
});
