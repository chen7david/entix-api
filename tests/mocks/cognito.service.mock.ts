import type {
  ChangePasswordParams,
  ChangePasswordResult,
  ConfirmForgotPasswordParams,
  ConfirmForgotPasswordResult,
  ConfirmSignUpParams,
  ConfirmSignUpResult,
  DeleteUserParams,
  DeleteUserResult,
  ForgotPasswordParams,
  ForgotPasswordResult,
  GetUserParams,
  GetUserResult,
  LoginParams,
  LoginResult,
  SigninParams,
  SigninResult,
  RefreshTokenParams,
  RefreshTokenResult,
  ResendConfirmationCodeParams,
  ResendConfirmationCodeResult,
  SignOutParams,
  SignOutResult,
  SignUpParams,
  SignUpResult,
  UpdateUserAttributesParams,
  UpdateUserAttributesResult,
} from '@shared/types/cognito.type';
import type { CognitoService } from '@shared/services/cognito/cognito.service';
import { faker } from '@faker-js/faker';

/**
 * Creates a Jest mock for the CognitoService.
 *
 * @param overrides - Optional partial mock implementation to override default mocks.
 * @returns A mocked CognitoService instance.
 */
export const createMockCognitoService = (
  overrides?: Partial<jest.Mocked<CognitoService>>,
): jest.Mocked<CognitoService> => {
  const mockService: jest.Mocked<CognitoService> = {
    signUp: jest.fn<Promise<SignUpResult>, [SignUpParams]>().mockResolvedValue({
      userConfirmed: false,
      sub: faker.string.uuid(),
    }),
    forgotPassword: jest
      .fn<Promise<ForgotPasswordResult>, [ForgotPasswordParams]>()
      .mockResolvedValue({ codeDeliveryDetails: undefined }),
    confirmForgotPassword: jest
      .fn<Promise<ConfirmForgotPasswordResult>, [ConfirmForgotPasswordParams]>()
      .mockResolvedValue({ success: true }),
    resendConfirmationCode: jest
      .fn<Promise<ResendConfirmationCodeResult>, [ResendConfirmationCodeParams]>()
      .mockResolvedValue({ codeDeliveryDetails: undefined }),
    changePassword: jest
      .fn<Promise<ChangePasswordResult>, [ChangePasswordParams]>()
      .mockResolvedValue({ success: true }),
    confirmSignUp: jest
      .fn<Promise<ConfirmSignUpResult>, [ConfirmSignUpParams]>()
      .mockResolvedValue({ success: true }),
    signOut: jest
      .fn<Promise<SignOutResult>, [SignOutParams]>()
      .mockResolvedValue({ success: true }),
    refreshToken: jest
      .fn<Promise<RefreshTokenResult>, [RefreshTokenParams]>()
      .mockResolvedValue({ accessToken: 'mock-access-token', idToken: 'mock-id-token' }),
    login: jest.fn<Promise<LoginResult>, [LoginParams]>().mockResolvedValue({
      accessToken: 'mock-access-token',
      idToken: 'mock-id-token',
      refreshToken: 'mock-refresh-token',
    }),
    signin: jest.fn<Promise<SigninResult>, [SigninParams]>().mockResolvedValue({
      accessToken: 'mock-access-token',
      idToken: 'mock-id-token',
      refreshToken: 'mock-refresh-token',
    }),
    getUser: jest
      .fn<Promise<GetUserResult>, [GetUserParams]>()
      .mockResolvedValue({ username: 'mock-user', attributes: { email: 'mock@example.com' } }),
    updateUserAttributes: jest
      .fn<Promise<UpdateUserAttributesResult>, [UpdateUserAttributesParams]>()
      .mockResolvedValue({ success: true }),
    deleteUser: jest
      .fn<Promise<DeleteUserResult>, [DeleteUserParams]>()
      .mockResolvedValue({ success: true }),

    // Add other methods/properties if CognitoService has them
    ...overrides,
  } as jest.Mocked<CognitoService>; // Cast might be needed for private members

  return mockService;
};
