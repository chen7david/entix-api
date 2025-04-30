import type { UserService } from '@domains/user/user.service';

/**
 * Returns a fully-mocked UserService for use in tests.
 * All methods are jest.fn() mocks and the object is typed as jest.Mocked<UserService>.
 */
export function createMockUserService(): jest.Mocked<UserService> {
  const mock = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    // Required properties for UserService class
    logger: undefined,
    loggerService: undefined,
    userRepository: undefined,
  };
  return mock as unknown as jest.Mocked<UserService>;
}
