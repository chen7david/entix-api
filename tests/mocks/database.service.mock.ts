import type { DatabaseService } from '@shared/services/database/database.service';

/**
 * Creates a simple mock DatabaseService.
 * Provides mock implementations for common methods like `cleanup`.
 */
export function createMockDatabaseService(): jest.Mocked<DatabaseService> {
  const mockDbMethods = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    // Add other Drizzle methods if needed by specific tests
  };
  return {
    db: mockDbMethods as unknown as DatabaseService['db'], // Cast the db object
    cleanup: jest.fn().mockResolvedValue(undefined),
    // Mock other DatabaseService methods/properties if they exist
  } as unknown as jest.Mocked<DatabaseService>;
}
