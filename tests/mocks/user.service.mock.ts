import type { UserService } from '@domains/user/user.service';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import { createMockUserRepository } from '@tests/mocks/user.repository.mock';

/**
 * Creates a Jest mock for the UserService.
 *
 * @returns A mocked UserService instance.
 */
export function createMockUserService(): jest.Mocked<UserService> {
  const mock = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    // Add placeholders for potentially private/constructor properties
    // using existing mocks where appropriate
    logger: createMockLogger(),
    userRepository: createMockUserRepository(),
  };
  // Cast to unknown first to bypass strict private property checks
  return mock as unknown as jest.Mocked<UserService>;
}
