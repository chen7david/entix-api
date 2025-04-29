import { AuthService } from '@domains/auth/auth.service';
import { CognitoService } from '@shared/services/cognito/cognito.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import * as cognitoTypes from '@shared/types/cognito.type';
import * as dto from '@domains/auth/auth.dto';

const mockLogger = {
  component: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
};

const mockCognitoService = {
  signUp: jest.fn(),
  adminCreateUser: jest.fn(),
  adminInitiateAuth: jest.fn(),
  forgotPassword: jest.fn(),
  confirmForgotPassword: jest.fn(),
  resendConfirmationCode: jest.fn(),
  adminGetUser: jest.fn(),
  adminUpdateUserAttributes: jest.fn(),
  changePassword: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      mockCognitoService as unknown as CognitoService,
      mockLogger as unknown as LoggerService,
    );
  });

  /**
   * Test signUp
   */
  it('signUp: should call cognitoService.signUp and return result', async () => {
    const body: dto.SignUpBody = { username: 'user', email: 'a@b.com', password: 'password123' };
    const result: cognitoTypes.SignUpResult = { userConfirmed: true, sub: 'sub123' };
    mockCognitoService.signUp.mockResolvedValue(result);
    await expect(service.signUp(body)).resolves.toEqual(result);
    expect(mockCognitoService.signUp).toHaveBeenCalledWith(body);
  });

  it('signUp: should propagate errors', async () => {
    const error = new Error('fail');
    mockCognitoService.signUp.mockRejectedValue(error);
    await expect(
      service.signUp({ username: 'u', email: 'e@e.com', password: 'pw' }),
    ).rejects.toThrow(error);
  });

  /**
   * Test adminCreateUser
   */
  it('adminCreateUser: should call cognitoService.adminCreateUser and return result', async () => {
    const body: dto.AdminCreateUserBody = { username: 'admin', email: 'admin@b.com' };
    const result: cognitoTypes.AdminCreateUserResult = {
      sub: 'sub',
      userStatus: 'FORCE_CHANGE_PASSWORD',
    };
    mockCognitoService.adminCreateUser.mockResolvedValue(result);
    await expect(service.adminCreateUser(body)).resolves.toEqual(result);
    expect(mockCognitoService.adminCreateUser).toHaveBeenCalledWith(body);
  });

  it('adminCreateUser: should propagate errors', async () => {
    const error = new Error('fail');
    mockCognitoService.adminCreateUser.mockRejectedValue(error);
    await expect(service.adminCreateUser({ username: 'a', email: 'a@a.com' })).rejects.toThrow(
      error,
    );
  });

  /**
   * Test adminInitiateAuth
   */
  it('adminInitiateAuth: should call cognitoService.adminInitiateAuth and return result', async () => {
    const body: dto.AdminInitiateAuthBody = { username: 'admin', password: 'pw' };
    const result: cognitoTypes.AdminInitiateAuthResult = { accessToken: 'token' };
    mockCognitoService.adminInitiateAuth.mockResolvedValue(result);
    await expect(service.adminInitiateAuth(body)).resolves.toEqual(result);
    expect(mockCognitoService.adminInitiateAuth).toHaveBeenCalledWith(body);
  });

  it('adminInitiateAuth: should propagate errors', async () => {
    const error = new Error('fail');
    mockCognitoService.adminInitiateAuth.mockRejectedValue(error);
    await expect(service.adminInitiateAuth({ username: 'a', password: 'pw' })).rejects.toThrow(
      error,
    );
  });

  /**
   * Test forgotPassword
   */
  it('forgotPassword: should call cognitoService.forgotPassword and return result', async () => {
    const body: dto.ForgotPasswordBody = { username: 'user' };
    const result: cognitoTypes.ForgotPasswordResult = {
      codeDeliveryDetails: { destination: 'x', deliveryMedium: 'EMAIL', attributeName: 'email' },
    };
    mockCognitoService.forgotPassword.mockResolvedValue(result);
    await expect(service.forgotPassword(body)).resolves.toEqual(result);
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
    const result: cognitoTypes.ConfirmForgotPasswordResult = { success: true };
    mockCognitoService.confirmForgotPassword.mockResolvedValue(result);
    await expect(service.confirmForgotPassword(body)).resolves.toEqual(result);
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
    const result: cognitoTypes.ResendConfirmationCodeResult = {
      codeDeliveryDetails: { destination: 'x', deliveryMedium: 'EMAIL', attributeName: 'email' },
    };
    mockCognitoService.resendConfirmationCode.mockResolvedValue(result);
    await expect(service.resendConfirmationCode(body)).resolves.toEqual(result);
    expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledWith(body);
  });

  it('resendConfirmationCode: should propagate errors', async () => {
    const error = new Error('fail');
    mockCognitoService.resendConfirmationCode.mockRejectedValue(error);
    await expect(service.resendConfirmationCode({ username: 'u' })).rejects.toThrow(error);
  });

  /**
   * Test adminGetUser
   */
  it('adminGetUser: should call cognitoService.adminGetUser and return result', async () => {
    const params: dto.AdminGetUserParams = { username: 'user' };
    const result: cognitoTypes.AdminGetUserResult = {
      username: 'user',
      userStatus: 'CONFIRMED',
      enabled: true,
      attributes: {},
    };
    mockCognitoService.adminGetUser.mockResolvedValue(result);
    await expect(service.adminGetUser(params)).resolves.toEqual(result);
    expect(mockCognitoService.adminGetUser).toHaveBeenCalledWith(params);
  });

  it('adminGetUser: should propagate errors', async () => {
    const error = new Error('fail');
    mockCognitoService.adminGetUser.mockRejectedValue(error);
    await expect(service.adminGetUser({ username: 'u' })).rejects.toThrow(error);
  });

  /**
   * Test adminUpdateUserAttributes
   */
  it('adminUpdateUserAttributes: should call cognitoService.adminUpdateUserAttributes and return result', async () => {
    const body: dto.AdminUpdateUserAttributesBody = { username: 'user', attributes: { a: 'b' } };
    const result: cognitoTypes.AdminUpdateUserAttributesResult = { success: true };
    mockCognitoService.adminUpdateUserAttributes.mockResolvedValue(result);
    await expect(service.adminUpdateUserAttributes(body)).resolves.toEqual(result);
    expect(mockCognitoService.adminUpdateUserAttributes).toHaveBeenCalledWith(body);
  });

  it('adminUpdateUserAttributes: should propagate errors', async () => {
    const error = new Error('fail');
    mockCognitoService.adminUpdateUserAttributes.mockRejectedValue(error);
    await expect(
      service.adminUpdateUserAttributes({ username: 'u', attributes: {} }),
    ).rejects.toThrow(error);
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
    const result: cognitoTypes.ChangePasswordResult = { success: true };
    mockCognitoService.changePassword.mockResolvedValue(result);
    await expect(service.changePassword(body)).resolves.toEqual(result);
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
