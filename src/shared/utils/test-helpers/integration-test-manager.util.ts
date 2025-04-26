import 'reflect-metadata'; // Required for TypeDI
import { Container } from 'typedi';
import { AppService } from '@shared/services/app/app.service';
import { DatabaseService } from '@shared/services/database/database.service';
import supertest from 'supertest';
import type { Express } from 'express';
import TestAgent from 'supertest/lib/agent';

/**
 * Integration test setup utility.
 */
export class IntegrationTestManager {
  public app: Express;
  public request: TestAgent;
  public db: DatabaseService;

  constructor() {
    // Ensure NODE_ENV is set to test
    process.env.NODE_ENV = 'test';

    const appService = Container.get(AppService);
    this.app = appService.getApp();
    this.request = supertest(this.app);
    this.db = Container.get(DatabaseService);
  }

  /**
   * Begins a new transaction for the current test.
   */
  public async beginTransaction(): Promise<void> {
    await this.db.beginTransaction();
  }

  /**
   * Rolls back the current test transaction.
   */
  public async rollbackTransaction(): Promise<void> {
    await this.db.rollbackTransaction();
  }

  /**
   * Closes database connections after tests.
   */
  async close(): Promise<void> {
    await this.db.cleanup();
  }

  /**
   * Resets the TypeDI container.
   */
  resetContainer(): void {
    Container.reset();
  }
}
