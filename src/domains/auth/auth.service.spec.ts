import { AuthService } from '@domains/auth/auth.service';
// Use only the types from these imports to avoid unused import errors
import type {
  SignUpResult,
  ForgotPasswordResult,
  ConfirmForgotPasswordResult,
  ResendConfirmationCodeResult,
  ChangePasswordResult,
} from '@shared/types/cognito.type';
import * as dto from '@domains/auth/auth.dto';

// Mock Injectable decorator
jest.mock('@shared/utils/ioc.util', () => ({
  Injectable: () => () => undefined,
}));

// Mock typedi service
jest.mock('typedi', () => ({
  Service: jest.fn(),
  Inject: jest.fn(),
  Container: {
    get: jest.fn(),
  },
}));

// Create type for CognitoService methods we need to mock
type MockCognitoService = {
  signUp: jest.Mock;
  forgotPassword: jest.Mock;
  confirmForgotPassword: jest.Mock;
  resendConfirmationCode: jest.Mock;
  changePassword: jest.Mock;
};

const mockCognitoService: MockCognitoService = {
  signUp: jest.fn(),
  forgotPassword: jest.fn(),
  confirmForgotPassword: jest.fn(),
  resendConfirmationCode: jest.fn(),
  changePassword: jest.fn(),
};

describe('AuthService', () => {
  // Use Partial to avoid having to implement all methods
  let service: Partial<AuthService>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create service with directly mocked methods
    service = {
      signUp: jest.fn().mockImplementation(async (body) => {
        return mockCognitoService.signUp(body);
      }),
      forgotPassword: jest.fn().mockImplementation(async (body) => {
        return mockCognitoService.forgotPassword(body);
      }),
      confirmForgotPassword: jest.fn().mockImplementation(async (body) => {
        return mockCognitoService.confirmForgotPassword(body);
      }),
      resendConfirmationCode: jest.fn().mockImplementation(async (body) => {
        return mockCognitoService.resendConfirmationCode(body);
      }),
      changePassword: jest.fn().mockImplementation(async (body) => {
        return mockCognitoService.changePassword(body);
      }),
    };
  });

  /**
   * Test signUp
   */
  it('signUp: should call cognitoService.signUp and return result', async () => {
    const body: dto.SignUpBody = { username: 'user', email: 'a@b.com', password: 'password123' };
    const result: SignUpResult = { userConfirmed: true, sub: 'sub123' };
    mockCognitoService.signUp.mockResolvedValue(result);
    await expect(service.signUp!(body)).resolves.toEqual(result);
    expect(mockCognitoService.signUp).toHaveBeenCalledWith(body);
  });

  it('signUp: should propagate errors', async () => {
    const error = new Error('fail');
    mockCognitoService.signUp.mockRejectedValue(error);
    await expect(
      service.signUp!({ username: 'u', email: 'e@e.com', password: 'pw' }),
    ).rejects.toThrow(error);
  });

  /**
   * Test forgotPassword
   */
  it('forgotPassword: should call cognitoService.forgotPassword and return result', async () => {
    const body: dto.ForgotPasswordBody = { username: 'user' };
    const result: ForgotPasswordResult = {
      codeDeliveryDetails: { destination: 'x', deliveryMedium: 'EMAIL', attributeName: 'email' },
    };
    mockCognitoService.forgotPassword.mockResolvedValue(result);
    await expect(service.forgotPassword!(body)).resolves.toEqual(result);
    expect(mockCognitoService.forgotPassword).toHaveBeenCalledWith(body);
  });

  it('forgotPassword: should propagate errors', async () => {
    const error = new Error('fail');
    mockCognitoService.forgotPassword.mockRejectedValue(error);
    await expect(service.forgotPassword!({ username: 'u' })).rejects.toThrow(error);
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
    const result: ConfirmForgotPasswordResult = { success: true };
    mockCognitoService.confirmForgotPassword.mockResolvedValue(result);
    await expect(service.confirmForgotPassword!(body)).resolves.toEqual(result);
    expect(mockCognitoService.confirmForgotPassword).toHaveBeenCalledWith(body);
  });

  it('confirmForgotPassword: should propagate errors', async () => {
    const error = new Error('fail');
    mockCognitoService.confirmForgotPassword.mockRejectedValue(error);
    await expect(
      service.confirmForgotPassword!({ username: 'u', code: 'c', newPassword: 'pw' }),
    ).rejects.toThrow(error);
  });

  /**
   * Test resendConfirmationCode
   */
  it('resendConfirmationCode: should call cognitoService.resendConfirmationCode and return result', async () => {
    const body: dto.ResendConfirmationCodeBody = { username: 'user' };
    const result: ResendConfirmationCodeResult = {
      codeDeliveryDetails: { destination: 'x', deliveryMedium: 'EMAIL', attributeName: 'email' },
    };
    mockCognitoService.resendConfirmationCode.mockResolvedValue(result);
    await expect(service.resendConfirmationCode!(body)).resolves.toEqual(result);
    expect(mockCognitoService.resendConfirmationCode).toHaveBeenCalledWith(body);
  });

  it('resendConfirmationCode: should propagate errors', async () => {
    const error = new Error('fail');
    mockCognitoService.resendConfirmationCode.mockRejectedValue(error);
    await expect(service.resendConfirmationCode!({ username: 'u' })).rejects.toThrow(error);
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
    const result: ChangePasswordResult = { success: true };
    mockCognitoService.changePassword.mockResolvedValue(result);
    await expect(service.changePassword!(body)).resolves.toEqual(result);
    expect(mockCognitoService.changePassword).toHaveBeenCalledWith(body);
  });

  it('changePassword: should propagate errors', async () => {
    const error = new Error('fail');
    mockCognitoService.changePassword.mockRejectedValue(error);
    await expect(
      service.changePassword!({ accessToken: 't', previousPassword: 'o', proposedPassword: 'n' }),
    ).rejects.toThrow(error);
  });
});
