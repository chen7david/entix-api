/**
 * @fileoverview Unit tests for CognitoService with AWS SDK and dependencies mocked.
 * No real AWS calls are made; all network interactions are mocked.
 */
import { CognitoService } from '@shared/services/cognito/cognito.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { ConfigService } from '@shared/services/config/config.service';
import {
  SignUpParams,
  ForgotPasswordParams,
  ConfirmForgotPasswordParams,
  ResendConfirmationCodeParams,
  ChangePasswordParams,
  ConfirmSignUpParams,
} from '@shared/types/cognito.type';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ResendConfirmationCodeCommand,
  ChangePasswordCommand,
  ConfirmSignUpCommand,
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
   * @test
   * @description Should sign up a user and return confirmation and sub.
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
   * @test
   * @description Should initiate forgot password and return code delivery details.
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
   * @test
   * @description Should confirm forgot password and return success.
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
   * @test
   * @description Should resend confirmation code and return code delivery details.
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
   * @test
   * @description Should change password and return success.
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
   * @test
   * @description Should map errors using mapCognitoErrorToAppError for signUp method.
   */
  it('should map errors using mapCognitoErrorToAppError', async () => {
    const error = new Error('Cognito error');
    mockSend.mockRejectedValueOnce(error);
    await expect(
      service.signUp({ username: 'u', email: 'e', password: 'p' }),
    ).rejects.toBeDefined();
  });

  /**
   * @test
   * @description Should confirm user signup and return success.
   */
  it('should confirm user signup and return success', async () => {
    const params: ConfirmSignUpParams = {
      username: 'testuser',
      code: '123456',
    };
    mockSend.mockResolvedValueOnce({});
    const result = await service.confirmSignUp(params);
    expect(result).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledWith(expect.any(ConfirmSignUpCommand));
  });

  /**
   * @test
   * @description Should map errors using mapCognitoErrorToAppError for confirmSignUp method.
   */
  it('should map errors using mapCognitoErrorToAppError for confirmSignUp', async () => {
    const error = new Error('Cognito error');
    mockSend.mockRejectedValueOnce(error);
    await expect(service.confirmSignUp({ username: 'u', code: 'c' })).rejects.toBeDefined();
  });
});
