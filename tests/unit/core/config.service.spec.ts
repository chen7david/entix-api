import { ConfigService } from '@core/services/config.service';
import { MockEnvService } from '@mocks/env.service.mock';
import { envConfigSchema } from '@config/env.config';
import { faker } from '@faker-js/faker';
import { EnvService } from '@core/services/env.service';
import { createMockEnvConfig } from '@mocks/config.mock';

describe('ConfigService', () => {
  let configService: ConfigService;
  let mockEnvService: MockEnvService;

  beforeEach(() => {
    // Create a mock environment with all required fields using our helper
    const mockConfig = createMockEnvConfig({
      APP_PORT: faker.number.int({ min: 3000, max: 9000 }),
      APP_NAME: faker.company.name(),
    });

    // Initialize the mock env service with our complete mock config
    mockEnvService = new MockEnvService(mockConfig);

    // Create ConfigService directly with the mock EnvService
    configService = new ConfigService(mockEnvService as unknown as EnvService);
  });

  describe('constructor', () => {
    it('should validate environment variables on instantiation', () => {
      expect(configService).toBeDefined();
    });

    it('should throw an error when required environment variables are missing', () => {
      // Create an incomplete mock config with missing required fields
      const incompleteConfig = {
        NODE_ENV: 'test',
        // Missing other required fields
      };

      const invalidMockEnv = new MockEnvService(incompleteConfig);

      // ConfigService should throw an error during validation
      expect(() => new ConfigService(invalidMockEnv as unknown as EnvService)).toThrow(
        /Error parsing process.env/,
      );
    });

    it('should throw an error when environment variables have invalid values', () => {
      // Create a config with invalid values that will fail Zod validation
      const invalidConfig = {
        NODE_ENV: 'invalid',
        APP_PORT: 'not-a-number',
        APP_NAME: faker.company.name(),
        LOG_LEVEL: 'invalid-level',
      };

      const invalidMockEnv = new MockEnvService(invalidConfig);

      // ConfigService should throw an error during validation
      expect(() => new ConfigService(invalidMockEnv as unknown as EnvService)).toThrow(
        /Error parsing process.env/,
      );
    });
  });

  describe('get', () => {
    it('should return configuration values', () => {
      // Get the values we set in the mockEnvService
      const appName = configService.get('APP_NAME');
      const appPort = configService.get('APP_PORT');
      const logLevel = configService.get('LOG_LEVEL');
      const awsRegion = configService.get('AWS_REGION');

      // Verify they match what we put in the mock
      expect(appName).toBe(mockEnvService.get('APP_NAME'));
      expect(appPort).toBe(parseInt(mockEnvService.get('APP_PORT') as string, 10));
      expect(logLevel).toBe(mockEnvService.get('LOG_LEVEL'));
      expect(awsRegion).toBe(mockEnvService.get('AWS_REGION'));
    });

    it('should properly coerce types according to schema', () => {
      // PORT should be coerced to number
      const appPort = configService.get('APP_PORT');
      expect(typeof appPort).toBe('number');
    });
  });

  describe('validateEnv', () => {
    it('should validate environment against schema', () => {
      // Create a test instance to access private methods
      class TestConfigService extends ConfigService {
        public testValidateEnv(schema: typeof envConfigSchema, data: Record<string, unknown>) {
          return this['validateEnv'](schema, data);
        }
      }

      const testService = new TestConfigService(mockEnvService as unknown as EnvService);

      // Create test data with all required fields
      const testData = createMockEnvConfig({
        APP_PORT: 3000,
        APP_NAME: 'Test App',
      });

      // Call the method directly
      const result = testService.testValidateEnv(envConfigSchema, testData);

      // Verify the result has proper types according to the schema
      expect(result).toEqual(
        expect.objectContaining({
          NODE_ENV: 'test',
          APP_PORT: 3000, // Should be coerced to number
          APP_NAME: 'Test App',
          LOG_LEVEL: 'info',
          AWS_REGION: 'us-east-1',
        }),
      );
    });

    it('should throw formatted error messages for invalid data', () => {
      // Create a test instance to access private methods
      class TestConfigService extends ConfigService {
        public testValidateEnv(schema: typeof envConfigSchema, data: Record<string, unknown>) {
          return this['validateEnv'](schema, data);
        }
      }

      // Create a test instance with the same dependencies
      const testService = new TestConfigService(mockEnvService as unknown as EnvService);

      // Create invalid test data
      const invalidData = {
        NODE_ENV: 'invalid', // Not in enum
        APP_PORT: 'not-a-port',
        // Missing other required fields
      };

      // Call the method and expect it to throw
      expect(() => testService.testValidateEnv(envConfigSchema, invalidData)).toThrow(
        /Error parsing process.env/,
      );
    });
  });
});
