import { NodeEnv } from '@src/shared/constants/app.constants';
import { z } from 'zod';

export const appConfigSchema = z.object({
  NODE_ENV: z.nativeEnum(NodeEnv),
  PORT: z.coerce.number().min(1024).max(65535),
});

export const envSchema = appConfigSchema;
export type EnvSchema = z.infer<typeof envSchema>;
