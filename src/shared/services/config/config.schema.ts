import { z } from '@shared/utils/zod.util';
import { LogLevel } from '@shared/constants/logger.constants';
import { NodeEnv } from '@shared/constants/app.constants';

/**
 * Zod schema for environment variables.
 */
export const envSchema = z.object({
  PORT: z.string().regex(/^\d+$/).transform(Number),
  NODE_ENV: z.nativeEnum(NodeEnv),
  LOG_LEVEL: z.nativeEnum(LogLevel),
  DATABASE_URL: z.string(),
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default('900000'), // 15 minutes default
  RATE_LIMIT_MAX: z.string().regex(/^\d+$/).transform(Number).default('100'), // 100 requests default
  // Add more environment variables as needed
});

export type Env = z.infer<typeof envSchema>;
