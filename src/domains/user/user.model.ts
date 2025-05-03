/**
 * Type representing a user entity as stored in the database.
 * Matches the Drizzle ORM users schema.
 */
export type User = {
  /** User ID (UUID, PK) */
  id: string;
  /** Username */
  username: string;
  /** User email */
  email: string;
  /** First name */
  firstName: string | null;
  /** Last name */
  lastName: string | null;
  /** Preferred language code (e.g., 'en-US') */
  preferredLanguage: string | null;
  /** Cognito sub identifier */
  cognitoSub: string;
  /** Indicates if the user is disabled (soft lockout) */
  isDisabled: boolean;
  /** Indicates if the user is a global admin */
  isAdmin: boolean;
  /** Created at timestamp */
  createdAt: Date | null;
  /** Updated at timestamp */
  updatedAt: Date | null;
  /** Soft delete timestamp */
  deletedAt: Date | null;
};

/**
 * Type representing the payload for updating a user.
 * Exclude system fields from direct update payload.
 */
export type UserUpdatePayload = Partial<
  Pick<
    User,
    | 'username'
    | 'email'
    | 'firstName'
    | 'lastName'
    | 'preferredLanguage'
    | 'isDisabled'
    | 'isAdmin'
    | 'cognitoSub'
  >
>;

/**
 * Type representing a user ID (UUID string).
 */
export type UserId = string;
