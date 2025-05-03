import { Container } from 'typedi';
import { DatabaseService } from '@shared/services/database/database.service';

/**
 * Creates a chainable mock of database operations.
 * Each method returns the mock itself for method chaining.
 *
 * @returns An object with mock database operations
 */
export function createMockDbOperations(): Record<string, jest.Mock> {
  return {
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    $dynamic: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    having: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    rightJoin: jest.fn().mockReturnThis(),
    fullJoin: jest.fn().mockReturnThis(),
  };
}

/**
 * Sets up a mock database service in the TypeDI container.
 *
 * @param mockDbOperations - Optional pre-configured mock DB operations
 * @returns The mock DB operations for use in tests
 */
export function setupMockDb(
  mockDbOperations?: Record<string, jest.Mock>,
): Record<string, jest.Mock> {
  // Create mock DB operations that can be chained if not provided
  const mockDb = mockDbOperations || createMockDbOperations();

  // Create mock DB service with the mockDb
  const mockDbService = {
    db: mockDb,
    transaction: jest.fn().mockImplementation(async (callback) => {
      // Simulate a transaction by passing the same db to the callback
      return callback(mockDb);
    }),
    close: jest.fn().mockResolvedValue(undefined),
  } as unknown as DatabaseService;

  // Register mock with TypeDI container
  Container.set(DatabaseService, mockDbService);

  return mockDb;
}
