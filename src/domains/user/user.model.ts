/**
 * Type representing a user entity as stored in the database.
 */
export type User = {
  id: string;
  username: string;
  email: string;
  cognitoSub: string;
  isDisabled: boolean;
  isAdmin: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
};

/**
 * Type representing the payload for updating a user.
 * Exclude system fields from direct update payload.
 */
export type UserUpdatePayload = Partial<Pick<User, 'username' | 'email' | 'isDisabled'>>;

/**
 * Type representing a user ID (UUID string).
 */
export type UserId = string;
