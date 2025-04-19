/**
 * @file EnvService unit tests
 */
import { EnvService } from './env.service';
import { z } from 'zod';

// Mock modules
jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('fs', () => ({ existsSync: jest.fn() }));

import * as dotenv from 'dotenv';
import * as fs from 'fs';

const mockDotenvConfig = dotenv.config as jest.MockedFunction<
  typeof dotenv.config
>;
const mockFsExists = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;

describe('EnvService', () => {
  const schema = z.object({
    NODE_ENV: z.enum(['dev', 'prod', 'test']),
    PORT: z.coerce.number().min(1024).max(65535),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'development';
    process.env.PORT = '3000';
  });

  it('should load and validate environment variables successfully', () => {
    mockFsExists.mockReturnValue(true);
    expect(() => new EnvService(schema)).not.toThrow();
    const envService = new EnvService(schema);
    expect(envService.env.NODE_ENV).toBe('development');
    expect(envService.env.PORT).toBe(3000);
    expect(mockDotenvConfig).toHaveBeenCalled();
  });

  it('should not throw if .env file does not exist', () => {
    mockFsExists.mockReturnValue(false);
    expect(() => new EnvService(schema)).not.toThrow();
    expect(mockDotenvConfig).not.toHaveBeenCalled();
  });

  it('should throw a formatted error if validation fails', () => {
    mockFsExists.mockReturnValue(true);
    process.env.PORT = 'not-a-number';
    expect(() => new EnvService(schema)).toThrow(/Environment Config Error/);
  });

  it('should throw a formatted error if required env var is missing', () => {
    mockFsExists.mockReturnValue(true);
    delete process.env.PORT;
    expect(() => new EnvService(schema)).toThrow(/Environment Config Error/);
  });
});
