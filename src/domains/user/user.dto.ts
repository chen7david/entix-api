import { z } from '@shared/utils/zod.util';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

/**
 * Zod schema for creating a user. Used for request body validation.
 */
export const CreateUserDto = z
  .object({
    /**
     * User's email address (must be unique).
     * @example john.doe@example.com
     */
    email: z.string().email().openapi({ example: 'john.doe@example.com' }),
    /**
     * User's name.
     * @example John Doe
     */
    name: z.string().min(1).openapi({ example: 'John Doe' }),
    /**
     * Indicates if the user account is active. Defaults to true.
     * @default true
     */
    isActive: z.boolean().default(true),
    // TODO: Add password field if needed for creation?
  })
  .openapi('CreateUserDto', { description: 'Data required to create a new user.' });

/**
 * Zod schema for updating a user. Allows partial updates.
 */
export const UpdateUserDto = CreateUserDto.partial().openapi('UpdateUserDto', {
  description: 'Data for updating an existing user. All fields are optional.',
});

/**
 * Type alias for CreateUserDto inferred type.
 */
export type CreateUserDto = z.infer<typeof CreateUserDto>;
/**
 * Type alias for UpdateUserDto inferred type.
 */
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

// --- Potential Response Schema ---
// Based on the Drizzle schema `src/domains/user/user.schema.ts`

/**
 * Zod schema representing a user object as returned by the API.
 */
export const UserDto = z
  .object({
    /**
     * Unique identifier for the user.
     * @example 1
     */
    id: z.number().int().positive().openapi({ example: 1 }),
    /**
     * User's email address.
     * @example john.doe@example.com
     */
    email: z.string().email().openapi({ example: 'john.doe@example.com' }),
    /**
     * User's name.
     * @example John Doe
     */
    name: z.string().nullable().openapi({ example: 'John Doe' }), // Assuming name can be null based on Drizzle schema
    /**
     * Timestamp when the user was created.
     * @example 2024-08-15T10:30:00Z
     */
    createdAt: z.date().openapi({ example: '2024-08-15T10:30:00Z' }), // Or z.string().datetime() if preferred
    // Assuming isActive is not part of the core DB schema but might be added
  })
  .openapi('UserDto', { description: 'Represents a user.' });

/**
 * Type alias for UserDto inferred type.
 */
export type UserDto = z.infer<typeof UserDto>;

/**
 * Registers user-related Zod schemas with the OpenAPI registry.
 * @param registry - The OpenAPIRegistry instance to register schemas on.
 */
export function registerUserSchemas(registry: OpenAPIRegistry): void {
  registry.register('CreateUserDto', CreateUserDto);
  registry.register('UpdateUserDto', UpdateUserDto);
  registry.register('UserDto', UserDto);
}
