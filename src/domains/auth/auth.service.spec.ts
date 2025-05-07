import { AuthService } from '@domains/auth/auth.service';
import type { CognitoService } from '@shared/services/cognito/cognito.service';
import type { LoggerService } from '@shared/services/logger/logger.service';
import type { UserService } from '@domains/user/user.service';
import type { CreateUserDto, CreateUserResultType } from '@domains/user/user.dto';
import * as dto from '@domains/auth/auth.dto';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import { createMockCognitoService } from '@tests/mocks/cognito.service.mock';
import { faker } from '@faker-js/faker';

describe('AuthService', () => {
  let service: AuthService;
  let mockLogger: jest.Mocked<LoggerService>;
  let mockCognitoService: jest.Mocked<CognitoService>;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockCognitoService = createMockCognitoService();
    mockUserService = {
      create: jest.fn(),
    } as unknown as jest.Mocked<UserService>;
    service = new AuthService(mockCognitoService, mockLogger, mockUserService);
  });

  // New tests for the refactored signUp method
  describe('signUp', () => {
    const signUpBody: dto.SignUpBody = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      attributes: { 'custom:city': 'TestCity' },
    };
    const expectedCreateUserDto: CreateUserDto = {
      username: signUpBody.username,
      email: signUpBody.email,
      password: signUpBody.password,
      attributes: signUpBody.attributes,
    };
    const mockUserServiceResult: CreateUserResultType = {
      user: {
        id: faker.string.uuid(),
        email: signUpBody.email,
        username: signUpBody.username,
        cognito_sub: faker.string.uuid(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        password: null,
        deletedAt: null,
      },
      cognitoUserConfirmed: false,
      cognitoSub: faker.string.uuid(),
    };

    it('should call userService.create with mapped DTO and return mapped SignUpResult', async () => {
      mockUserService.create.mockResolvedValue(mockUserServiceResult);
      const result = await service.signUp(signUpBody);
      expect(mockUserService.create).toHaveBeenCalledWith(expectedCreateUserDto);
      expect(result).toEqual({
        userConfirmed: mockUserServiceResult.cognitoUserConfirmed,
        sub: mockUserServiceResult.cognitoSub,
      });
      expect(mockCognitoService.signUp).not.toHaveBeenCalled();
    });

    it('should propagate errors from userService.create', async () => {
      const error = new Error('UserService Create Failed');
      mockUserService.create.mockRejectedValue(error);
      await expect(service.signUp(signUpBody)).rejects.toThrow(error);
    });
  }); // End of describe('signUp')

  // **** OLD signUp tests are explicitly NOT HERE ****

  /**
   * Test forgotPassword
   */
  it('forgotPassword: should call cognitoService.forgotPassword and return result', async () => {
    const body: dto.ForgotPasswordBody = { username: 'user' };
    mockCognitoService.forgotPassword.mockResolvedValue({ codeDeliveryDetails: undefined });
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
    mockCognitoService.confirmForgotPassword.mockResolvedValue({ success: true });
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
    mockCognitoService.resendConfirmationCode.mockResolvedValue({ codeDeliveryDetails: undefined });
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
    mockCognitoService.changePassword.mockResolvedValue({ success: true });
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

  // Tests for confirmSignUp, signOut, refreshToken, login, getMe, updateMe, deleteMe would follow a similar pattern,
  // using mockCognitoService directly as AuthService delegates to it for these.
}); // End of describe('AuthService')
