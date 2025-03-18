import { z } from 'zod';
import * as dotenv from 'dotenv';
import { EnvFilename, Environment } from '@src/types/app.types';

/**
 * Template for environment configuration error messages
 * @param keys - Array of missing or invalid environment variables
 * @returns Formatted error message
 */
const envErrorTemplate = (keys: string[]): string => `
╭──────────────────────────────╮
│  Environment Config Error    │
╰──────────────────────────────╯

Missing or invalid variables:
${keys.join('\n')}

Please check your environment variables and try again.
`;

/**
 * Configuration options for loading environment variables
 */
type LoadConfigOptions<T extends z.ZodType> = {
  /** Zod schema for validating environment variables */
  schema: T;
  /** Path to the environment file */
  envPath: string;
};

/**
 * Determines the appropriate .env filename based on the current Node environment
 * @param nodeEnv - Current Node environment (development, test, production)
 * @returns The appropriate .env filename for the environment
 */
export const getEnvFilename = (nodeEnv: string | undefined): string => {
  switch (nodeEnv) {
    case Environment.DEVELOPMENT:
      return EnvFilename.DEVELOPMENT;
    case Environment.TEST:
      return EnvFilename.TEST;
    default:
      return EnvFilename.DEVELOPMENT;
  }
};

/**
 * Loads and validates environment variables using a Zod schema
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
