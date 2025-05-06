import { AuthService } from '@domains/auth/auth.service';
import type { CognitoService } from '@shared/services/cognito/cognito.service';
import type { LoggerService } from '@shared/services/logger/logger.service';
import * as dto from '@domains/auth/auth.dto';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import { createMockCognitoService } from '@tests/mocks/cognito.service.mock';

describe('AuthService', () => {
  let service: AuthService;
  let mockLogger: jest.Mocked<LoggerService>;
  let mockCognitoService: jest.Mocked<CognitoService>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockCognitoService = createMockCognitoService();

    service = new AuthService(mockCognitoService, mockLogger);
  });

  /**
   * Test signUp
   */
  it('signUp: should call cognitoService.signUp and return result', async () => {
    const body: dto.SignUpBody = { username: 'user', email: 'a@b.com', password: 'password123' };
    const result = await service.signUp(body);

    expect(result).toBeDefined();
    expect(result.sub).toEqual(expect.any(String));
    expect(mockCognitoService.signUp).toHaveBeenCalledWith(body);
  });

  it('signUp: should propagate errors', async () => {
    const error = new Error('Cognito SignUp Failed');
    mockCognitoService.signUp.mockRejectedValue(error);
    await expect(
      service.signUp({ username: 'u', email: 'e@e.com', password: 'pw' }),
    ).rejects.toThrow(error);
  });

  /**
   * Test forgotPassword
   */
  it('forgotPassword: should call cognitoService.forgotPassword and return result', async () => {
    const body: dto.ForgotPasswordBody = { username: 'user' };
    const result = await service.forgotPassword(body);
    expect(result).toEqual({ codeDeliveryDetails: undefined });
    expect(mockCognitoService.forgotPassword).toHaveBeenCalledWith(body);
  });

  it('forgotPassword: should propagate errors', async () => {
    const error = new Error('fail');
    mockCognitoService.forgotPassword.mockRejectedValue(error);
    await expect(service.forgotPassword({ username: 'u' })).rejects.toThrow(error);
  });

  /**
   * Test confirmForgotPassword
   */
  it('confirmForgotPassword: should call cognitoService.confirmForgotPassword and return result', async () => {
    const body: dto.ConfirmForgotPasswordBody = {
      username: 'user',
      code: '123',
      newPassword: 'pw',
    };
    const result = await service.confirmForgotPassword(body);
    expect(result).toEqual({ success: true });
    expect(mockCognitoService.confirmForgotPassword).toHaveBeenCalledWith(body);
  });

  it('confirmForgotPassword: should propagate errors', async () => {
    const error = new Error('fail');
    mockCognitoService.confirmForgotPassword.mockRejectedValue(error);
    await expect(
      service.confirmForgotPassword({ username: 'u', code: 'c', newPassword: 'pw' }),
    ).rejects.toThrow(error);
  });

  /**
   * Test resendConfirmationCode
   */
  it('resendConfirmationCode: should call cognitoService.resendConfirmationCode and return result', async () => {
    const body: dto.ResendConfirmationCodeBody = { username: 'user' };
    const result = await service.resendConfirmationCode(body);
    expect(result).toEqual({ codeDeliveryDetails: undefined });
    expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledWith(body);
  });

  it('resendConfirmationCode: should propagate errors', async () => {
    const error = new Error('fail');
    mockCognitoService.resendConfirmationCode.mockRejectedValue(error);
    await expect(service.resendConfirmationCode({ username: 'u' })).rejects.toThrow(error);
  });

  /**
   * Test changePassword
   */
  it('changePassword: should call cognitoService.changePassword and return result', async () => {
    const body: dto.ChangePasswordBody = {
      accessToken: 'token',
      previousPassword: 'old',
      proposedPassword: 'new',
    };
    const result = await service.changePassword(body);
    expect(result).toEqual({ success: true });
    expect(mockCognitoService.changePassword).toHaveBeenCalledWith(body);
  });

  it('changePassword: should propagate errors', async () => {
    const error = new Error('fail');
    mockCognitoService.changePassword.mockRejectedValue(error);
    await expect(
      service.changePassword({ accessToken: 't', previousPassword: 'o', proposedPassword: 'n' }),
    ).rejects.toThrow(error);
  });
});
