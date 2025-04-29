import { AuthService } from '@shared/services/auth/auth.service';
import { ConfigService } from '@shared/services/config/config.service';
import type {
  SignUpParams,
  ConfirmForgotPasswordParams,
  ChangePasswordParams,
} from '@shared/types/authentication.type';

const mockSend = jest.fn();

jest.mock('@aws-sdk/client-cognito-identity-provider', () => {
  const actual = jest.requireActual('@aws-sdk/client-cognito-identity-provider');
  return {
    ...actual,
    CognitoIdentityProviderClient: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
  };
});

describe('AuthService', () => {
  let service: AuthService;
  let configService: ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
    configService = {
      get: jest.fn((key: string) => {
        switch (key) {
          case 'COGNITO_REGION':
            return 'us-east-1';
          case 'COGNITO_USER_POOL_ID':
            return 'test-pool-id';
          case 'COGNITO_CLIENT_ID':
            return 'test-client-id';
          default:
            return undefined;
        }
      }),
    } as unknown as ConfigService;
    service = new AuthService(configService);
  });

  describe('signUp', () => {
    const params: SignUpParams = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      attributes: { given_name: 'Test' },
    };
    it('should call Cognito with correct command and return result', async () => {
      const mockResult = { UserSub: 'abc123' };
      mockSend.mockResolvedValueOnce(mockResult);
      const result = await service.signUp(params);
      expect(result).toEqual(mockResult);
      expect(mockSend).toHaveBeenCalled();
    });
    it('should throw a formatted error on Cognito error', async () => {
      mockSend.mockRejectedValueOnce({ name: 'UsernameExistsException', message: 'User exists' });
      await expect(service.signUp(params)).rejects.toThrow('User already exists');
    });
  });

  describe('confirmSignUp', () => {
    it('should call Cognito and return result', async () => {
      mockSend.mockResolvedValueOnce({});
      const result = await service.confirmSignUp('test@example.com', '123456');
      expect(result).toEqual({});
      expect(mockSend).toHaveBeenCalled();
    });
    it('should throw a formatted error on Cognito error', async () => {
      mockSend.mockRejectedValueOnce({ name: 'CodeMismatchException', message: 'Invalid code' });
      await expect(service.confirmSignUp('test@example.com', '123456')).rejects.toThrow(
        'Invalid confirmation code',
      );
    });
  });

  describe('signIn', () => {
    it('should call Cognito and return tokens', async () => {
      const mockTokens = { AuthenticationResult: { AccessToken: 'token' } };
      mockSend.mockResolvedValueOnce(mockTokens);
      const result = await service.signIn('test@example.com', 'Password123!');
      expect(result).toEqual(mockTokens);
      expect(mockSend).toHaveBeenCalled();
    });
    it('should throw a formatted error on Cognito error', async () => {
      mockSend.mockRejectedValueOnce({
        name: 'NotAuthorizedException',
        message: 'Incorrect password',
      });
      await expect(service.signIn('test@example.com', 'Password123!')).rejects.toThrow(
        'Incorrect username or password',
      );
    });
  });

  describe('forgotPassword', () => {
    it('should call Cognito and return result', async () => {
      mockSend.mockResolvedValueOnce({ CodeDeliveryDetails: { Destination: 'email' } });
      const result = await service.forgotPassword('test@example.com');
      expect(result).toEqual({ CodeDeliveryDetails: { Destination: 'email' } });
      expect(mockSend).toHaveBeenCalled();
    });
    it('should throw a formatted error on Cognito error', async () => {
      mockSend.mockRejectedValueOnce({ name: 'UserNotFoundException', message: 'User not found' });
      await expect(service.forgotPassword('test@example.com')).rejects.toThrow('User not found');
    });
  });

  describe('confirmForgotPassword', () => {
    const params: ConfirmForgotPasswordParams = {
      email: 'test@example.com',
      code: '123456',
      newPassword: 'NewPassword123!',
    };
    it('should call Cognito and return result', async () => {
      mockSend.mockResolvedValueOnce({});
      const result = await service.confirmForgotPassword(params);
      expect(result).toEqual({});
      expect(mockSend).toHaveBeenCalled();
    });
    it('should throw a formatted error on Cognito error', async () => {
      mockSend.mockRejectedValueOnce({ name: 'ExpiredCodeException', message: 'Code expired' });
      await expect(service.confirmForgotPassword(params)).rejects.toThrow(
        'Confirmation code expired',
      );
    });
  });

  describe('resendConfirmationCode', () => {
    it('should call Cognito and return result', async () => {
      mockSend.mockResolvedValueOnce({});
      const result = await service.resendConfirmationCode('test@example.com');
      expect(result).toEqual({});
      expect(mockSend).toHaveBeenCalled();
    });
    it('should throw a formatted error on Cognito error', async () => {
      mockSend.mockRejectedValueOnce({ name: 'LimitExceededException', message: 'Limit exceeded' });
      await expect(service.resendConfirmationCode('test@example.com')).rejects.toThrow(
        'Limit exceeded',
      );
    });
  });

  describe('getUser', () => {
    it('should call Cognito and return user data', async () => {
      mockSend.mockResolvedValueOnce({ Username: 'test@example.com' });
      const result = await service.getUser('access-token');
      expect(result).toEqual({ Username: 'test@example.com' });
      expect(mockSend).toHaveBeenCalled();
    });
    it('should throw a formatted error on Cognito error', async () => {
      mockSend.mockRejectedValueOnce({ name: 'NotAuthorizedException', message: 'Token expired' });
      await expect(service.getUser('access-token')).rejects.toThrow(
        'Incorrect username or password',
      );
    });
  });

  describe('updateUserAttributes', () => {
    it('should call Cognito and return result', async () => {
      mockSend.mockResolvedValueOnce({});
      const result = await service.updateUserAttributes('access-token', { given_name: 'Test' });
      expect(result).toEqual({});
      expect(mockSend).toHaveBeenCalled();
    });
    it('should throw a formatted error on Cognito error', async () => {
      mockSend.mockRejectedValueOnce({
        name: 'InvalidParameterException',
        message: 'Invalid attribute',
      });
      await expect(
        service.updateUserAttributes('access-token', { given_name: 'Test' }),
      ).rejects.toThrow('Invalid attribute');
    });
  });

  describe('changePassword', () => {
    const params: ChangePasswordParams = {
      accessToken: 'access-token',
      previousPassword: 'OldPassword123!',
      proposedPassword: 'NewPassword123!',
    };
    it('should call Cognito and return result', async () => {
      mockSend.mockResolvedValueOnce({});
      const result = await service.changePassword(params);
      expect(result).toEqual({});
      expect(mockSend).toHaveBeenCalled();
    });
    it('should throw a formatted error on Cognito error', async () => {
      mockSend.mockRejectedValueOnce({
        name: 'NotAuthorizedException',
        message: 'Incorrect password',
      });
      await expect(service.changePassword(params)).rejects.toThrow(
        'Incorrect username or password',
      );
    });
  });

  describe('signOut', () => {
    it('should call Cognito and return result', async () => {
      mockSend.mockResolvedValueOnce({});
      const result = await service.signOut('access-token');
      expect(result).toEqual({});
      expect(mockSend).toHaveBeenCalled();
    });
    it('should throw a formatted error on Cognito error', async () => {
      mockSend.mockRejectedValueOnce({ name: 'NotAuthorizedException', message: 'Token expired' });
      await expect(service.signOut('access-token')).rejects.toThrow(
        'Incorrect username or password',
      );
    });
  });
});
