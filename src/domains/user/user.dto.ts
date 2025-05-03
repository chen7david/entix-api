import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from '@domains/user/user.schema';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

/**
 * Zod schema for creating a user (insert)
 * All fields except id, createdAt, updatedAt, deletedAt are required.
 */
export const CreateUserDto = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  })
  .extend({
    /** User email (must be valid email) */
    email: z.string().email(),
    /** Preferred language code (e.g., 'en-US') */
    preferredLanguage: z.string().default('en-US'),
  });

/**
 * Zod schema for updating a user (partial)
 * If email is present, it must be a valid email.
 */
export const UpdateUserDto = CreateUserDto.partial().extend({
  email: z.string().email().optional(),
});

/**
 * Zod schema for selecting a user (API response)
 * Includes all fields from the users table.
 */
export const UserDto = createSelectSchema(users);

/**
 * TypeScript types inferred from Zod schemas
 */
export type CreateUserDto = z.infer<typeof CreateUserDto>;
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;
export type UserDto = z.infer<typeof UserDto>;

/**
 * Zod schema for validating user ID path parameter (UUID)
 */
export const UserIdParamDto = z.object({
  /** User's unique identifier from path parameters. @example "b3e1..." */
  id: z.string().uuid(),
});

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
}
