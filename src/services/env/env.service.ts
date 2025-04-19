import type { ZodSchema, ZodError } from 'zod';
import { envShema } from '@src/config/config.schema';
import { NodeEnv, EnvFile } from '@src/shared/constants/app.constants';
import { IoC } from '@src/shared/constants/ioc.constants';
import { config as dotenvConfig } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import {
  Container,
  Inject,
  Injectable,
} from '@src/shared/utils/typedi/typedi.util';

// Set the env schema for dependency injection
Container.set(IoC.ENV_SCHEMA, envShema);

/**
 * Injectable service for loading and validating environment variables.
 *
 * - Loads the appropriate .env file based on NODE_ENV and NodeEnv/EnvFile enums.
 * - Does not throw if the .env file is missing (for CI/CD compatibility).
 * - Validates process.env using a provided Zod schema.
 * - Throws a formatted error if validation fails, listing missing/invalid keys and their errors.
 * - Accepts a custom Zod schema or defaults to the project envShema.
 * - Designed for dependency injection and testability.
 *
 * @example
 * ```ts
 * import { EnvService } from '@src/services/env/env.service';
 *
 * @Injectable()
 * export class SomeService {
 *   constructor(private envService: EnvService) {}
 *   getPort() {
 *     return this.envService.env.PORT;
 *   }
 * }
 * ```
 */

@Injectable()
export class EnvService<T = typeof envShema._type> {
  /**
   * The parsed and validated environment variables.
   */
  public readonly env: T;

  /**
   * Creates a new EnvService instance.
   *
   * @param schema - Optional Zod schema for environment validation. Defaults to envShema.
   */
  constructor(@Inject(IoC.ENV_SCHEMA) private readonly schema: ZodSchema<T>) {
    const effectiveSchema = this.schema as ZodSchema<T>;
    const nodeEnv = process.env.NODE_ENV as NodeEnv | undefined;
    this.loadEnvFile(this.getEnvFile(nodeEnv));
    const result = effectiveSchema.safeParse(process.env);
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
   * Formats Zod validation errors into a readable, pretty string.
   * @param error The ZodError instance.
   * @returns A formatted error message.
   */
  private formatZodErrors(error: ZodError): string {
    const keys = error.errors.map(
      (e) => `- ${e.path.join('.') || '(root)'}: ${e.message}`
    );
    return envErrorTemplate(keys);
  }
}

/**
 * Template for the environment error message.
 * @param keys - The keys that are missing or invalid.
 * @returns The environment error message.
 */
function envErrorTemplate(keys: string[]): string {
  return `
╭──────────────────────────────╮
│  Environment Config Error    │
╰──────────────────────────────╯

Missing or invalid variables:
${keys.join('\n')}

Please check your environment variables and try again.
`;
}
