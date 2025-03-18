// Setup mocks before imports
const mockConfig = jest.fn().mockReturnValue({ parsed: {} });
jest.mock('dotenv', () => ({
  config: mockConfig,
}));

import { getEnvFilename, loadConfig } from '@src/utils/env.util';
import { Environment, EnvFile } from '@src/types/app.types';
import { z } from 'zod';

/**
 * Tests for environment utility functions
 */
describe('Environment Utilities', () => {
  describe('getEnvFilename', () => {
    it('returns the development environment file when nodeEnv is "development"', () => {
      const result = getEnvFilename(Environment.Development);
      expect(result).toBe(EnvFile.DevelopmentEnv);
    });

    it('returns the test environment file when nodeEnv is "test"', () => {
      const result = getEnvFilename(Environment.Test);
      expect(result).toBe(EnvFile.TestEnv);
    });

    it('returns the development environment file by default when nodeEnv is undefined', () => {
      const result = getEnvFilename(undefined);
      expect(result).toBe(EnvFile.DevelopmentEnv);
    });

    it('returns the development environment file for an unrecognized environment', () => {
      const result = getEnvFilename('unknown' as Environment);
      expect(result).toBe(EnvFile.DevelopmentEnv);
    });

    it('handles production environment correctly', () => {
      const result = getEnvFilename(Environment.Production);
      expect(result).toBe(EnvFile.DevelopmentEnv);
    });
  });

  describe('loadConfig', () => {
    // Save original process.env for restoration
    const originalEnv = process.env;

    // Test schema for environment variables
    const testSchema = z.object({
      DATABASE_URL: z.string().url(),
      PORT: z.coerce.number().int().positive(),
      JWT_SECRET: z.string().min(10),
    });

    beforeEach(() => {
      // Reset modules between tests
      jest.resetModules();

      // Reset environment variables to empty object
      process.env = {};

      // Clear mock data and implementation for each test
      mockConfig.mockClear();
    });

    afterEach(() => {
      // Restore original process.env
      process.env = originalEnv;
    });

    afterAll(() => {
      // Clean up all mocks
      jest.restoreAllMocks();
    });

    it('loads and validates environment variables successfully', () => {
      // Setup test environment
      Object.assign(process.env, {
        DATABASE_URL: 'https://example.com',
        PORT: '3000',
        JWT_SECRET: 'supersecretkey',
      });

      // Execute function
      const config = loadConfig({ schema: testSchema, envPath: '.env' });

      // Verify correct parsing of environment variables
      expect(config).toEqual({
        DATABASE_URL: 'https://example.com',
        PORT: 3000, // Note the number type conversion from string
        JWT_SECRET: 'supersecretkey',
      });

      // Verify dotenv.config was called with the correct path
      expect(mockConfig).toHaveBeenCalledWith({ path: '.env' });
    });

    it('throws a formatted error if a required variable is missing', () => {
      // Setup incomplete environment
      Object.assign(process.env, {
        DATABASE_URL: 'https://example.com',
        PORT: '3000',
        // JWT_SECRET is missing
      });

      // Verify error message format
      expect(() => loadConfig({ schema: testSchema, envPath: '.env' })).toThrow(
        /Missing or invalid variables:/,
      );

      // Verify specific missing variable is mentioned
      expect(() => loadConfig({ schema: testSchema, envPath: '.env' })).toThrow(/• JWT_SECRET/);
    });

    it('throws a formatted error if a variable fails type validation', () => {
      // Setup environment with invalid type
      Object.assign(process.env, {
        DATABASE_URL: 'https://example.com',
        PORT: 'not_a_number', // Invalid port
        JWT_SECRET: 'supersecretkey',
      });

      // Verify invalid field is mentioned in error
      expect(() => loadConfig({ schema: testSchema, envPath: '.env' })).toThrow(/• PORT/);
    });

    it('throws a formatted error listing all invalid variables', () => {
      // Setup environment with multiple issues
      Object.assign(process.env, {
        DATABASE_URL: 'not_a_valid_url', // Invalid URL
        PORT: 'not_a_number', // Invalid port
        // JWT_SECRET is missing
      });

      // Create reusable test function
      const loadFn = () => loadConfig({ schema: testSchema, envPath: '.env' });

      // Verify all issues are mentioned in error
      expect(loadFn).toThrow(/• DATABASE_URL/);
      expect(loadFn).toThrow(/• PORT/);
      expect(loadFn).toThrow(/• JWT_SECRET/);
    });

    it('applies schema defaults when environment variables are missing', () => {
      // Schema with default values
      const schemaWithDefaults = z.object({
        PORT: z.coerce.number().int().positive().default(3000),
        NODE_ENV: z
          .enum([Environment.Development, Environment.Test])
          .default(Environment.Development),
      });

      // Execute with no environment variables set
      const config = loadConfig({ schema: schemaWithDefaults, envPath: '.env' });

      // Verify defaults are applied
      expect(config).toEqual({
        PORT: 3000,
        NODE_ENV: Environment.Development,
      });
    });

    it('uses variables from the specified .env file', () => {
      // Setup test environment variables
      const testEnvVars = {
        DATABASE_URL: 'https://test-db.example.com',
        PORT: '4000',
        JWT_SECRET: 'test-secret-key',
      };
      Object.assign(process.env, testEnvVars);

      // Execute with custom env path
      const config = loadConfig({ schema: testSchema, envPath: '.env.test' });

      // Verify the correct env file was used
      expect(mockConfig).toHaveBeenCalledWith({ path: '.env.test' });

      // Verify correct parsing of environment variables
      expect(config).toEqual({
        DATABASE_URL: 'https://test-db.example.com',
        PORT: 4000, // Note number conversion
        JWT_SECRET: 'test-secret-key',
      });
    });

    it('propagates non-ZodError exceptions', () => {
      // Mock implementation to throw non-Zod error
      mockConfig.mockImplementationOnce(() => {
        throw new Error('File access error');
      });

      // Setup environment to prevent Zod errors
      Object.assign(process.env, {
        DATABASE_URL: 'https://example.com',
        PORT: '3000',
        JWT_SECRET: 'supersecretkey',
      });

      // Verify original error is propagated
      expect(() => loadConfig({ schema: testSchema, envPath: '.env' })).toThrow(
        'File access error',
      );
    });
  });
});
