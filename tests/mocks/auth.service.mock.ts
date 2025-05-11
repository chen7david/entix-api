import type { AuthService } from '@domains/auth/auth.service';
import { createMockLogger } from '@tests/mocks/logger.service.mock'; // Use path alias
import { createMockCognitoService } from '@tests/mocks/cognito.service.mock'; // Use path alias

/**
 * Returns a fully-mocked AuthService for use in tests.
 * All methods are jest.fn() mocks and the object is typed as jest.Mocked<AuthService>.
 */
export function createMockAuthService(): jest.Mocked<AuthService> {
  const mock = {
    signUp: jest.fn(),
    confirmSignUp: jest.fn(),
    forgotPassword: jest.fn(),
    confirmForgotPassword: jest.fn(),
    resendConfirmationCode: jest.fn(),
    changePassword: jest.fn(),
    signOut: jest.fn(),
    refreshToken: jest.fn(),
    signin: jest.fn(),
    getMe: jest.fn(),
    updateMe: jest.fn(),
    deleteMe: jest.fn(),
    // Use actual mocks for properties if needed for type casting
    logger: createMockLogger(),
    cognitoService: createMockCognitoService(),
  };
  // Cast to unknown first to bypass strict private property checks
  return mock as unknown as jest.Mocked<AuthService>;
}
