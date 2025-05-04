/**
 * Jest setup file for entix-api.
 * This file runs before all tests are executed.
 * It sets up mock configurations for tests to run without database dependencies.
 */

// Setup reflect-metadata for TypeDI decorators
if (!Reflect || !Reflect.getMetadata) {
  global.Reflect = global.Reflect || {};
  global.Reflect.getMetadata = jest.fn();
  global.Reflect.decorate = jest.fn();
  global.Reflect.metadata = jest.fn();
}

// Skip database setup in favor of mocks
beforeAll(async () => {
  console.log('Using mock database for tests');
  // Instead of trying to set up a real database, we'll use mocks
  // This avoids the need for a running PostgreSQL instance

  // We'll use a simple flag to indicate we're in mock mode
  // @ts-ignore - Adding custom property to global
  global.__TEST_ENV__ = {
    mockDatabaseEnabled: true,
  };
});

// You can add other global test setup logic here if needed
