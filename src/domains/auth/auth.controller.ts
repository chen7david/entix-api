import { JsonController, Post, Body, Get, Param, UseBefore, HttpCode } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { AuthService } from '@domains/auth/auth.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { Logger } from '@shared/types/logger.type';
import {
  signUpBodySchema,
  adminCreateUserBodySchema,
  adminInitiateAuthBodySchema,
  forgotPasswordBodySchema,
  confirmForgotPasswordBodySchema,
  resendConfirmationCodeBodySchema,
  adminGetUserParamsSchema,
  adminUpdateUserAttributesBodySchema,
  changePasswordBodySchema,
  SignUpBody,
  AdminCreateUserBody,
  AdminInitiateAuthBody,
  ForgotPasswordBody,
  ConfirmForgotPasswordBody,
  ResendConfirmationCodeBody,
  AdminUpdateUserAttributesBody,
  ChangePasswordBody,
  confirmSignUpBodySchema,
  signOutBodySchema,
  refreshTokenBodySchema,
  ConfirmSignUpBody,
  SignOutBody,
  RefreshTokenBody,
  loginBodySchema,
  getMeHeadersSchema,
  updateMeBodySchema,
  deleteMeHeadersSchema,
  LoginBody,
  GetMeHeaders,
  UpdateMeBody,
  DeleteMeHeaders,
} from '@domains/auth/auth.dto';
import { validateBody, validateParams } from '@shared/middleware/validation.middleware';
import {
  SignUpResult,
  AdminCreateUserResult,
  AdminInitiateAuthResult,
  ForgotPasswordResult,
  ConfirmForgotPasswordResult,
  ResendConfirmationCodeResult,
  AdminGetUserResult,
  AdminUpdateUserAttributesResult,
  ChangePasswordResult,
  ConfirmSignUpResult,
  SignOutResult,
  RefreshTokenResult,
  LoginResult,
  GetUserResult,
  UpdateUserAttributesResult,
  DeleteUserResult,
} from '@shared/types/cognito.type';
import { Injectable } from '@shared/utils/ioc.util';
/**
 * Controller for authentication and user management endpoints.
 */
@Injectable()
@JsonController('/api/v1/auth')
@OpenAPI({ summary: 'Authentication and user management endpoints' })
export class AuthController {
  private readonly logger: Logger;

  constructor(
    private readonly authService: AuthService,
    private readonly loggerService: LoggerService,
  ) {
    this.logger = this.loggerService.component('AuthController');
  }

  /**
   * Registers a new user.
   */
  @Post('/signup')
  @HttpCode(201)
  @UseBefore(validateBody(signUpBodySchema))
  @OpenAPI({ summary: 'Register a new user' })
  async signUp(@Body() body: SignUpBody): Promise<SignUpResult> {
    this.logger.info('POST /auth/signup', { username: body.username });
    try {
      return await this.authService.signUp(body);
    } catch (err) {
      this.logger.error('Error in signUp', { err });
      throw err;
    }
  }

  /**
   * Creates a new user as admin.
   */
  @Post('/admin/create-user')
  @UseBefore(validateBody(adminCreateUserBodySchema))
  @OpenAPI({ summary: 'Admin creates a new user' })
  async adminCreateUser(@Body() body: AdminCreateUserBody): Promise<AdminCreateUserResult> {
    this.logger.info('POST /auth/admin/create-user', { username: body.username });
    try {
      return await this.authService.adminCreateUser(body);
    } catch (err) {
      this.logger.error('Error in adminCreateUser', { err });
      throw err;
    }
  }

  /**
   * Initiates authentication as admin (login).
   */
  @Post('/admin/login')
  @UseBefore(validateBody(adminInitiateAuthBodySchema))
  @OpenAPI({ summary: 'Admin login' })
  async adminInitiateAuth(@Body() body: AdminInitiateAuthBody): Promise<AdminInitiateAuthResult> {
    this.logger.info('POST /auth/admin/login', { username: body.username });
    try {
      return await this.authService.adminInitiateAuth(body);
    } catch (err) {
      this.logger.error('Error in adminInitiateAuth', { err });
      throw err;
    }
  }

