import { z } from 'zod';
import { Environment } from '@src/types/app.types';
import { loadConfig } from '../utils/config.util';

/**
 * Environment schema validation using zod
 */
const envSchema = z.object({
  NODE_ENV: z.nativeEnum(Environment).default(Environment.Development),
  PORT: z.coerce.number().default(3000),
  // Database config
  POSTGRES_HOST: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
});

type EnvConfig = z.infer<typeof envSchema>;

export const env = loadConfig({ schema: envSchema });
