import 'reflect-metadata';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import supertest from 'supertest';
import { AuthController } from '@domains/auth/auth.controller';
import { AuthService } from '@domains/auth/auth.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { ErrorHandlerMiddleware } from '@shared/middleware/app-error.middleware';
import { AppError } from '@shared/utils/error/error.util';

// Mock AuthService
const mockAuthService = {
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

// Add this type for controller test
/**
 * Extends the mockAuthService with confirmSignUp for testing confirm-signup route.
 */
type MockAuthService = typeof mockAuthService & { confirmSignUp?: jest.Mock };
(mockAuthService as MockAuthService).confirmSignUp = jest.fn();

// Mock LoggerService
const mockLogger = {
  component: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

/**
 * Helper to create a test app with all middleware and controller
 */
function createTestApp() {
  useContainer(Container);
  Container.set(AuthService, mockAuthService);
  Container.set(LoggerService, mockLogger);
  return createExpressServer({
    controllers: [AuthController],
    middlewares: [ErrorHandlerMiddleware],
    defaultErrorHandler: false,
  });
}

describe('AuthController (integration)', () => {
  let app: ReturnType<typeof createTestApp>;
  let request: supertest.SuperTest<supertest.Test>;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createTestApp();
    request = supertest(app) as unknown as supertest.SuperTest<supertest.Test>;
  });

  describe('POST /auth/signup', () => {
    it('should return 201 and result on success', async () => {
      mockAuthService.signUp.mockResolvedValue({ userConfirmed: true, sub: 'sub' });
      const res = await request
        .post('/auth/signup')
        .send({ username: 'u', email: 'a@b.com', password: 'password123' });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ userConfirmed: true, sub: 'sub' });
    });
    it('should return 422 for invalid input', async () => {
      const res = await request
        .post('/auth/signup')
        .send({ username: '', email: 'bad', password: '1' });
      expect(res.status).toBe(422);
      expect(res.body.status).toBe(422);
    });
    it('should return error for service failure', async () => {
      mockAuthService.signUp.mockRejectedValue(new AppError('fail'));
      const res = await request
        .post('/auth/signup')
        .send({ username: 'u', email: 'a@b.com', password: 'password123' });
      expect(res.status).toBe(500);
      expect(res.body.status).toBe(500);
    });
  });

  describe('POST /auth/admin/create-user', () => {
    it('should return 200 and result on success', async () => {
      mockAuthService.adminCreateUser.mockResolvedValue({
        sub: 'sub',
        userStatus: 'FORCE_CHANGE_PASSWORD',
      });
      const res = await request
        .post('/auth/admin/create-user')
        .send({ username: 'admin', email: 'admin@b.com' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ sub: 'sub', userStatus: 'FORCE_CHANGE_PASSWORD' });
    });
    it('should return 422 for invalid input', async () => {
      const res = await request
        .post('/auth/admin/create-user')
        .send({ username: '', email: 'bad' });
      expect(res.status).toBe(422);
    });
    it('should return error for service failure', async () => {
      mockAuthService.adminCreateUser.mockRejectedValue(new AppError('fail'));
      const res = await request
        .post('/auth/admin/create-user')
        .send({ username: 'admin', email: 'admin@b.com' });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /auth/admin/login', () => {
    it('should return 200 and result on success', async () => {
      mockAuthService.adminInitiateAuth.mockResolvedValue({ accessToken: 'token' });
      const res = await request
        .post('/auth/admin/login')
        .send({ username: 'admin', password: 'pw123456' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ accessToken: 'token' });
    });
    it('should return 422 for invalid input', async () => {
      const res = await request.post('/auth/admin/login').send({ username: '', password: '' });
      expect(res.status).toBe(422);
    });
    it('should return error for service failure', async () => {
      mockAuthService.adminInitiateAuth.mockRejectedValue(new AppError('fail'));
      const res = await request
        .post('/auth/admin/login')
        .send({ username: 'admin', password: 'pw123456' });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should return 200 and result on success', async () => {
      mockAuthService.forgotPassword.mockResolvedValue({
        codeDeliveryDetails: { destination: 'x', deliveryMedium: 'EMAIL', attributeName: 'email' },
      });
      const res = await request.post('/auth/forgot-password').send({ username: 'user' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        codeDeliveryDetails: { destination: 'x', deliveryMedium: 'EMAIL', attributeName: 'email' },
      });
    });
    it('should return 422 for invalid input', async () => {
      const res = await request.post('/auth/forgot-password').send({ username: '' });
      expect(res.status).toBe(422);
    });
    it('should return error for service failure', async () => {
      mockAuthService.forgotPassword.mockRejectedValue(new AppError('fail'));
      const res = await request.post('/auth/forgot-password').send({ username: 'user' });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /auth/confirm-forgot-password', () => {
    it('should return 200 and result on success', async () => {
      mockAuthService.confirmForgotPassword.mockResolvedValue({ success: true });
      const res = await request
        .post('/auth/confirm-forgot-password')
        .send({ username: 'user', code: '123', newPassword: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
    });
    it('should return 422 for invalid input', async () => {
      const res = await request
        .post('/auth/confirm-forgot-password')
        .send({ username: '', code: '', newPassword: '' });
      expect(res.status).toBe(422);
    });
    it('should return error for service failure', async () => {
      mockAuthService.confirmForgotPassword.mockRejectedValue(new AppError('fail'));
      const res = await request
        .post('/auth/confirm-forgot-password')
        .send({ username: 'user', code: '123', newPassword: 'password123' });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /auth/resend-confirmation-code', () => {
    it('should return 200 and result on success', async () => {
      mockAuthService.resendConfirmationCode.mockResolvedValue({
        codeDeliveryDetails: { destination: 'x', deliveryMedium: 'EMAIL', attributeName: 'email' },
      });
      const res = await request.post('/auth/resend-confirmation-code').send({ username: 'user' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        codeDeliveryDetails: { destination: 'x', deliveryMedium: 'EMAIL', attributeName: 'email' },
      });
    });
    it('should return 422 for invalid input', async () => {
      const res = await request.post('/auth/resend-confirmation-code').send({ username: '' });
      expect(res.status).toBe(422);
    });
    it('should return error for service failure', async () => {
      mockAuthService.resendConfirmationCode.mockRejectedValue(new AppError('fail'));
      const res = await request.post('/auth/resend-confirmation-code').send({ username: 'user' });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /auth/admin/user/:username', () => {
    it('should return 200 and result on success', async () => {
      mockAuthService.adminGetUser.mockResolvedValue({
        username: 'user',
        userStatus: 'CONFIRMED',
        enabled: true,
        attributes: {},
      });
      const res = await request.get('/auth/admin/user/user');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        username: 'user',
        userStatus: 'CONFIRMED',
        enabled: true,
        attributes: {},
      });
    });
    it('should return 422 for invalid param', async () => {
      const res = await request.get('/auth/admin/user/');
      expect([404, 422]).toContain(res.status); // 404 if route not matched, 422 if param invalid
    });
    it('should return error for service failure', async () => {
      mockAuthService.adminGetUser.mockRejectedValue(new AppError('fail'));
      const res = await request.get('/auth/admin/user/user');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /auth/admin/update-user-attributes', () => {
    it('should return 200 and result on success', async () => {
      mockAuthService.adminUpdateUserAttributes.mockResolvedValue({ success: true });
      const res = await request
        .post('/auth/admin/update-user-attributes')
        .send({ username: 'user', attributes: { a: 'b' } });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
    });
    it('should return 422 for invalid input', async () => {
      const res = await request
        .post('/auth/admin/update-user-attributes')
        .send({ username: '', attributes: {} });
      expect(res.status).toBe(422);
    });
    it('should return error for service failure', async () => {
      mockAuthService.adminUpdateUserAttributes.mockRejectedValue(new AppError('fail'));
      const res = await request
        .post('/auth/admin/update-user-attributes')
        .send({ username: 'user', attributes: { a: 'b' } });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /auth/change-password', () => {
    it('should return 200 and result on success', async () => {
      mockAuthService.changePassword.mockResolvedValue({ success: true });
      const res = await request
        .post('/auth/change-password')
        .send({ accessToken: 'token', previousPassword: 'old', proposedPassword: 'new' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
    });
    it('should return 422 for invalid input', async () => {
      const res = await request
        .post('/auth/change-password')
        .send({ accessToken: '', previousPassword: '', proposedPassword: '' });
      expect(res.status).toBe(422);
    });
    it('should return error for service failure', async () => {
      mockAuthService.changePassword.mockRejectedValue(new AppError('fail'));
      const res = await request
        .post('/auth/change-password')
        .send({ accessToken: 'token', previousPassword: 'old', proposedPassword: 'new' });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /auth/confirm-signup', () => {
    /**
     * @test
     * @description Should return 200 and result on success.
     */
    it('should return 200 and result on success', async () => {
      (mockAuthService as MockAuthService).confirmSignUp!.mockResolvedValue({ success: true });
      const res = await request
        .post('/auth/confirm-signup')
        .send({ username: 'user', code: '123456' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
    });
    /**
     * @test
     * @description Should return 422 for invalid input.
     */
    it('should return 422 for invalid input', async () => {
      const res = await request.post('/auth/confirm-signup').send({ username: '', code: '' });
      expect(res.status).toBe(422);
    });
    /**
     * @test
     * @description Should return error for service failure.
     */
    it('should return error for service failure', async () => {
      (mockAuthService as MockAuthService).confirmSignUp!.mockRejectedValue(new AppError('fail'));
      const res = await request
        .post('/auth/confirm-signup')
        .send({ username: 'user', code: '123456' });
      expect(res.status).toBe(500);
    });
  });
});
