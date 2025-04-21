import { z } from 'zod';

/**
 * Zod schema for environment variables.
 */
export const envSchema = z.object({
  PORT: z.string().regex(/^\d+$/).transform(Number),
  // Add more environment variables as needed
});

export type Env = z.infer<typeof envSchema>;
