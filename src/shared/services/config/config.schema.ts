import { z } from '@shared/utils/zod.util';
import { LogLevel } from '@shared/constants/logger.constants';
import { NodeEnv } from '@shared/constants/app.constants';

/**
 * Zod schema for environment variables.
 */
export const envSchema = z.object({
  PORT: z
    .string()
    .regex(/^[0-9]+$/)
    .transform(Number),

  NODE_ENV: z.nativeEnum(NodeEnv),

  LOG_LEVEL: z.nativeEnum(LogLevel),

  DATABASE_URL: z.string(),

  // 15 minutes default
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .regex(/^[0-9]+$/)
    .transform(Number)
    .default('900000'),

  // 100 requests default
  RATE_LIMIT_MAX: z
    .string()
    .regex(/^[0-9]+$/)
    .transform(Number)
    .default('100'),

  /** New Relic fields */
  NEW_RELIC_LICENSE_KEY: z.string().optional(),
  NEW_RELIC_APP_NAME: z.string().optional(),
  NEW_RELIC_ENABLED: z
    .preprocess((val) => {
      if (typeof val === 'string') return val === 'true';
      return Boolean(val);
    }, z.boolean())
    .optional(),
  // Add more environment variables as needed
});

export type Env = z.infer<typeof envSchema>;
