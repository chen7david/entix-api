import 'reflect-metadata';
import { Container } from 'typedi';
import { DatabaseService } from '@shared/services/database/database.service';
import { ConfigService } from '@shared/services/config/config.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { AppService } from '@shared/services/app/app.service';
import supertest from 'supertest';

describe('GET /api/openapi.json - Integration', () => {
  let request: any; // Use any type to avoid TypeScript errors
  let dbService: DatabaseService;

  beforeAll(() => {
    // Ensure dependencies are available in the container
    if (!Container.has(ConfigService)) {
      Container.set(ConfigService, new ConfigService());
    }

    if (!Container.has(LoggerService)) {
      const loggerService = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
        component: jest.fn().mockReturnThis(),
        child: jest.fn().mockReturnThis(),
      };
      Container.set(LoggerService, loggerService);
    }

    // Get database service
    dbService = Container.get(DatabaseService);

    // Create AppService manually
    const appService = Container.get(AppService);

    // Create supertest instance
    request = supertest(appService.getApp());
  });

  beforeEach(async () => {
    await dbService.beginTransaction();
  });

  afterEach(async () => {
    await dbService.rollbackTransaction();
  });

  afterAll(async () => {
    await dbService.cleanup();
  });

  it('should return 200 OK with a valid OpenAPI spec structure', async () => {
    const response = await request.get('/openapi.json');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('openapi');
    expect(response.body).toHaveProperty('info');
    expect(response.body).toHaveProperty('paths');
    expect(response.body).toHaveProperty('components');
    expect(response.body.info).toHaveProperty('title', 'Entix API');
  });
});
