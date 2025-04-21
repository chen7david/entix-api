import { z } from 'zod';

/**
 * @description DTO for a user entity.
 */
export const CreateUserDto = z.object({
  /** User's email address */
  email: z.string().email(),
  /** User's display name */
  name: z.string().min(1),
  /** Whether the user is active */
  isActive: z.boolean().default(true),
});

/**
 * TypeScript type for a user, inferred from the Zod schema.
 */
export type CreateUserDto = z.infer<typeof CreateUserDto>;
