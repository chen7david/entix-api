import { envConfigSchema } from '@config/env.config';
import type { EnvConfig } from '@config/env.config';
import { EnvService } from '@core/services/env.service';
import { Injectable } from '@core/utils/di.util';

/**
 * Service responsible for loading and providing access to application configuration
 */
@Injectable()
export class ConfigService {
  private config: EnvConfig;

  /**
   * Creates a new ConfigService instance and loads configuration from environment
   */
  constructor(private readonly envService: EnvService) {
    this.config = this.validateEnv(envConfigSchema, this.envService.getProcessEnv());
  }

  /**
   * Validates environment variables against the schema
   * @param schema The schema to validate against
   * @param data The data to validate
   * @returns The validated data
   */
  private validateEnv(schema: typeof envConfigSchema, data: Record<string, unknown>) {
    const parseResult = schema.safeParse(data);
    if (!parseResult.success) {
      // Constructing the error message
      const errorMessages = parseResult.error.errors
        .map((err) => {
          return `- ${err.path.join('.')} : ${err.message}`;
        })
        .join('\n');

      throw new Error(`Error parsing process.env:\n${errorMessages}\n\n`);
    }
    return parseResult.data;
  }

  /**
   * Gets a configuration value by key
   * @param key The key of the configuration value to get
   * @returns The configuration value
   */
  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }

  isNewRelicEnabled() {
    return this.config.NEW_RELIC_ENABLED;
  }
  isDevelopment() {
    return this.config.NODE_ENV === 'development';
  }

  isProduction() {
    return this.config.NODE_ENV === 'production';
  }

  isTest() {
    return this.config.NODE_ENV === 'test';
  }
}
