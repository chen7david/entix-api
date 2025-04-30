import type { AuthService } from '@domains/auth/auth.service';

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
    login: jest.fn(),
    getMe: jest.fn(),
    updateMe: jest.fn(),
    deleteMe: jest.fn(),
    // Required properties for AuthService class
    logger: undefined,
    cognitoService: undefined,
    loggerService: undefined,
  };
  return mock as unknown as jest.Mocked<AuthService>;
}
