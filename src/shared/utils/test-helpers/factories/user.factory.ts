import { faker } from '@faker-js/faker';
import { User } from '@domains/user/user.model';
import { CreateUserDto, UpdateUserDto } from '@domains/user/user.dto';

/**
 * User factory for generating test data.
 * Provides standardized methods to create User objects and DTOs.
 */
export class UserFactory {
  /**
   * Create a mock user with randomized data.
   * @param overrides - Optional properties to override in the created user
   * @returns A complete User object
   */
  static createMockUser(overrides?: Partial<User>): User {
    const defaultUser: User = {
      id: faker.string.uuid(),
      username: faker.internet.username(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      preferredLanguage: 'en-US',
      cognitoSub: `cognito-${faker.string.alphanumeric(10)}`,
      tenantId: null,
      isDisabled: false,
      isAdmin: false,
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
      deletedAt: null,
    };

    return { ...defaultUser, ...overrides };
  }

  /**
   * Create a user creation DTO with randomized data.
   * @param overrides - Optional properties to override in the DTO
   * @returns A complete CreateUserDto object
   */
  static createUserDto(overrides?: Partial<CreateUserDto>): CreateUserDto {
    const defaultDto: CreateUserDto = {
      username: faker.internet.username(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      preferredLanguage: 'en-US',
      cognitoSub: `cognito-${faker.string.uuid()}`,
      tenantId: null,
      isDisabled: false,
      isAdmin: false,
    };

    return { ...defaultDto, ...overrides };
  }

  /**
   * Create a user update DTO with partial properties.
   * @param overrides - Properties to include in the update DTO
   * @returns A partial UpdateUserDto object
   */
  static updateUserDto(overrides: Partial<UpdateUserDto> = {}): UpdateUserDto {
    return overrides;
  }

  /**
   * Create multiple mock users with randomized data.
   * @param count - Number of users to create
   * @param overrides - Optional properties to override in all created users
   * @returns An array of User objects
   */
  static createMockUsers(count: number, overrides?: Partial<User>): User[] {
    return Array.from({ length: count }, () => this.createMockUser(overrides));
  }
}
