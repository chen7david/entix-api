// Variables to track mock state
let mockEnded = false;
let poolCallCount = 0;

// Mock modules
jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation(() => {
      poolCallCount++;
      return {
        on: jest.fn(),
        end: jest.fn().mockResolvedValue(undefined),
        get ended() {
          return mockEnded;
        },
      };
    }),
  };
});

describe('PostgreSQL Database Connection', () => {
  beforeEach(() => {
    // Reset mocks and state
    jest.clearAllMocks();
    jest.resetModules();
    mockEnded = false;
    poolCallCount = 0;
  });

  describe('getPool function', () => {
    it('should reuse the pool when it exists and is not ended', () => {
      // Import the module fresh
      const { getPool } = require('../pg.db');

      // Call getPool twice
      const pool1 = getPool();
      const pool2 = getPool();

      // Should only create one pool instance
      expect(poolCallCount).toBe(1);
      expect(pool1).toBe(pool2);
    });

    it('should create a new pool when the existing one is ended', () => {
      // Import the module fresh
      const { getPool } = require('../pg.db');

      // First call to getPool
      const pool1 = getPool();

      // Set the pool as ended
      mockEnded = true;

      // Second call should create a new pool
      const pool2 = getPool();

      // Should create two different pool instances
      expect(poolCallCount).toBe(2);
      expect(pool1).not.toBe(pool2);
    });
  });
});
