import { UserEntity } from '@domains/user/user.schema';

/**
 * Type alias for User, extending UserEntity
 * Represents a user as used in the application logic.
 */
export type User = UserEntity;

/**
 * Type representing the payload for updating a user.
 * Exclude deletedAt, createdAt, id, and cognito_sub from direct update payload.
 */
export type UserUpdatePayload = Partial<Pick<User, 'email' | 'username' | 'isActive' | 'password'>>;

/**
 * Type representing a user ID.
 */
export type UserId = string;
