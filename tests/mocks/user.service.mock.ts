import type { UserService } from '@domains/user/user.service';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import { createMockUserRepository } from '@tests/mocks/user.repository.mock';
// import type { CognitoService } from '@shared/services/cognito/cognito.service'; // Removed
import type { RoleService } from '@domains/role/role.service';
import { createMockCognitoService } from '@tests/mocks/cognito.service.mock'; // Assuming this exists or create it

// A simplified mock for RoleService, adjust if more methods are needed by UserService for tests
const createMockRoleService = (): jest.Mocked<RoleService> =>
  ({
    findById: jest.fn(),
    // Add other methods if needed
  }) as unknown as jest.Mocked<RoleService>;

/**
 * Creates a Jest mock for the UserService.
 *
 * @returns A mocked UserService instance.
 */
export function createMockUserService(): jest.Mocked<UserService> {
  const mockCognito = createMockCognitoService();
  const mockRole = createMockRoleService();

  const mock = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getRolesForUser: jest.fn(), // Added
    assignRoleToUser: jest.fn(), // Added
    removeRoleFromUser: jest.fn(), // Added
    // Add placeholders for potentially private/constructor properties
    // using existing mocks where appropriate
    loggerService: createMockLogger(), // Assuming UserService uses loggerService directly
    userRepository: createMockUserRepository(),
    cognitoService: mockCognito, // Added
    roleService: mockRole, // Added
    // If UserService has a direct `logger` property initialized from loggerService.component:
    logger: createMockLogger().component('UserService'),
  };
  // Cast to unknown first to bypass strict private property checks
  return mock as unknown as jest.Mocked<UserService>;
}
