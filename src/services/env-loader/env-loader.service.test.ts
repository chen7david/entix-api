import { EnvLoader } from '@src/services/env-loader/env-loader.service';
import { z } from 'zod';

jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('fs', () => ({ existsSync: jest.fn() }));

const mockDotenv = require('dotenv');
const mockFs = require('fs');

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
    (mockFs.existsSync as jest.Mock).mockReturnValue(true);
    expect(() => new EnvLoader(schema)).not.toThrow();
    const loader = new EnvLoader(schema);
    expect(loader.env.NODE_ENV).toBe('dev');
    expect(loader.env.PORT).toBe('3000');
    expect(mockDotenv.config).toHaveBeenCalled();
  });

  it('should not throw if .env file does not exist', () => {
    (mockFs.existsSync as jest.Mock).mockReturnValue(false);
    expect(() => new EnvLoader(schema)).not.toThrow();
    expect(mockDotenv.config).not.toHaveBeenCalled();
  });

  it('should throw a formatted error if validation fails', () => {
    (mockFs.existsSync as jest.Mock).mockReturnValue(true);
    process.env.PORT = 'not-a-number';
    try {
      new EnvLoader(schema);
      fail('Should have thrown');
    } catch (err: any) {
      expect(err.message).toMatch('Environment variable validation failed:');
      expect(err.message).toMatch('PORT');
    }
  });

  it('should throw a formatted error if required env var is missing', () => {
    (mockFs.existsSync as jest.Mock).mockReturnValue(true);
    delete process.env.PORT;
    try {
      new EnvLoader(schema);
      fail('Should have thrown');
    } catch (err: any) {
      expect(err.message).toMatch('Environment variable validation failed:');
      expect(err.message).toMatch('PORT');
    }
  });
});
