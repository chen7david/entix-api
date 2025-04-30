import type { UserRepository } from '@domains/user/user.repository';

/**
 * Returns a fully-mocked UserRepository for use in tests.
 * All methods are jest.fn() mocks and the object is typed as jest.Mocked<UserRepository>.
 */
export function createMockUserRepository(): jest.Mocked<UserRepository> {
  const mock = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    // Required properties for UserRepository class
    dbService: undefined,
    loggerService: undefined,
  };
  return mock as unknown as jest.Mocked<UserRepository>;
}
