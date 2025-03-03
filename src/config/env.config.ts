import { z } from "zod";
import { Environment } from "@src/types/app.types";
import { loadConfig } from "../utils/config.util";

/**
 * Environment schema validation using zod
 */
const envSchema = z.object({
  NODE_ENV: z.nativeEnum(Environment).default(Environment.Development),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
});

type EnvConfig = z.infer<typeof envSchema>;

export const env = loadConfig({ schema: envSchema });
