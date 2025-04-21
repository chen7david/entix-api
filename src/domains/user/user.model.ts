/**
 * Type representing a user entity as stored in the database.
 */
export type User = {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  isActive: boolean;
};

/**
 * Type representing the payload for updating a user.
 */
export type UserUpdatePayload = Partial<Pick<User, 'email' | 'name' | 'isActive'>>;

/**
 * Type representing a user ID.
 */
export type UserId = number;
