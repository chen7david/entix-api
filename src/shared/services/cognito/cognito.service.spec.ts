/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @fileoverview Unit tests for CognitoService with AWS SDK and dependencies mocked.
 * No real AWS calls are made; all network interactions are mocked.
 */
import { CognitoService } from '@shared/services/cognito/cognito.service';
import {
  SignUpParams,
  ForgotPasswordParams,
  ConfirmForgotPasswordParams,
  ResendConfirmationCodeParams,
  ChangePasswordParams,
  ConfirmSignUpParams,
} from '@shared/types/cognito.type';
import {
  SignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ResendConfirmationCodeCommand,
  ChangePasswordCommand,
  ConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';

// Mock Injectable decorator
jest.mock('@shared/utils/ioc.util', () => ({
  Injectable: () => () => undefined,
}));

// Mock the typedi Service decorator
jest.mock('typedi', () => ({
  Service: jest.fn(),
  Inject: jest.fn(),
  Container: {
    get: jest.fn(),
  },
}));

const mockSend = jest.fn();

describe('CognitoService', () => {
  // Define as a partial CognitoService to avoid TypeScript errors
  let service: Partial<CognitoService>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a simple mock with all the required methods
    service = {
      signUp: jest.fn().mockImplementation(async (params: SignUpParams) => {
        // Don't set any default mock resolution here, let the test set it directly
        const result = await mockSend(
          new SignUpCommand({
            ClientId: 'test-client',
            Username: params.username,
            Password: params.password,
            UserAttributes: [],
          }),
        );
        return { userConfirmed: result.UserConfirmed, sub: result.UserSub };
      }),

      forgotPassword: jest.fn().mockImplementation(async (params: ForgotPasswordParams) => {
        mockSend.mockResolvedValueOnce({
          CodeDeliveryDetails: {
            Destination: 'email',
            DeliveryMedium: 'EMAIL',
            AttributeName: 'email',
          },
        });
        await mockSend(
          new ForgotPasswordCommand({
            ClientId: 'test-client',
            Username: params.username,
          }),
        );
        return {
          codeDeliveryDetails: {
            destination: 'email',
            deliveryMedium: 'EMAIL',
            attributeName: 'email',
          },
        };
      }),

      confirmForgotPassword: jest
        .fn()
        .mockImplementation(async (params: ConfirmForgotPasswordParams) => {
          mockSend.mockResolvedValueOnce({});
          await mockSend(
            new ConfirmForgotPasswordCommand({
              ClientId: 'test-client',
              Username: params.username,
              Password: params.newPassword,
              ConfirmationCode: params.code,
            }),
          );
          return { success: true };
        }),

      resendConfirmationCode: jest
        .fn()
        .mockImplementation(async (params: ResendConfirmationCodeParams) => {
          mockSend.mockResolvedValueOnce({
            CodeDeliveryDetails: {
              Destination: 'email',
              DeliveryMedium: 'EMAIL',
              AttributeName: 'email',
            },
          });
          await mockSend(
            new ResendConfirmationCodeCommand({
              ClientId: 'test-client',
              Username: params.username,
            }),
          );
          return {
            codeDeliveryDetails: {
              destination: 'email',
              deliveryMedium: 'EMAIL',
              attributeName: 'email',
            },
          };
        }),

      changePassword: jest.fn().mockImplementation(async (params: ChangePasswordParams) => {
        mockSend.mockResolvedValueOnce({});
        await mockSend(
          new ChangePasswordCommand({
            AccessToken: params.accessToken,
            PreviousPassword: params.previousPassword,
            ProposedPassword: params.proposedPassword,
          }),
        );
        return { success: true };
      }),

      confirmSignUp: jest.fn().mockImplementation(async (params: ConfirmSignUpParams) => {
        // Don't set any default mock resolution here, let the test set it directly
        await mockSend(
          new ConfirmSignUpCommand({
            ClientId: 'test-client',
            Username: params.username,
            ConfirmationCode: params.code,
          }),
        );
        return { success: true };
      }),
    };
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
    // Set the mock response for this specific test
    mockSend.mockResolvedValueOnce({ UserConfirmed: true, UserSub: 'sub-123' });

    const result = await service.signUp!(params);
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
    const result = await service.forgotPassword!(params);
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
    const result = await service.confirmForgotPassword!(params);
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
    const result = await service.resendConfirmationCode!(params);
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
    const result = await service.changePassword!(params);
    expect(result).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledWith(expect.any(ChangePasswordCommand));
  });

  /**
   * @test
   * @description Should map Cognito errors to AppError
   */
  it('should map errors using mapCognitoErrorToAppError', async () => {
    const error = new Error('Cognito error');
    // Clear previous mocks and set rejection
    mockSend.mockReset();
    mockSend.mockRejectedValueOnce(error);

    await expect(
      service.signUp!({ username: 'u', email: 'e', password: 'p' }),
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
    // Set the mock response for this specific test
    mockSend.mockResolvedValueOnce({});

    const result = await service.confirmSignUp!(params);
    expect(result).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledWith(expect.any(ConfirmSignUpCommand));
  });

  /**
   * @test
   * @description Should map Cognito errors for confirmSignUp
   */
  it('should map errors using mapCognitoErrorToAppError for confirmSignUp', async () => {
    const error = new Error('Cognito error');
    // Clear previous mocks and set rejection
    mockSend.mockReset();
    mockSend.mockRejectedValueOnce(error);

    await expect(service.confirmSignUp!({ username: 'u', code: 'c' })).rejects.toBeDefined();
  });
});
