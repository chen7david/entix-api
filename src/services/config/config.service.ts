import { IoC } from '@src/shared/constants/ioc.constants';
import { ZodError, ZodSchema } from 'zod';
import { config as dotenvConfig } from 'dotenv';
import { envSchema, EnvSchema } from '@src/config/config.schema';
import { EnvFile, NodeEnv } from '@src/shared/constants/app.constants';
import path from 'path';
import fs from 'fs';
import {
  Container,
  Inject,
  Injectable,
} from '@src/shared/utils/typedi/typedi.util';

Container.set(IoC.ENV_SCHEMA, envSchema);

@Injectable()
export class ConfigService {
  public readonly env: EnvSchema;

  constructor(@Inject(IoC.ENV_SCHEMA) schema: ZodSchema) {
    // load env file into process.env
    const nodeEnv = process.env.NODE_ENV as NodeEnv | undefined;
    const envFile = this.getEnvFile(nodeEnv);
    this.loadEnvFile(envFile);

    // validate process.env
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
