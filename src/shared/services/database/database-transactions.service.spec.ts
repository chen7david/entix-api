import { DatabaseService } from '@shared/services/database/database.service';
import { ConfigService } from '@shared/services/config/config.service';
import { users } from '@domains/user/user.schema';
import { sql } from 'drizzle-orm';
import { faker } from '@faker-js/faker';

describe('Transaction Isolation Tests', () => {
  let dbService: DatabaseService;

  beforeAll(() => {
    // Create the services directly
    const configService = new ConfigService();
    dbService = new DatabaseService(configService);
  });

  afterAll(async () => {
    if (dbService) {
      await dbService.cleanup();
    }
  });

  it('should properly rollback transactions', async () => {
    // Count users before
    const beforeCount = await dbService.db.select({ count: sql<number>`count(*)` }).from(users);
    console.log('Users before transaction:', beforeCount[0].count);

    // Begin a transaction
    await dbService.beginTransaction();

    try {
      // Insert a user in the transaction
      const userEmail = faker.internet.email();
      const username = faker.internet.userName();

      await dbService.db.insert(users).values({
        email: userEmail,
        username: username,
        isActive: true,
      });

      // Check count during transaction
      const duringCount = await dbService.db.select({ count: sql<number>`count(*)` }).from(users);
      console.log('Users during transaction:', duringCount[0].count);

      // Verify count increased
      expect(Number(duringCount[0].count)).toBeGreaterThan(Number(beforeCount[0].count));
    } finally {
      // Now rollback the transaction
      await dbService.rollbackTransaction();
    }

    // Check count after rollback
    const afterCount = await dbService.db.select({ count: sql<number>`count(*)` }).from(users);
    console.log('Users after rollback:', afterCount[0].count);

    // Verify count returned to original value
    expect(Number(afterCount[0].count)).toBe(Number(beforeCount[0].count));
  });

  // it('should allow multiple transactions in sequence', async () => {
  //   // First transaction
  //   await dbService.beginTransaction();

  //   try {
  //     const userEmail1 = faker.internet.email();
  //     await dbService.db.insert(users).values({
  //       email: userEmail1,
  //       username: faker.internet.userName(),
  //       isActive: true,
  //     });

  //     const count1 = await dbService.db.select({ count: sql<number>`count(*)` }).from(users);
  //     console.log('Count after first insert:', count1[0].count);
  //   } finally {
  //     await dbService.rollbackTransaction();
  //   }

  //   // Second transaction
  //   await dbService.beginTransaction();

  //   try {
  //     const userEmail2 = faker.internet.email();
  //     await dbService.db.insert(users).values({
  //       email: userEmail2,
  //       username: faker.internet.userName(),
  //       isActive: true,
  //     });

  //     const count2 = await dbService.db.select({ count: sql<number>`count(*)` }).from(users);
  //     console.log('Count after second insert:', count2[0].count);
  //   } finally {
  //     await dbService.rollbackTransaction();
  //   }

  //   // Verify final state
  //   const finalCount = await dbService.db.select({ count: sql<number>`count(*)` }).from(users);
  //   console.log('Final count after both transactions:', finalCount[0].count);
  // });
});
