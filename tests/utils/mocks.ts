/**
 * Common mocks for tests
 */

/**
 * Creates a mock database client for testing
 */
export const createMockDbClient = () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
  release: jest.fn(),
});

/**
 * Mock authentication context for testing
 */
export const mockAuthContext = {
  userId: 'test-user-id',
  email: 'test@example.com',
  isAuthenticated: true,
};
