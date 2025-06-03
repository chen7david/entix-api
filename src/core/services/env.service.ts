import { EnvFileName } from '@core/constants/app.constant';
import { NodeEnv } from '@core/types/app.types';
import { Injectable } from '@core/utils/di.util';
import * as dotenv from 'dotenv';
import path from 'path';

@Injectable()
export class EnvService {
  private env: Record<string, unknown>;

  /**
   * Creates a new EnvService instance.
   * @param injectedEnv Optional custom environment map (used for testing or overrides).
   *                    If provided, .env file loading is skipped.
   */
  constructor(private readonly injectedEnv?: Record<string, string>) {
    if (injectedEnv) {
      this.env = injectedEnv;
    } else {
      const envPath = this.getEnvPath(process.env.NODE_ENV as NodeEnv);
      this.env = this.loadEnv(envPath);
    }
  }

  /**
   * Gets the path to the environment file based on the current NODE_ENV.
   * @param nodeEnv The current environment.
   * @returns The absolute path to the .env file.
   */
  private getEnvPath(nodeEnv: NodeEnv | undefined): string {
    if (!nodeEnv) {
      throw new Error('NODE_ENV is not set');
    }

    let envFileName: string;
    switch (nodeEnv) {
      case 'development':
        envFileName = EnvFileName.DEVELOPMENT;
        break;
      case 'test':
        envFileName = EnvFileName.TEST;
        break;
      case 'production':
        envFileName = EnvFileName.PRODUCTION;
        break;
      default:
        throw new Error(`Unsupported NODE_ENV value: ${nodeEnv}`);
    }

    return path.resolve(process.cwd(), envFileName);
  }

  /**
   * Loads environment variables from the specified .env file path.
   * @param envPath Path to the .env file.
   * @returns The updated process.env as a record.
   */
  private loadEnv(envPath: string): Record<string, unknown> {
    dotenv.config({ path: envPath });
    return process.env;
  }

  /**
   * Checks if the specified key exists in the environment.
   * @param key The environment variable key.
   */
  has(key: string): boolean {
    return this.env[key] !== undefined;
  }

  /**
   * Sets a custom value in the local env object (and also in process.env).
   * @param key The environment variable key.
   * @param value The value to set.
   */
  set(key: string, value: string): void {
    this.env[key] = value;
    process.env[key] = value;
  }

  /**
   * Retrieves the value for a given environment key.
   * @param key The environment variable key.
   */
  get(key: string): unknown {
    return this.env[key];
  }

  /**
   * Returns the entire environment object.
   */
  getProcessEnv(): Record<string, unknown> {
    return this.env;
  }
}
