import 'reflect-metadata';
import { IntegrationTestManager } from '@tests/utils/integration-test-manager.util';
import { Container } from 'typedi';
import { AppService } from '@shared/services/app/app.service';
import { DatabaseService } from '@shared/services/database/database.service';
import { users } from '@domains/user/user.schema';
import { userTenants } from '@domains/tenant/user-tenant.schema';
import { tenants } from '@domains/tenant/tenant.schema';
import { sql } from 'drizzle-orm';
// Import faker if needed for other tests in this file, otherwise remove
// import { faker } from '@faker-js/faker';

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

  // Removed tests related to beginTransaction and rollbackTransaction

  // Keep other tests if they exist and are relevant
});
