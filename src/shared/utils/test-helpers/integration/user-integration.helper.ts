import { IntegrationTestManager } from '@shared/utils/test-helpers/integration-test-manager.util';
import type { CreateUserDto } from '@domains/user/user.dto';
import { UserFactory } from '@shared/utils/test-helpers/factories/user.factory';

/**
 * Interface for createTestUsers options
 */
interface CreateTestUsersOptions {
  count: number;
  overrides?: Partial<CreateUserDto>;
}

/**
 * Helper functions for user-related integration tests
 */
export class UserIntegrationHelper {
  /**
   * Helper function to create a user via API and return the response and created ID
   *
   * @param manager - Integration test manager instance
   * @param overrides - Optional properties to override in the user DTO
   * @returns Response and the ID of the created user along with the payload
   */
  static async createTestUser(manager: IntegrationTestManager, overrides?: Partial<CreateUserDto>) {
    const payload = UserFactory.createUserDto(overrides);
    const response = await manager.request.post('/api/v1/users').send(payload);
    const id = response.body.id;

    return { response, id, payload };
  }

  /**
   * Creates multiple test users via the API
   *
   * @param manager - Integration test manager instance
   * @param options - Options including count and property overrides
   * @returns Array of created user objects with id, payload, and response
   */
  static async createTestUsers(manager: IntegrationTestManager, options: CreateTestUsersOptions) {
    const users = [];
    const { count, overrides } = options;

    for (let i = 0; i < count; i++) {
      const user = await this.createTestUser(manager, overrides);
      users.push(user);
    }

    return users;
  }
}
