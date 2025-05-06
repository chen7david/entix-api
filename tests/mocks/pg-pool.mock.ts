import type { Pool } from 'pg';

/**
 * Creates a simple mock pg Pool for testing.
 * Provides a jest.fn() for the `end` method.
 */
export function createMockPgPool(): jest.Mocked<Pool> {
  return {
    end: jest.fn().mockResolvedValue(undefined),
    // Add other Pool methods/properties if needed for tests
  } as unknown as jest.Mocked<Pool>;
}
