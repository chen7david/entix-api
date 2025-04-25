import 'reflect-metadata'; // Required for TypeDI
import { Container } from 'typedi';
import { AppService } from '@shared/services/app/app.service';
import { DatabaseService } from '@shared/services/database/database.service';
import supertest from 'supertest';
import type { Express } from 'express';

/**
 * Integration test setup utility.
 */
export class IntegrationTestManager {
  public app: Express;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public request: any; // Use any to bypass supertest type issue for now
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
