import { z } from 'zod';
import { LogLevel } from '@shared/constants/logger.constants';
import { NodeEnv } from '@src/shared/constants/app.constants';

/**
 * Zod schema for environment variables.
 */
export const envSchema = z.object({
  PORT: z.string().regex(/^\d+$/).transform(Number),
  NODE_ENV: z.nativeEnum(NodeEnv),
  LOG_LEVEL: z.nativeEnum(LogLevel),
  // Add more environment variables as needed
});

export type Env = z.infer<typeof envSchema>;
