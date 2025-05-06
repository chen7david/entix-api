import type { UserRepository } from '@domains/user/user.repository';

/**
 * Creates a Jest mock for the UserRepository.
 *
 * @returns A mocked UserRepository instance.
 */
export function createMockUserRepository(): jest.Mocked<UserRepository> {
  const mock = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    // Add other methods/properties if they exist on UserRepository
  };
  // Cast to unknown first to bypass strict private property checks
  // BaseRepository adds properties like db, logger, schema, etc.
  // which we don't necessarily need to mock deeply for service tests.
  return mock as unknown as jest.Mocked<UserRepository>;
}
