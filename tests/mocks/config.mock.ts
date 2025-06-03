import { faker } from '@faker-js/faker';
import { EnvConfig } from '@config/env.config';

/**
 * Generates a complete mock environment configuration with default values
 * that can be overridden as needed for tests
 */
export const createMockEnvConfig = (overrides: Partial<EnvConfig> = {}): Record<string, string> => {
  // Create default values for all required config properties
  const defaults: Record<string, string> = {
    NODE_ENV: 'test',
    APP_NAME: 'test-app',
    APP_PORT: '3000',
    LOG_LEVEL: 'info',
    AWS_REGION: 'us-east-1',
    AWS_USER_POOL_ID: 'us-east-1_mockedUserPoolId',
    COGNITO_CLIENT_ID: faker.string.alphanumeric(26),
    AWS_ACCESS_KEY_ID: faker.string.alphanumeric(20),
    AWS_SECRET_ACCESS_KEY: faker.string.alphanumeric(40),
  };

  // Create a map of all values, converting non-string values to strings
  const mockValues: Record<string, string> = {};

  // Start with defaults
  Object.entries(defaults).forEach(([key, value]) => {
    mockValues[key] = value;
  });

  // Apply overrides, converting to strings as needed
  Object.entries(overrides).forEach(([key, value]) => {
    if (value !== undefined) {
      mockValues[key] = String(value);
    }
  });

  return mockValues;
};
