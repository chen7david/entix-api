import { z } from 'zod';

export const envShema = z.object({
  NODE_ENV: z.enum(['dev', 'prod', 'test']),
  PORT: z.coerce.number().min(1024).max(65535),
});
