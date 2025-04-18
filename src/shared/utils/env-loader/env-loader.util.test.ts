import { EnvLoader } from '@src/shared/utils/env-loader/env-loader.util';
import { z } from 'zod';

// Mock modules
jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('fs', () => ({ existsSync: jest.fn() }));

// Import mocked modules through ESM syntax
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Cast mocks to the right types
const mockDotenvConfig = dotenv.config as jest.MockedFunction<
  typeof dotenv.config
>;
const mockFsExists = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;

describe('EnvLoader', () => {
  const schema = z.object({
    NODE_ENV: z.enum(['dev', 'prod', 'test']),
    PORT: z.string().regex(/^\d+$/),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'dev';
    process.env.PORT = '3000';
  });

  it('should load and validate environment variables successfully', () => {
    mockFsExists.mockReturnValue(true);
    expect(() => new EnvLoader(schema)).not.toThrow();
    const loader = new EnvLoader(schema);
    expect(loader.env.NODE_ENV).toBe('dev');
    expect(loader.env.PORT).toBe('3000');
    expect(mockDotenvConfig).toHaveBeenCalled();
  });

  it('should not throw if .env file does not exist', () => {
    mockFsExists.mockReturnValue(false);
    expect(() => new EnvLoader(schema)).not.toThrow();
    expect(mockDotenvConfig).not.toHaveBeenCalled();
  });

  it('should throw a formatted error if validation fails', () => {
    mockFsExists.mockReturnValue(true);
    process.env.PORT = 'not-a-number';
    try {
      new EnvLoader(schema);
      fail('Should have thrown');
    } catch (err: unknown) {
      if (err instanceof Error) {
        expect(err.message).toMatch('Environment variable validation failed:');
        expect(err.message).toMatch('PORT');
      } else {
        fail('Error should be an instance of Error');
      }
    }
  });

  it('should throw a formatted error if required env var is missing', () => {
    mockFsExists.mockReturnValue(true);
    delete process.env.PORT;
    try {
      new EnvLoader(schema);
      fail('Should have thrown');
    } catch (err: unknown) {
      if (err instanceof Error) {
        expect(err.message).toMatch('Environment variable validation failed:');
        expect(err.message).toMatch('PORT');
      } else {
        fail('Error should be an instance of Error');
      }
    }
  });
});
