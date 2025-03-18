import { z } from 'zod';
import { Environment } from '@src/types/app.types';
import { loadConfig } from './config.util';

describe('Config Utility', () => {
  const originalEnv = process.env;
  const testSchema = z.object({
    TEST_VAR: z.string(),
    OPTIONAL_VAR: z.string().optional(),
    NUMBER_VAR: z.coerce.number().default(42),
    ENV_VAR: z.nativeEnum(Environment).default(Environment.Development),
  });

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original process.env
    process.env = originalEnv;
  });

  describe('Environment Loading and Validation', () => {
    it('should load variables from process.env and validate against schema', () => {
      // Setup test environment variables
      process.env.TEST_VAR = 'test_value';
      process.env.NUMBER_VAR = '123';

      const config = loadConfig({ schema: testSchema });

      // Verify variables are properly loaded and typed
      expect(config).toEqual({
        TEST_VAR: 'test_value',
        NUMBER_VAR: 123,
        ENV_VAR: Environment.Development,
      });
    });

    it('should apply schema defaults when variables are not provided', () => {
      // Only set required variables
      process.env.TEST_VAR = 'test_value';

      const config = loadConfig({ schema: testSchema });

      // Verify default values are applied
      expect(config.NUMBER_VAR).toBe(42);
      expect(config.ENV_VAR).toBe(Environment.Development);
      expect(config.OPTIONAL_VAR).toBeUndefined();
      // Verify required values remain
      expect(config.TEST_VAR).toBe('test_value');
    });
  });

  describe('Validation Errors', () => {
    it('should throw error when required variables are missing', () => {
      // Remove all environment variables
      const varsToDelete = ['TEST_VAR', 'NUMBER_VAR', 'ENV_VAR', 'OPTIONAL_VAR'];
      varsToDelete.forEach(key => delete process.env[key]);

      expect(() => loadConfig({ schema: testSchema })).toThrow(/Missing or invalid variables/);
    });

    it('should throw error when variables fail type validation', () => {
      // Set invalid type for NUMBER_VAR
      process.env.TEST_VAR = 'valid';
      process.env.NUMBER_VAR = 'not_a_number';

      expect(() => loadConfig({ schema: testSchema })).toThrow(/Missing or invalid variables/);
    });

    it('should throw error for invalid enum values', () => {
      // Set invalid enum value
      process.env.TEST_VAR = 'valid';
      process.env.ENV_VAR = 'invalid_env';

      expect(() => loadConfig({ schema: testSchema })).toThrow(/Missing or invalid variables/);
    });

    it('should handle optional variables correctly', () => {
      // Only set required variables
      process.env.TEST_VAR = 'test_value';

      const config = loadConfig({ schema: testSchema });

      // Optional variables should be undefined if not set
      expect(config.OPTIONAL_VAR).toBeUndefined();
    });
  });
});
