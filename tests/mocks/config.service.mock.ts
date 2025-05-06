import type { Env } from '@shared/services/config/config.schema';
import type { ConfigService } from '@shared/services/config/config.service';
import { NodeEnv } from '@shared/constants/app.constants';
import { LOG_LEVELS } from '@shared/constants/logger.constants';

/**
 * Creates a Jest mock for the ConfigService.
 *
 * @param overrides - Optional partial mock implementation to override default mocks.
 * @returns A mocked ConfigService instance.
 */
export const createMockConfigService = (
  overrides?: Partial<jest.Mocked<ConfigService>>,
): jest.Mocked<ConfigService> => {
  const mockGet = jest.fn(<K extends keyof Env>(key: K): Env[K] => {
    // Provide default mock values or logic based on key
    const defaults: Partial<Env> = {
      NODE_ENV: NodeEnv.TEST,
      PORT: 5555,
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test-entix-api',
      COGNITO_USER_POOL_ID: 'mock-pool-id',
      COGNITO_CLIENT_ID: 'mock-client-id',
      COGNITO_REGION: 'us-east-1',
      NEW_RELIC_APP_NAME: 'mock-app',
      NEW_RELIC_LICENSE_KEY: 'mock-key',
      NEW_RELIC_ENABLED: false,
      LOG_LEVEL: LOG_LEVELS[3],
    };
    return defaults[key] as Env[K];
  });

  const mockService: jest.Mocked<ConfigService> = {
    get: mockGet,
    // Add other methods/properties if ConfigService has them
    ...overrides,
  } as jest.Mocked<ConfigService>; // Cast needed if ConfigService has private members

  return mockService;
};
