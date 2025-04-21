/**
 * @file Jest configuration for the entix-api project.
 * Uses ts-jest for TypeScript support and matches all test files with the pattern *.test.ts in the src directory (including nested folders).
 * Coverage is not generated at this time.
 * @see https://kulshekhar.github.io/ts-jest/docs/getting-started/installation/
 */

import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  collectCoverage: false,
  detectOpenHandles: true,
  verbose: true,
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@domains/(.*)$': '<rootDir>/src/domains/$1',
  },
};

export default config;
