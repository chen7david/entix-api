import { faker } from '@faker-js/faker';
import type { CreateUserDto, UserDto } from '@domains/user/user.dto';
import type { IntegrationTestManager } from '@tests/utils/integration-test-manager.util';

/**
 * Factory for creating user-related data and entities for tests.
 */
export class UserFactory {
  constructor(private manager: IntegrationTestManager) {}

  /**
   * Builds a plain CreateUserDto object with fake data.
   *
   * @param overrides - Optional partial data to override defaults.
   * @returns A CreateUserDto object.
   */
  build(overrides: Partial<CreateUserDto> = {}): CreateUserDto {
    return {
      email: faker.internet.email(),
      username: faker.internet.username(),
      isActive: faker.datatype.boolean(),
      ...overrides,
    };
  }

  /**
   * Creates a user via the API and returns the created user DTO.
   *
   * @param overrides - Optional partial data to override defaults for the creation payload.
   * @returns A Promise resolving to the created UserDto.
   * @throws If the API request fails.
   */
  async create(overrides: Partial<CreateUserDto> = {}): Promise<UserDto> {
    const payload = this.build(overrides);
    const response = await this.manager.request.post('/api/v1/users').send(payload);

    if (response.status !== 201) {
      // Log error details for debugging during tests
      console.error('UserFactory create failed:', response.status, response.body);
      throw new Error(`Failed to create user via API. Status: ${response.status}`);
    }
    return response.body as UserDto;
  }
}
