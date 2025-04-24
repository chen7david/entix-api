/**
 * Type representing a user entity as stored in the database.
 */
export type User = {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date;
  isActive: boolean;
  deletedAt: Date | null;
};

/**
 * Type representing the payload for updating a user.
 * Exclude deletedAt from direct update payload.
 */
export type UserUpdatePayload = Partial<Pick<User, 'email' | 'name' | 'isActive'>>;

/**
 * Type representing a user ID.
 */
export type UserId = number;
