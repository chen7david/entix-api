import { Environment } from '@src/constants/app.constant';
import { loadConfig, getEnvFilename } from '@src/utils/env.util';
import { LogLevel } from '@src/constants/logger.constant';
import { z } from 'zod';
import path from 'path';

/**
 * Environment schema validation using zod
 */
const envSchema = z.object({
  // Logger config
  LOG_LEVEL: z.nativeEnum(LogLevel).default(LogLevel.INFO),
  APP_NAME: z.string().min(1),
  // Environment config
  NODE_ENV: z.nativeEnum(Environment).default(Environment.DEVELOPMENT),
  PORT: z.coerce.number().default(3000),
  // New Relic config
  NEW_RELIC_ENABLED: z.coerce.boolean().default(false),
  NEW_RELIC_LICENSE_KEY: z.string().optional(),
  NEW_RELIC_APP_NAME: z.string().optional(),
  // Database config
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  CONNECTION_TIMEOUT_MILLIS: z.coerce.number(),
  IDLE_TIMEOUT_MILLIS: z.coerce.number(),
  MAX_POOL_SIZE: z.coerce.number(),
});

export type EnvConfig = z.infer<typeof envSchema>;

const envFilename = getEnvFilename(process.env.NODE_ENV);

export const env = loadConfig({
  schema: envSchema,
  envPath: path.resolve(process.cwd(), envFilename),
});