  /**
   * Initiates forgot password flow.
   */
  @Post('/forgot-password')
  @UseBefore(validateBody(forgotPasswordBodySchema))
  @OpenAPI({ summary: 'Forgot password' })
  async forgotPassword(@Body() body: ForgotPasswordBody): Promise<ForgotPasswordResult> {
    this.logger.info('POST /auth/forgot-password', { username: body.username });
    try {
      return await this.authService.forgotPassword(body);
    } catch (err) {
      this.logger.error('Error in forgotPassword', { err });
      throw err;
    }
  }

  /**
   * Confirms a new password using a confirmation code.
   */
  @Post('/confirm-forgot-password')
  @UseBefore(validateBody(confirmForgotPasswordBodySchema))
  @OpenAPI({ summary: 'Confirm forgot password' })
  async confirmForgotPassword(
    @Body() body: ConfirmForgotPasswordBody,
  ): Promise<ConfirmForgotPasswordResult> {
    this.logger.info('POST /auth/confirm-forgot-password', { username: body.username });
    try {
      return await this.authService.confirmForgotPassword(body);
    } catch (err) {
      this.logger.error('Error in confirmForgotPassword', { err });
      throw err;
    }
  }

  /**
   * Resends the confirmation code for user sign-up.
   */
  @Post('/resend-confirmation-code')
  @UseBefore(validateBody(resendConfirmationCodeBodySchema))
  @OpenAPI({ summary: 'Resend confirmation code' })
  async resendConfirmationCode(
    @Body() body: ResendConfirmationCodeBody,
  ): Promise<ResendConfirmationCodeResult> {
    this.logger.info('POST /auth/resend-confirmation-code', { username: body.username });
    try {
      return await this.authService.resendConfirmationCode(body);
    } catch (err) {
      this.logger.error('Error in resendConfirmationCode', { err });
      throw err;
    }
  }

  /**
   * Gets user details as admin.
   */
  @Get('/admin/user/:username')
  @UseBefore(validateParams(adminGetUserParamsSchema))
  @OpenAPI({ summary: 'Admin get user details' })
  async adminGetUser(@Param('username') username: string): Promise<AdminGetUserResult> {
    this.logger.info('GET /auth/admin/user/:username', { username });
    try {
      return await this.authService.adminGetUser({ username });
    } catch (err) {
      this.logger.error('Error in adminGetUser', { err });
      throw err;
    }
  }

  /**
   * Updates user attributes as admin.
   */
  @Post('/admin/update-user-attributes')
  @UseBefore(validateBody(adminUpdateUserAttributesBodySchema))
  @OpenAPI({ summary: 'Admin update user attributes' })
  async adminUpdateUserAttributes(
    @Body() body: AdminUpdateUserAttributesBody,
  ): Promise<AdminUpdateUserAttributesResult> {
    this.logger.info('POST /auth/admin/update-user-attributes', { username: body.username });
    try {
      return await this.authService.adminUpdateUserAttributes(body);
    } catch (err) {
      this.logger.error('Error in adminUpdateUserAttributes', { err });
      throw err;
    }
  }

  /**
   * Changes the password for the currently authenticated user.
   */
  @Post('/change-password')
  @UseBefore(validateBody(changePasswordBodySchema))
  @OpenAPI({ summary: 'Change password' })
  async changePassword(@Body() body: ChangePasswordBody): Promise<ChangePasswordResult> {
    this.logger.info('POST /auth/change-password', { accessToken: body.accessToken });
    try {
      return await this.authService.changePassword(body);
    } catch (err) {
      this.logger.error('Error in changePassword', { err });
      throw err;
    }
  }

