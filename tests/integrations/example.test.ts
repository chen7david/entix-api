import { mockAuthContext } from '@tests/utils/mocks';
import { describe, it, expect } from '@jest/globals';

describe('Example Integration Test', () => {
  it('should be able to use mock data from test utils', () => {
    expect(mockAuthContext.userId).toBe('test-user-id');
    expect(mockAuthContext.isAuthenticated).toBe(true);
  });

  it('should have proper Jest config', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
