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
} from '@shared/types/cognito.type';

/**
 * Controller for authentication and user management endpoints.
 */
@JsonController('/auth')
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
}