  /**
   * Confirms user signup with confirmation code.
   */
  @Post('/confirm-signup')
  @UseBefore(validateBody(confirmSignUpBodySchema))
  @OpenAPI({ summary: 'Confirm user signup' })
  async confirmSignUp(@Body() body: ConfirmSignUpBody): Promise<ConfirmSignUpResult> {
    this.logger.info('POST /auth/confirm-signup', { username: body.username });
    try {
      return await this.authService.confirmSignUp(body);
    } catch (err) {
      this.logger.error('Error in confirmSignUp', { err });
      throw err;
    }
  }

  /**
   * Signs out a user globally (invalidates all tokens).
   */
  @Post('/signout')
  @UseBefore(validateBody(signOutBodySchema))
  @OpenAPI({ summary: 'Sign out user globally' })
  async signOut(@Body() body: SignOutBody): Promise<SignOutResult> {
    this.logger.info('POST /auth/signout');
    try {
      return await this.authService.signOut(body);
    } catch (err) {
      this.logger.error('Error in signOut', { err });
      throw err;
    }
  }

  /**
   * Refreshes tokens using a refresh token.
   */
  @Post('/refresh-token')
  @UseBefore(validateBody(refreshTokenBodySchema))
  @OpenAPI({ summary: 'Refresh tokens using a refresh token' })
  async refreshToken(@Body() body: RefreshTokenBody): Promise<RefreshTokenResult> {
    this.logger.info('POST /auth/refresh-token');
    try {
      return await this.authService.refreshToken(body);
    } catch (err) {
      this.logger.error('Error in refreshToken', { err });
      throw err;
    }
  }

  /**
   * Regular user login (USER_PASSWORD_AUTH).
   */
  @Post('/login')
  @UseBefore(validateBody(loginBodySchema))
  @OpenAPI({ summary: 'User login (USER_PASSWORD_AUTH)' })
  async login(@Body() body: LoginBody): Promise<LoginResult> {
    this.logger.info('POST /auth/login', { username: body.username });
    try {
      return await this.authService.login(body);
    } catch (err) {
      this.logger.error('Error in login', { err });
      throw err;
    }
  }

  /**
   * Get current user info (self-service, by access token).
   */
  @Get('/me')
  @UseBefore(validateBody(getMeHeadersSchema))
  @OpenAPI({ summary: 'Get current user info (requires Authorization header)' })
  async getMe(@Body() headers: GetMeHeaders): Promise<GetUserResult> {
    this.logger.info('GET /auth/me');
    try {
      return await this.authService.getMe(headers);
    } catch (err) {
      this.logger.error('Error in getMe', { err });
      throw err;
    }
  }

  /**
   * Update current user attributes (self-service).
   */
  @Post('/me')
  @UseBefore(validateBody(getMeHeadersSchema))
  @UseBefore(validateBody(updateMeBodySchema))
  @OpenAPI({ summary: 'Update current user attributes (requires Authorization header)' })
  async updateMe(
    @Body() headers: GetMeHeaders,
    @Body() body: UpdateMeBody,
  ): Promise<UpdateUserAttributesResult> {
    this.logger.info('PUT /auth/me');
    try {
      return await this.authService.updateMe(headers, body);
    } catch (err) {
      this.logger.error('Error in updateMe', { err });
      throw err;
    }
  }

  /**
   * Delete current user (self-service).
   */
  @Post('/me/delete')
  @UseBefore(validateBody(deleteMeHeadersSchema))
  @OpenAPI({ summary: 'Delete current user (requires Authorization header)' })
  async deleteMe(@Body() headers: DeleteMeHeaders): Promise<DeleteUserResult> {
    this.logger.info('DELETE /auth/me');
    try {
      return await this.authService.deleteMe(headers);
    } catch (err) {
      this.logger.error('Error in deleteMe', { err });
      throw err;
    }
  }
}
