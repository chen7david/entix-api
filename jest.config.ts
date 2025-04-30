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
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/', '/coverage/'],
  collectCoverage: false,
  detectOpenHandles: true,
  verbose: true,
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@domains/(.*)$': '<rootDir>/src/domains/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@openapi/(.*)$': '<rootDir>/src/openapi/$1',
    '^@database/(.*)$': '<rootDir>/src/database/$1',
  },
};

export default config;
