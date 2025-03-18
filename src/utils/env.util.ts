import { z } from 'zod';
import * as dotenv from 'dotenv';
import { EnvFile, Environment } from '@src/types/app.types';

const envErrorTemplate = (keys: string[]) => `
╭──────────────────────────────╮
│  Environment Config Error    │
╰──────────────────────────────╯

Missing or invalid variables:
${keys.join('\n')}

Please check your environment variables and try again.
`;

type LoadConfigOptions<T extends z.ZodType> = {
  schema: T;
  envPath: string;
};

export const getEnvFilename = (nodeEnv: string | undefined) => {
  switch (nodeEnv) {
    case Environment.Development:
      return EnvFile.DevelopmentEnv;
      break;

    case Environment.Test:
      return EnvFile.TestEnv;
      break;

    default:
      return EnvFile.DevelopmentEnv;
      break;
  }
};

/**
 * @param options Configuration options
 * @param options.schema - Zod schema defining required variables and their types
 * @param options.envPath - Path to env file
 * @returns Type-safe environment configuration object
 * @throws {Error} If required variables are missing or fail type validation
 */

export const loadConfig = <T extends z.ZodType>({
  schema,
  envPath,
}: LoadConfigOptions<T>): z.infer<T> => {
  dotenv.config({ path: envPath });

  try {
    return schema.parse(process.env) as z.infer<T>;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `  • ${err.path.join('.')}`);
      throw new Error(envErrorTemplate(missingVars));
    }
    throw error;
  }
};
