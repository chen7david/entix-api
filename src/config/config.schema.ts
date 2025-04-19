import { NodeEnv } from '@src/shared/constants/app.constants';
import { LogLevel } from '@src/shared/constants/logger.constants';
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.nativeEnum(NodeEnv),
  PORT: z.coerce.number().min(1024).max(65535),
  LOG_LEVEL: z.nativeEnum(LogLevel),
  NEW_RELIC_ENABLED: z.coerce.boolean().default(false),
});

export type EnvSchema = z.infer<typeof envSchema>;
