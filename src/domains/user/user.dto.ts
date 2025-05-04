import { z } from '@shared/utils/zod.util';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { UserEntitySchema } from '@domains/user/user.schema';

/**
 * Zod schema for creating a user. Used for request body validation.
 */
export const CreateUserDto = z
  .object({
    /**
     * User's email address.
     * @example john.doe@example.com
     */
    email: z.string().email().openapi({ example: 'john.doe@example.com' }),
    /**
     * User's username (must be unique).
     * @example johndoe
     */
    username: z.string().min(3).openapi({ example: 'johndoe' }),
    /**
     * User's password (optional depending on auth strategy).
     * @example StrongPassword123!
     */
    password: z.string().min(8).optional().openapi({ example: 'StrongPassword123!' }),
    /**
     * Cognito sub identifier (optional).
     * @example abc123def456
     */
    cognito_sub: z.string().optional().openapi({ example: 'abc123def456' }),
    /**
     * Indicates if the user account is active. Defaults to true.
     * @default true
     */
    isActive: z.boolean().default(true),
  })
  .openapi('CreateUserDto', { description: 'Data required to create a new user.' });

/**
 * Type alias for CreateUserDto schema inference
 */
export type CreateUserDto = z.infer<typeof CreateUserDto>;

/**
 * Zod schema for updating a user. Allows partial updates.
 */
export const UpdateUserDto = CreateUserDto.partial().openapi('UpdateUserDto', {
  description: 'Data for updating an existing user. All fields are optional.',
});

/**
 * Type alias for UpdateUserDto schema inference
 */
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

/**
 * Zod schema for filtering user objects in requests.
 */
export const UserFilterDto = z
  .object({
    isActive: z.boolean().optional(),
    username: z.string().optional(),
    email: z.string().optional(),
  })
  .openapi('UserFilterDto', { description: 'Filter parameters for user queries.' });

/**
 * Type alias for UserFilterDto schema inference
 */
export type UserFilterDto = z.infer<typeof UserFilterDto>;

/**
 * Zod schema representing a user object as returned by the API.
 * Based on the UserEntitySchema but potentially transformed.
 */
export const UserDto = UserEntitySchema.omit({ deletedAt: true, password: true }).openapi(
  'UserDto',
  {
    description: 'Represents a user returned from the API.',
  },
);

/**
 * Type alias for UserDto inferred type.
 */
export type UserDto = z.infer<typeof UserDto>;

/**
 * Zod schema for user ID parameter in URL paths.
 */
export const UserIdParamDto = z
  .object({
    /**
     * User ID to identify the specific user.
     * @example 123e4567-e89b-12d3-a456-426614174000
     */
    id: z.string().uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
  })
  .openapi('UserIdParamDto', { description: 'URL parameter for user ID.' });

/**
 * Type alias for UserIdParamDto schema inference
 */
export type UserIdParamDto = z.infer<typeof UserIdParamDto>;

/**
 * Registers user-related Zod schemas with the OpenAPI registry.
 * @param registry - The OpenAPIRegistry instance to register schemas on.
 */
export function registerUserSchemas(registry: OpenAPIRegistry): void {
  registry.register('CreateUserDto', CreateUserDto);
  registry.register('UpdateUserDto', UpdateUserDto);
  registry.register('UserDto', UserDto);
  registry.register('UserIdParamDto', UserIdParamDto);
  registry.register('UserFilterDto', UserFilterDto);
}
