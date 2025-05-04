/**
 * Jest setup file for entix-api.
 * This file runs before all tests are executed.
 * It sets up mock configurations for tests to run without database dependencies.
 */

// import { boolean } from 'drizzle-orm/gel-core';

// Setup reflect-metadata for TypeDI decorators
if (!Reflect || !Reflect.getMetadata) {
  global.Reflect = global.Reflect || {};
  global.Reflect.getMetadata = jest.fn();
  global.Reflect.decorate = jest.fn();
  global.Reflect.metadata = jest.fn();
}

// You can add other global test setup logic here if needed
