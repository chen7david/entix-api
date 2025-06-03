import { LOG_LEVEL, NODE_ENV } from '@core/constants/app.constant';
import z from 'zod';

export const envConfigSchema = z.object({
  NODE_ENV: z.enum(NODE_ENV),
  APP_NAME: z.string(),
  APP_PORT: z.coerce.number(),
  LOG_LEVEL: z.enum(LOG_LEVEL),
  NEW_RELIC_LICENSE_KEY: z.string().optional(),
  NEW_RELIC_APP_NAME: z.string().optional(),
  NEW_RELIC_LOG_LEVEL: z.enum(LOG_LEVEL).optional(),
  NEW_RELIC_ENABLED: z.boolean().optional(),
  AWS_REGION: z.string(),
  AWS_USER_POOL_ID: z.string(),
  COGNITO_CLIENT_ID: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
});

export type EnvConfig = z.infer<typeof envConfigSchema>;
