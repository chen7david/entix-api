import { EnvService } from '@core/services/env.service';
import { faker } from '@faker-js/faker';
import { EnvFileName } from '@core/constants/app.constant';
import { NodeEnv } from '@core/types/app.types';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Mock dotenv and path modules
jest.mock('dotenv', () => ({
  config: jest.fn().mockReturnValue({ parsed: {} }),
}));

jest.mock('path', () => ({
  resolve: jest.fn().mockReturnValue('/mocked/path'),
}));

describe('EnvService', () => {
  // Store original process.env
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Reset process.env before each test
    process.env = { ...originalEnv };
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    // Restore process.env after each test
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should use injected environment when provided', () => {
      // Create custom environment
      const customEnv = {
        CUSTOM_KEY: faker.string.uuid(),
        ANOTHER_KEY: faker.string.alpha(10),
      };

      // Create service with injected environment
      const envService = new EnvService(customEnv);

      // Verify that dotenv.config was not called
      expect(dotenv.config).not.toHaveBeenCalled();

      // Verify service has the injected values
      expect(envService.get('CUSTOM_KEY')).toBe(customEnv.CUSTOM_KEY);
      expect(envService.get('ANOTHER_KEY')).toBe(customEnv.ANOTHER_KEY);
    });

    it('should load environment from file when no injection provided', () => {
      // Create service without injected environment
      new EnvService();

      // Verify that dotenv.config was called with the correct path
      expect(dotenv.config).toHaveBeenCalled();
      expect(path.resolve).toHaveBeenCalledWith(expect.any(String), EnvFileName.TEST);
    });

    it('should throw error when NODE_ENV is not set', () => {
      // Remove NODE_ENV
      delete process.env.NODE_ENV;

      // Creating service should throw
      expect(() => new EnvService()).toThrow('NODE_ENV is not set');
    });
  });

  describe('getEnvPath', () => {
    it('should resolve correct path for development environment', () => {
      // Access private method using a subclass
      class TestEnvService extends EnvService {
        public testGetEnvPath(nodeEnv: NodeEnv) {
          return this['getEnvPath'](nodeEnv);
        }
      }

      const service = new TestEnvService();
      service.testGetEnvPath('development');

      // Verify path resolution
      expect(path.resolve).toHaveBeenCalledWith(expect.any(String), EnvFileName.DEVELOPMENT);
    });

    it('should resolve correct path for test environment', () => {
      class TestEnvService extends EnvService {
        public testGetEnvPath(nodeEnv: NodeEnv) {
          return this['getEnvPath'](nodeEnv);
        }
      }

      const service = new TestEnvService();
      service.testGetEnvPath('test');

      expect(path.resolve).toHaveBeenCalledWith(expect.any(String), EnvFileName.TEST);
    });

    it('should resolve correct path for production environment', () => {
      class TestEnvService extends EnvService {
        public testGetEnvPath(nodeEnv: NodeEnv) {
          return this['getEnvPath'](nodeEnv);
        }
      }

      const service = new TestEnvService();
      service.testGetEnvPath('production');

      expect(path.resolve).toHaveBeenCalledWith(expect.any(String), EnvFileName.PRODUCTION);
    });

    it('should throw error for invalid environment', () => {
      class TestEnvService extends EnvService {
        public testGetEnvPath(nodeEnv: string) {
          // Need to cast here because we're intentionally testing with an invalid value
          return this['getEnvPath'](nodeEnv as NodeEnv);
        }
      }

      const service = new TestEnvService();

      expect(() => service.testGetEnvPath('invalid')).toThrow(
        'Unsupported NODE_ENV value: invalid',
      );
    });
  });

  describe('has', () => {
    it('should return true when key exists', () => {
      const customEnv = { EXISTING_KEY: 'value' };
      const envService = new EnvService(customEnv);

      expect(envService.has('EXISTING_KEY')).toBe(true);
    });

    it('should return false when key does not exist', () => {
      const customEnv = { EXISTING_KEY: 'value' };
      const envService = new EnvService(customEnv);

      expect(envService.has('NON_EXISTING_KEY')).toBe(false);
    });
  });

  describe('set', () => {
    it('should set value in env object and process.env', () => {
      const envService = new EnvService({});
      const key = 'NEW_KEY';
      const value = faker.string.uuid();

      envService.set(key, value);

      // Value should be set in env service
      expect(envService.get(key)).toBe(value);

      // Value should also be set in process.env
      expect(process.env[key]).toBe(value);
    });
  });

  describe('get', () => {
    it('should return value for existing key', () => {
      const key = 'EXISTING_KEY';
      const value = faker.string.uuid();
      const envService = new EnvService({ [key]: value });

      expect(envService.get(key)).toBe(value);
    });

    it('should return undefined for non-existing key', () => {
      const envService = new EnvService({});

      expect(envService.get('NON_EXISTING_KEY')).toBeUndefined();
    });
  });

  describe('getProcessEnv', () => {
    it('should return the entire environment object', () => {
      const customEnv = {
        KEY1: faker.string.uuid(),
        KEY2: faker.string.alpha(10),
      };

      const envService = new EnvService(customEnv);
      const processEnv = envService.getProcessEnv();

      // Should contain all keys from customEnv
      expect(processEnv.KEY1).toBe(customEnv.KEY1);
      expect(processEnv.KEY2).toBe(customEnv.KEY2);
    });
  });
});
