import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';
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
  envPath?: string;
};

/**
 * Loads environment variables from a .env file into process.env and validates them against a schema.
 *
 * The function follows these steps:
 * 1. Loads variables from .env file or .env.test into process.env
 * 2. Validates all required variables are present in process.env
 * 3. Ensures variables match their expected types (string, number, enum, etc.)
 * 4. Returns a typed config object if validation passes
 *
 * @param options Configuration options
 * @param options.schema - Zod schema defining required variables and their types
 * @param options.envPath - Optional path to env file (defaults to .env or .env.test)
 * @returns Type-safe environment configuration object
 * @throws {Error} If required variables are missing or fail type validation
 */
export const loadConfig = <T extends z.ZodType>({
  schema,
  envPath,
}: LoadConfigOptions<T>): z.infer<T> => {
  const nodeEnv = process.env.NODE_ENV || Environment.Development;
  const fileName = nodeEnv === Environment.Test ? EnvFile.TestEnv : EnvFile.DevelopmentEnv;

  // Step 1: Load environment variables from file into process.env
  dotenv.config({
    path: envPath ?? path.resolve(process.cwd(), fileName),
  });

  try {
    // Step 2 & 3: Validate presence and types of required variables
    return schema.parse(process.env) as z.infer<T>;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `  • ${err.path.join('.')}`);

      throw new Error(envErrorTemplate(missingVars));
    }
    throw error;
  }
};
