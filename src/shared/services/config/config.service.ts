import { envSchema, Env } from '@src/config/env.schema';
import dotenv from 'dotenv';
import { Injectable } from '@shared/utils/ioc.util';
import { InternalError } from '@shared/utils/error/error.util';

/**
 * ConfigService loads and validates environment variables using dotenv and zod.
 * It also manages async cleanup tasks for graceful shutdown.
 */
@Injectable()
export class ConfigService {
  private config?: Env;
  private configError?: string;

  constructor() {
    dotenv.config(); // Loads .env, does not throw if missing
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      this.configError = 'Invalid environment variables: ' + JSON.stringify(result.error.format());
    } else {
      this.config = result.data;
    }
  }

  /**
   * Get a config value by key. Throws if config is invalid.
   */
  get<K extends keyof Env>(key: K): Env[K] {
    if (this.configError) {
      throw new InternalError(this.configError);
    }
    if (!this.config) {
      throw new InternalError('Config not loaded.');
    }
    return this.config[key];
  }
}
