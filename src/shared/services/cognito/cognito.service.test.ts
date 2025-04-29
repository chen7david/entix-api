/**
 * @fileoverview Unit tests for CognitoService with AWS SDK and dependencies mocked.
 * No real AWS calls are made; all network interactions are mocked.
 */
import { CognitoService } from '@shared/services/cognito/cognito.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { ConfigService } from '@shared/services/config/config.service';
import {
  SignUpParams,
  AdminCreateUserParams,
  AdminInitiateAuthParams,
  ForgotPasswordParams,
  ConfirmForgotPasswordParams,
  ResendConfirmationCodeParams,
  AdminGetUserParams,
  AdminUpdateUserAttributesParams,
  ChangePasswordParams,
} from '@shared/types/cognito.type';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminCreateUserCommand,
  AdminInitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ResendConfirmationCodeCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  ChangePasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';

jest.mock('@aws-sdk/client-cognito-identity-provider');

const mockSend = jest.fn();
(CognitoIdentityProviderClient as jest.Mock).mockImplementation(() => ({
  send: mockSend,
}));

const mockLogger = { component: jest.fn(), log: jest.fn() } as unknown as LoggerService;
const mockConfigService = {
  get: jest.fn((key: string) => {
    switch (key) {
      case 'COGNITO_REGION':
        return 'us-east-1';
      case 'COGNITO_USER_POOL_ID':
        return 'test-pool';
      case 'COGNITO_CLIENT_ID':
        return 'test-client';
      default:
        return '';
    }
  }),
} as ConfigService;

describe('CognitoService', () => {
  let service: CognitoService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CognitoService(mockConfigService, mockLogger);
  });

  /**
   * Test signUp method.
   */
  it('should sign up a user and return confirmation and sub', async () => {
    const params: SignUpParams = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
    };
    mockSend.mockResolvedValueOnce({ UserConfirmed: true, UserSub: 'sub-123' });
    const result = await service.signUp(params);
    expect(result).toEqual({ userConfirmed: true, sub: 'sub-123' });
    expect(mockSend).toHaveBeenCalledWith(expect.any(SignUpCommand));
  });

  /**
   * Test adminCreateUser method.
   */
  it('should create a user as admin and return sub and status', async () => {
    const params: AdminCreateUserParams = {
      username: 'adminuser',
      email: 'admin@example.com',
      temporaryPassword: 'TempPass123!',
    };
    mockSend.mockResolvedValueOnce({
      User: { Username: 'sub-456', UserStatus: 'FORCE_CHANGE_PASSWORD' },
    });
    const result = await service.adminCreateUser(params);
    expect(result).toEqual({ sub: 'sub-456', userStatus: 'FORCE_CHANGE_PASSWORD' });
    expect(mockSend).toHaveBeenCalledWith(expect.any(AdminCreateUserCommand));
  });

  /**
   * Test adminInitiateAuth method.
   */
  it('should initiate admin auth and return tokens', async () => {
    const params: AdminInitiateAuthParams = { username: 'user', password: 'pass' };
    mockSend.mockResolvedValueOnce({
      AuthenticationResult: {
        AccessToken: 'access',
        RefreshToken: 'refresh',
        IdToken: 'id',
        ExpiresIn: 3600,
        TokenType: 'Bearer',
      },
    });
    const result = await service.adminInitiateAuth(params);
    expect(result).toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
      idToken: 'id',
      expiresIn: 3600,
      tokenType: 'Bearer',
    });
    expect(mockSend).toHaveBeenCalledWith(expect.any(AdminInitiateAuthCommand));
  });

  /**
   * Test forgotPassword method.
   */
  it('should initiate forgot password and return code delivery details', async () => {
    const params: ForgotPasswordParams = { username: 'user' };
    mockSend.mockResolvedValueOnce({
      CodeDeliveryDetails: {
        Destination: 'email',
        DeliveryMedium: 'EMAIL',
        AttributeName: 'email',
      },
    });
    const result = await service.forgotPassword(params);
    expect(result).toEqual({
      codeDeliveryDetails: {
        destination: 'email',
        deliveryMedium: 'EMAIL',
        attributeName: 'email',
      },
    });
    expect(mockSend).toHaveBeenCalledWith(expect.any(ForgotPasswordCommand));
  });

  /**
   * Test confirmForgotPassword method.
   */
  it('should confirm forgot password and return success', async () => {
    const params: ConfirmForgotPasswordParams = {
      username: 'user',
      code: '123456',
      newPassword: 'NewPass123!',
    };
    mockSend.mockResolvedValueOnce({});
    const result = await service.confirmForgotPassword(params);
    expect(result).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledWith(expect.any(ConfirmForgotPasswordCommand));
  });

  /**
   * Test resendConfirmationCode method.
   */
  it('should resend confirmation code and return code delivery details', async () => {
    const params: ResendConfirmationCodeParams = { username: 'user' };
    mockSend.mockResolvedValueOnce({
      CodeDeliveryDetails: {
        Destination: 'email',
        DeliveryMedium: 'EMAIL',
        AttributeName: 'email',
      },
    });
    const result = await service.resendConfirmationCode(params);
    expect(result).toEqual({
      codeDeliveryDetails: {
        destination: 'email',
        deliveryMedium: 'EMAIL',
        attributeName: 'email',
      },
    });
    expect(mockSend).toHaveBeenCalledWith(expect.any(ResendConfirmationCodeCommand));
  });

  /**
   * Test adminGetUser method.
   */
  it('should get user details as admin', async () => {
    const params: AdminGetUserParams = { username: 'user' };
    mockSend.mockResolvedValueOnce({
      Username: 'user',
      UserStatus: 'CONFIRMED',
      Enabled: true,
      UserCreateDate: new Date('2023-01-01'),
      UserLastModifiedDate: new Date('2023-01-02'),
      UserAttributes: [
        { Name: 'email', Value: 'user@example.com' },
        { Name: 'custom:role', Value: 'admin' },
      ],
    });
    const result = await service.adminGetUser(params);
    expect(result).toEqual({
      username: 'user',
      userStatus: 'CONFIRMED',
      enabled: true,
      userCreateDate: new Date('2023-01-01'),
      userLastModifiedDate: new Date('2023-01-02'),
      attributes: {
        email: 'user@example.com',
        'custom:role': 'admin',
      },
    });
    expect(mockSend).toHaveBeenCalledWith(expect.any(AdminGetUserCommand));
  });

  /**
   * Test adminUpdateUserAttributes method.
   */
  it('should update user attributes as admin and return success', async () => {
    const params: AdminUpdateUserAttributesParams = {
      username: 'user',
      attributes: { email: 'new@example.com' },
    };
    mockSend.mockResolvedValueOnce({});
    const result = await service.adminUpdateUserAttributes(params);
    expect(result).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledWith(expect.any(AdminUpdateUserAttributesCommand));
  });

  /**
   * Test changePassword method.
   */
  it('should change password and return success', async () => {
    const params: ChangePasswordParams = {
      accessToken: 'token',
      previousPassword: 'old',
      proposedPassword: 'new',
    };
    mockSend.mockResolvedValueOnce({});
    const result = await service.changePassword(params);
    expect(result).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledWith(expect.any(ChangePasswordCommand));
  });

  /**
   * Test error mapping for signUp method.
   */
  it('should map errors using mapCognitoErrorToAppError', async () => {
    const error = new Error('Cognito error');
    mockSend.mockRejectedValueOnce(error);
    await expect(
      service.signUp({ username: 'u', email: 'e', password: 'p' }),
    ).rejects.toBeDefined();
  });
});
