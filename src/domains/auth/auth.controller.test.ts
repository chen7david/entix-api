import 'reflect-metadata';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import request from 'supertest';
import { AuthController } from '@domains/auth/auth.controller';
import { AuthService } from '@shared/services/auth/auth.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import {
  SignUpDto,
  ConfirmSignUpDto,
  SignInDto,
  ForgotPasswordDto,
  ConfirmForgotPasswordDto,
  ResendConfirmationCodeDto,
  UpdateUserAttributesDto,
  ChangePasswordDto,
  SignOutDto,
  RefreshTokenDto,
} from '@domains/auth/auth.dto';
import {
  SignUpCommandOutput,
  ConfirmSignUpCommandOutput,
  InitiateAuthCommandOutput,
  ForgotPasswordCommandOutput,
  ConfirmForgotPasswordCommandOutput,
  ResendConfirmationCodeCommandOutput,
  GetUserCommandOutput,
  UpdateUserAttributesCommandOutput,
  ChangePasswordCommandOutput,
  GlobalSignOutCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';

describe('AuthController', () => {
  let app: any;
  let authService: jest.Mocked<AuthService>;
  let loggerService: jest.Mocked<LoggerService>;

  beforeAll(() => {
    useContainer(Container);
    authService = {
      signUp: jest.fn(),
      confirmSignUp: jest.fn(),
      signIn: jest.fn(),
      forgotPassword: jest.fn(),
      confirmForgotPassword: jest.fn(),
      resendConfirmationCode: jest.fn(),
      getUser: jest.fn(),
      updateUserAttributes: jest.fn(),
      changePassword: jest.fn(),
      signOut: jest.fn(),
    } as any;
    loggerService = {
      child: jest.fn().mockReturnValue({ info: jest.fn() }),
    } as any;
    Container.set(AuthService, authService);
    Container.set(LoggerService, loggerService);
    app = createExpressServer({
      controllers: [AuthController],
      validation: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/v1/auth/signup - success', async () => {
    authService.signUp.mockResolvedValue({ $metadata: {}, UserSub: 'abc' } as SignUpCommandOutput);
    const body: SignUpDto = { email: 'test@example.com', password: 'Password123!' };
    const res = await request(app).post('/api/v1/auth/signup').send(body);
    expect(res.status).toBe(200);
    expect(authService.signUp).toHaveBeenCalledWith(body);
  });

  it('POST /api/v1/auth/signup - error', async () => {
    authService.signUp.mockRejectedValue(new Error('fail'));
    const body: SignUpDto = { email: 'test@example.com', password: 'Password123!' };
    const res = await request(app).post('/api/v1/auth/signup').send(body);
    expect(res.status).toBe(500);
  });

  it('POST /api/v1/auth/confirm-signup', async () => {
    authService.confirmSignUp.mockResolvedValue({ $metadata: {} } as ConfirmSignUpCommandOutput);
    const body: ConfirmSignUpDto = { email: 'test@example.com', code: '123456' };
    const res = await request(app).post('/api/v1/auth/confirm-signup').send(body);
    expect(res.status).toBe(200);
    expect(authService.confirmSignUp).toHaveBeenCalledWith(body.email, body.code);
  });

  it('POST /api/v1/auth/signin', async () => {
    authService.signIn.mockResolvedValue({
      $metadata: {},
      AuthenticationResult: { AccessToken: 'jwt' },
    } as InitiateAuthCommandOutput);
    const body: SignInDto = { email: 'test@example.com', password: 'Password123!' };
    const res = await request(app).post('/api/v1/auth/signin').send(body);
    expect(res.status).toBe(200);
    expect(authService.signIn).toHaveBeenCalledWith(body.email, body.password);
  });

  it('POST /api/v1/auth/forgot-password', async () => {
    authService.forgotPassword.mockResolvedValue({ $metadata: {} } as ForgotPasswordCommandOutput);
    const body: ForgotPasswordDto = { email: 'test@example.com' };
    const res = await request(app).post('/api/v1/auth/forgot-password').send(body);
    expect(res.status).toBe(200);
    expect(authService.forgotPassword).toHaveBeenCalledWith(body.email);
  });

  it('POST /api/v1/auth/confirm-forgot-password', async () => {
    authService.confirmForgotPassword.mockResolvedValue({
      $metadata: {},
    } as ConfirmForgotPasswordCommandOutput);
    const body: ConfirmForgotPasswordDto = {
      email: 'test@example.com',
      code: '123456',
      newPassword: 'Password123!',
    };
    const res = await request(app).post('/api/v1/auth/confirm-forgot-password').send(body);
    expect(res.status).toBe(200);
    expect(authService.confirmForgotPassword).toHaveBeenCalledWith(body);
  });

  it('POST /api/v1/auth/resend-confirmation-code', async () => {
    authService.resendConfirmationCode.mockResolvedValue({
      $metadata: {},
    } as ResendConfirmationCodeCommandOutput);
    const body: ResendConfirmationCodeDto = { email: 'test@example.com' };
    const res = await request(app).post('/api/v1/auth/resend-confirmation-code').send(body);
    expect(res.status).toBe(200);
    expect(authService.resendConfirmationCode).toHaveBeenCalledWith(body.email);
  });

  it('POST /api/v1/auth/get-user', async () => {
    authService.getUser.mockResolvedValue({ $metadata: {} } as GetUserCommandOutput);
    const body = { accessToken: 'token' };
    const res = await request(app).post('/api/v1/auth/get-user').send(body);
    expect(res.status).toBe(200);
    expect(authService.getUser).toHaveBeenCalledWith(body.accessToken);
  });

  it('PUT /api/v1/auth/update-user-attributes', async () => {
    authService.updateUserAttributes.mockResolvedValue({
      $metadata: {},
    } as UpdateUserAttributesCommandOutput);
    const body: UpdateUserAttributesDto = { accessToken: 'token', attributes: { foo: 'bar' } };
    const res = await request(app).put('/api/v1/auth/update-user-attributes').send(body);
    expect(res.status).toBe(200);
    expect(authService.updateUserAttributes).toHaveBeenCalledWith(
      body.accessToken,
      body.attributes,
    );
  });

  it('PUT /api/v1/auth/change-password', async () => {
    authService.changePassword.mockResolvedValue({ $metadata: {} } as ChangePasswordCommandOutput);
    const body: ChangePasswordDto = {
      accessToken: 'token',
      previousPassword: 'old',
      proposedPassword: 'new',
    };
    const res = await request(app).put('/api/v1/auth/change-password').send(body);
    expect(res.status).toBe(200);
    expect(authService.changePassword).toHaveBeenCalledWith(body);
  });

  it('POST /api/v1/auth/signout', async () => {
    authService.signOut.mockResolvedValue({ $metadata: {} } as GlobalSignOutCommandOutput);
    const body: SignOutDto = { accessToken: 'token' };
    const res = await request(app).post('/api/v1/auth/signout').send(body);
    expect(res.status).toBe(200);
    expect(authService.signOut).toHaveBeenCalledWith(body.accessToken);
  });

  it('POST /api/v1/auth/refresh-token', async () => {
    const body: RefreshTokenDto = { refreshToken: 'refresh' };
    const res = await request(app).post('/api/v1/auth/refresh-token').send(body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
