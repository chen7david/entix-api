import { faker } from '@faker-js/faker';
import type { CreateUserEntity } from '@domains/user/user.schema';

/**
 * Creates a mock user object with randomized data using faker-js.
 *
 * @param overrides - Optional partial data to override the generated values.
 * @returns A `CreateUserEntity` object populated with fake data.
 */
export function createUserFactory(overrides?: Partial<CreateUserEntity>): CreateUserEntity {
  return {
    email: faker.internet.email(),
    username: faker.internet.username(),
    password: faker.internet.password(),
    cognito_sub: faker.string.uuid(), // Generate a fake Cognito sub ID
    ...overrides,
  };
}
