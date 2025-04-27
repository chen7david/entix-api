import 'reflect-metadata';
import { DatabaseService } from '@shared/services/database/database.service';
import { ConfigService } from '@shared/services/config/config.service';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { Container } from 'typedi';

jest.mock('pg', () => {
  const mPool = {
    end: jest.fn().mockResolvedValue(undefined),
  };
  return { Pool: jest.fn(() => mPool) };
});

jest.mock('drizzle-orm/node-postgres', () => ({
  drizzle: jest.fn(() => ({})),
}));

/**
 * Unit tests for DatabaseService
 */
describe('DatabaseService', () => {
  let configService: ConfigService;
  let dbService: DatabaseService;

  beforeEach(() => {
    // Reset the container before each test
    Container.reset();

    configService = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'DATABASE_URL') return 'postgres://test';
        throw new Error('Unknown key');
      }),
    } as unknown as ConfigService;

    // Register mock with the container
    Container.set(ConfigService, configService);

    // Get the service from the container
    dbService = Container.get(DatabaseService);
  });

  it('should initialize with a drizzle instance and pool', () => {
    expect(Pool).toHaveBeenCalledWith({ connectionString: 'postgres://test' });
    expect(drizzle).toHaveBeenCalled();
    expect(dbService.db).toBeDefined();
  });

  it('should call pool.end on cleanup', async () => {
    const pool = (dbService as unknown as { pool: Pool }).pool;
    await dbService.cleanup();
    expect(pool.end).toHaveBeenCalled();
  });
});
