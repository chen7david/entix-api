import { LogLevel } from '@src/services/logger/logger.constants';
import { NodeEnv } from '@src/shared/constants/app.constants';
import { z } from 'zod';

export const appConfigSchema = z.object({
  NODE_ENV: z.nativeEnum(NodeEnv),
  PORT: z.coerce.number().min(1024).max(65535),
  APP_NAME: z.string().min(1),
  LOG_LEVEL: z.nativeEnum(LogLevel),
  NEW_RELIC_ENABLED: z.union([
    z.string().transform((v) => v === 'true'),
    z.boolean(),
  ]),
});
