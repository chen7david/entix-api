import type { Config } from 'jest';

const config: Config = {
  collectCoverage: false,
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  maxWorkers: '50%',
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@mocks/(.*)$': '<rootDir>/tests/mocks/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
  },
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  verbose: true,
};

export default config;
