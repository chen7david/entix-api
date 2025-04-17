import { config as dotenvConfig } from 'dotenv';
import { ZodSchema, ZodError } from 'zod';
import { NodeEnv, EnvFile } from '@src/app/app.constants';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Loads and validates environment variables using dotenv and Zod.
 *
 * - Loads the appropriate .env file based on NODE_ENV and NodeEnv/EnvFile enums.
 * - Does not throw if the .env file is missing (for CI/CD compatibility).
 * - Validates process.env using a provided Zod schema.
 * - Throws a formatted error if validation fails, listing missing/invalid keys and their errors.
 */
export class EnvLoader<T> {
  /**
   * The parsed and validated environment variables.
   */
  public readonly env: T;

  /**
   * Loads the .env file and validates process.env using the provided schema.
   * @param schema Zod schema to validate environment variables.
   */
  constructor(schema: ZodSchema<T>) {
    const nodeEnv = process.env.NODE_ENV as NodeEnv | undefined;
    const envFile = this.getEnvFile(nodeEnv);
    this.loadEnvFile(envFile);
    const result = schema.safeParse(process.env);
    if (!result.success) {
      throw new Error(this.formatZodErrors(result.error));
    }
    this.env = result.data;
  }

  /**
   * Determines the .env file to load based on NODE_ENV.
   * @param nodeEnv The current NODE_ENV value.
   * @returns The .env file name.
   */
  private getEnvFile(nodeEnv?: NodeEnv): string {
    switch (nodeEnv) {
      case NodeEnv.DEV:
        return EnvFile.DEV;
      case NodeEnv.TEST:
        return EnvFile.TEST;
      case NodeEnv.PROD:
      default:
        return '.env';
    }
  }

  /**
   * Loads the .env file if it exists. Does not throw if missing.
   * @param envFile The .env file name.
   */
  private loadEnvFile(envFile: string): void {
    const envPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      dotenvConfig({ path: envPath });
    }
  }

  /**
   * Formats Zod validation errors into a readable string.
   * @param error The ZodError instance.
   * @returns A formatted error message.
   */
  private formatZodErrors(error: ZodError): string {
    return (
      'Environment variable validation failed:\n' +
      error.errors
        .map((e) => `- ${e.path.join('.') || '(root)'}: ${e.message}`)
        .join('\n')
    );
  }
}
