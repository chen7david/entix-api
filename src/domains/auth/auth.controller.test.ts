import 'reflect-metadata';
import { AuthController } from '@domains/auth/auth.controller';
import { LoggerService } from '@shared/services/logger/logger.service';
import { AuthService } from '@domains/auth/auth.service';
import { Container } from 'typedi';
import { AppError } from '@shared/utils/error/error.util';

// Mock AuthService
const mockAuthService = {
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
};

// Mock LoggerService
const mockLogger = {
  component: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up container
    Container.set(AuthService, mockAuthService);
    Container.set(LoggerService, mockLogger);

    // Create controller
    controller = new AuthController(Container.get(AuthService), Container.get(LoggerService));
  });

  describe('signUp', () => {
    it('should call authService.signUp and return the result', async () => {
      const result = { userConfirmed: true, sub: 'sub-123' };
      mockAuthService.signUp.mockResolvedValue(result);

      const body = {
        username: 'validuser',
        email: 'valid@example.com',
        password: 'password12345',
      };

      const response = await controller.signUp(body);

      expect(mockAuthService.signUp).toHaveBeenCalledWith(body);
      expect(response).toEqual(result);
    });

    it('should pass errors to caller', async () => {
      const error = new AppError('Something went wrong');
      mockAuthService.signUp.mockRejectedValue(error);

      const body = {
        username: 'validuser',
        email: 'valid@example.com',
        password: 'password12345',
      };

      await expect(controller.signUp(body)).rejects.toThrow(error);
    });
  });

  describe('confirmSignUp', () => {
    it('should call authService.confirmSignUp and return the result', async () => {
      const result = { success: true };
      mockAuthService.confirmSignUp.mockResolvedValue(result);

      const body = { username: 'validuser', code: '123456' };

      const response = await controller.confirmSignUp(body);

      expect(mockAuthService.confirmSignUp).toHaveBeenCalledWith(body);
      expect(response).toEqual(result);
    });

    it('should pass errors to caller', async () => {
      const error = new AppError('Something went wrong');
      mockAuthService.confirmSignUp.mockRejectedValue(error);

      const body = { username: 'validuser', code: '123456' };

      await expect(controller.confirmSignUp(body)).rejects.toThrow(error);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword and return the result', async () => {
      const result = {
        codeDeliveryDetails: {
          destination: 'test@example.com',
          deliveryMedium: 'EMAIL',
          attributeName: 'email',
        },
      };
      mockAuthService.forgotPassword.mockResolvedValue(result);

      const body = { username: 'validuser' };

      const response = await controller.forgotPassword(body);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(body);
      expect(response).toEqual(result);
    });

    it('should pass errors to caller', async () => {
      const error = new AppError('Something went wrong');
      mockAuthService.forgotPassword.mockRejectedValue(error);

      const body = { username: 'validuser' };

      await expect(controller.forgotPassword(body)).rejects.toThrow(error);
    });
  });

  describe('confirmForgotPassword', () => {
    it('should call authService.confirmForgotPassword and return the result', async () => {
      const result = { success: true };
      mockAuthService.confirmForgotPassword.mockResolvedValue(result);

      const body = {
        username: 'validuser',
        code: '123456',
        newPassword: 'newpassword123',
      };

      const response = await controller.confirmForgotPassword(body);

      expect(mockAuthService.confirmForgotPassword).toHaveBeenCalledWith(body);
      expect(response).toEqual(result);
    });

    it('should pass errors to caller', async () => {
      const error = new AppError('Something went wrong');
      mockAuthService.confirmForgotPassword.mockRejectedValue(error);

      const body = {
        username: 'validuser',
        code: '123456',
        newPassword: 'newpassword123',
      };

      await expect(controller.confirmForgotPassword(body)).rejects.toThrow(error);
    });
  });

  describe('resendConfirmationCode', () => {
    it('should call authService.resendConfirmationCode and return the result', async () => {
      const result = {
        codeDeliveryDetails: {
          destination: 'test@example.com',
          deliveryMedium: 'EMAIL',
          attributeName: 'email',
        },
      };
      mockAuthService.resendConfirmationCode.mockResolvedValue(result);

      const body = { username: 'validuser' };

      const response = await controller.resendConfirmationCode(body);

      expect(mockAuthService.resendConfirmationCode).toHaveBeenCalledWith(body);
      expect(response).toEqual(result);
    });

    it('should pass errors to caller', async () => {
      const error = new AppError('Something went wrong');
      mockAuthService.resendConfirmationCode.mockRejectedValue(error);

      const body = { username: 'validuser' };

      await expect(controller.resendConfirmationCode(body)).rejects.toThrow(error);
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword and return the result', async () => {
      const result = { success: true };
      mockAuthService.changePassword.mockResolvedValue(result);

      const body = {
        accessToken: 'validaccesstoken12345',
        previousPassword: 'previouspassword12345',
        proposedPassword: 'newpassword12345',
      };

      const response = await controller.changePassword(body);

      expect(mockAuthService.changePassword).toHaveBeenCalledWith(body);
      expect(response).toEqual(result);
    });

    it('should pass errors to caller', async () => {
      const error = new AppError('Something went wrong');
      mockAuthService.changePassword.mockRejectedValue(error);

      const body = {
        accessToken: 'validaccesstoken12345',
        previousPassword: 'previouspassword12345',
        proposedPassword: 'newpassword12345',
      };

      await expect(controller.changePassword(body)).rejects.toThrow(error);
    });
  });
});
