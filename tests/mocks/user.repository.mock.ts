import type { UserRepository } from '@domains/user/user.repository';
import type { UserEntity, CreateUserEntity } from '@domains/user/user.schema';
import type { UserId, UserUpdatePayload } from '@domains/user/user.model';

/**
 * Creates a Jest mock for the UserRepository.
 *
 * @returns A mocked UserRepository instance.
 */
export function createMockUserRepository(): jest.Mocked<UserRepository> {
  const mock = {
    // Assuming BaseRepository methods and their typical signatures
    findAll: jest.fn<Promise<UserEntity[]>, []>(),
    findById: jest.fn<Promise<UserEntity | null>, [UserId]>(),
    // Create method in BaseRepository likely takes a type compatible with CreateUserEntity
    // (e.g. Drizzle's insert type, which CreateUserEntity is based on)
    create: jest.fn<Promise<UserEntity>, [CreateUserEntity]>(),
    // Update method in BaseRepository likely takes Partial<UserEntity> or a specific payload type like UserUpdatePayload
    update: jest.fn<Promise<UserEntity>, [UserId, UserUpdatePayload | Partial<UserEntity>]>(),
    // Delete often returns boolean for success or number of affected rows
    delete: jest.fn<Promise<boolean>, [UserId]>(),
  };
  // Cast to unknown first to bypass strict private property checks
  // BaseRepository adds properties like db, logger, schema, etc.
  // which we don't necessarily need to mock deeply for service tests.
  return mock as unknown as jest.Mocked<UserRepository>;
}
