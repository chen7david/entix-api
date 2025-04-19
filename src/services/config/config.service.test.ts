import { ConfigService } from './config.service';
import { Container } from '@src/shared/utils/typedi/typedi.util';
import { IoC } from '@src/shared/constants/ioc.constants';
import { z } from 'zod';
import { NodeEnv, EnvFile } from '@src/shared/constants/app.constants';

// Mock external dependencies
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
}));

jest.mock('path', () => ({
  resolve: jest.fn().mockImplementation((...args) => args.join('/')),
}));

// Import mocks after mocking
import * as dotenvMock from 'dotenv';
import * as fsMock from 'fs';

// Cast the mocked modules to any to access mock properties
const dotenv = dotenvMock as jest.Mocked<typeof dotenvMock>;
const fs = fsMock as jest.Mocked<typeof fsMock>;

describe('ConfigService', () => {
  // Backup of original process.env
  const originalEnv = { ...process.env };

  // Create a simple test schema
  const testSchema = z.object({
    NODE_ENV: z.enum([NodeEnv.DEV, NodeEnv.PROD, NodeEnv.TEST]).optional(),
    PORT: z.string().regex(/^\d+$/),
  });

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };

    // Reset mocks
    jest.clearAllMocks();
    Container.reset();

    // Mock fs.existsSync to return true by default
    fs.existsSync.mockReturnValue(true);
  });

  afterEach(() => {
    // Restore process.env after each test
    process.env = originalEnv;
  });

  it('should load and validate environment variables successfully', () => {
    // Arrange
    process.env.NODE_ENV = NodeEnv.DEV;
    process.env.PORT = '3000';
    Container.set(IoC.ENV_SCHEMA, testSchema);

    // Act
    const configService = new ConfigService(testSchema);

    // Assert
    expect(configService.env).toBeDefined();
    expect(configService.env.NODE_ENV).toBe(NodeEnv.DEV);
    expect(configService.env.PORT).toBe('3000');
    expect(dotenv.config).toHaveBeenCalled();
    expect(fs.existsSync).toHaveBeenCalled();
  });

  it('should load the correct .env file based on NODE_ENV', () => {
    // Arrange
    process.env.NODE_ENV = NodeEnv.TEST;
    process.env.PORT = '4000';
    Container.set(IoC.ENV_SCHEMA, testSchema);

    // Act
    new ConfigService(testSchema);

    // Assert
    expect(fs.existsSync).toHaveBeenCalledWith(
      expect.stringContaining(EnvFile.TEST)
    );
    expect(dotenv.config).toHaveBeenCalledWith({
      path: expect.stringContaining(EnvFile.TEST),
    });
  });

  it('should not throw if .env file is missing', () => {
    // Arrange
    process.env.NODE_ENV = NodeEnv.DEV;
    process.env.PORT = '3000';
    fs.existsSync.mockReturnValue(false); // .env file doesn't exist
    Container.set(IoC.ENV_SCHEMA, testSchema);

    // Act & Assert
    expect(() => new ConfigService(testSchema)).not.toThrow();
    expect(dotenv.config).not.toHaveBeenCalled();
  });

  it('should throw a formatted error if validation fails', () => {
    // Arrange
    process.env.NODE_ENV = NodeEnv.DEV;
    // Missing PORT which is required by schema
    Container.set(IoC.ENV_SCHEMA, testSchema);

    // Act & Assert
    expect(() => new ConfigService(testSchema)).toThrow(
      'Environment variable validation failed:'
    );
  });

  it('should throw an error for invalid environment variable values', () => {
    // Arrange
    process.env.NODE_ENV = NodeEnv.DEV;
    process.env.PORT = 'invalid-port'; // Invalid port (not a number)
    Container.set(IoC.ENV_SCHEMA, testSchema);

    // Act & Assert
    expect(() => new ConfigService(testSchema)).toThrow(
      'Environment variable validation failed:'
    );
  });

  it('should use default .env file when NODE_ENV is not set', () => {
    // Arrange
    delete process.env.NODE_ENV;
    process.env.PORT = '3000';
    Container.set(IoC.ENV_SCHEMA, testSchema);

    // Act
    new ConfigService(testSchema);

    // Assert
    expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining('.env'));
    expect(dotenv.config).toHaveBeenCalledWith({
      path: expect.stringContaining('.env'),
    });
  });

  it('should use constructor injection from the container', () => {
    // Arrange
    process.env.NODE_ENV = NodeEnv.DEV;
    process.env.PORT = '3000';
    Container.set(IoC.ENV_SCHEMA, testSchema);

    // Act
    const configService = new ConfigService(testSchema);

    // Assert
    expect(configService).toBeInstanceOf(ConfigService);
    expect(configService.env).toBeDefined();
    expect(configService.env.NODE_ENV).toBe(NodeEnv.DEV);
    expect(configService.env.PORT).toBe('3000');
  });
});
