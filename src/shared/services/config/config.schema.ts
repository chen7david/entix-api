import { z } from '@shared/utils/zod.util';
import { LogLevel } from '@shared/constants/logger.constants';
import { NodeEnv } from '@shared/constants/app.constants';

/**
 * Zod schema for environment variables.
 */
export const envSchema = z.object({
  PORT: z.coerce.number(),
  NODE_ENV: z.nativeEnum(NodeEnv),

  LOG_LEVEL: z.nativeEnum(LogLevel),
  NEW_RELIC_APP_NAME: z.string().optional(),
  NEW_RELIC_LICENSE_KEY: z.string().optional(),
  NEW_RELIC_ENABLED: z.coerce.boolean().default(false),

  DATABASE_URL: z.string(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes default
  RATE_LIMIT_MAX: z.coerce.number().default(100), // 100 requests default
  COGNITO_REGION: z.string(),
  COGNITO_USER_POOL_ID: z.string(),
  COGNITO_CLIENT_ID: z.string(),
  // Add more environment variables as needed
});

export type Env = z.infer<typeof envSchema>;
