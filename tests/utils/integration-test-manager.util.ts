import 'reflect-metadata'; // Required for TypeDI
import { AppService } from '@shared/services/app/app.service';
import { DatabaseService } from '@shared/services/database/database.service';
import supertest from 'supertest';
import type { Express } from 'express';
import TestAgent from 'supertest/lib/agent';
import { Injectable } from '@shared/utils/ioc.util';

/**
 * Integration test setup utility.
 */
@Injectable()
export class IntegrationTestManager {
  public app: Express;
  public request: TestAgent;

  /**
   * @param appService - The AppService instance to use for the Express app
   * @param dbService - The DatabaseService instance for DB operations (injected as private property)
   */
  constructor(
    appService: AppService,
    private dbService: DatabaseService,
  ) {
    // Ensure NODE_ENV is set to test
    process.env.NODE_ENV = 'test';

    this.app = appService.getApp();
    this.request = supertest(this.app);
  }

  /**
   * Closes database connections after tests.
   */
  async close(): Promise<void> {
    await this.dbService.cleanup();
  }
}
