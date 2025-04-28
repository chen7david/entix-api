import { JsonController, Post, Body, Put } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Injectable } from '@shared/utils/ioc.util';
import { AuthService } from '@shared/services/auth/auth.service';
import { LoggerService, Logger } from '@shared/services/logger/logger.service';
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

@Injectable()
@JsonController('/api/v1/auth')
@OpenAPI({ summary: 'Authentication and account management endpoints' })
export class AuthController {
  private readonly logger: Logger;

  constructor(
    private readonly authService: AuthService,
    private readonly loggerService: LoggerService,
  ) {
    this.logger = this.loggerService.child({ controller: 'AuthController' });
  }

  /**
   * @OpenApi Sign up a new user
   */
  @Post('/signup')
  @OpenAPI({ summary: 'Sign up a new user' })
  async signUp(@Body() body: SignUpDto) {
    this.logger.info({ email: body.email }, 'Sign up attempt');
    return this.authService.signUp(body);
  }

  /**
   * @OpenApi Confirm user sign up
   */
  @Post('/confirm-signup')
  @OpenAPI({ summary: 'Confirm user sign up' })
  async confirmSignUp(@Body() body: ConfirmSignUpDto) {
    this.logger.info({ email: body.email }, 'Confirm sign up');
    return this.authService.confirmSignUp(body.email, body.code);
  }

  /**
   * @OpenApi Sign in a user
   */
  @Post('/signin')
  @OpenAPI({ summary: 'Sign in a user' })
  async signIn(@Body() body: SignInDto) {
    this.logger.info({ email: body.email }, 'Sign in attempt');
    return this.authService.signIn(body.email, body.password);
  }

  /**
   * @OpenApi Forgot password
   */
  @Post('/forgot-password')
  @OpenAPI({ summary: 'Forgot password' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    this.logger.info({ email: body.email }, 'Forgot password');
    return this.authService.forgotPassword(body.email);
  }

  /**
   * @OpenApi Confirm forgot password
   */
  @Post('/confirm-forgot-password')
  @OpenAPI({ summary: 'Confirm forgot password' })
  async confirmForgotPassword(@Body() body: ConfirmForgotPasswordDto) {
    this.logger.info({ email: body.email }, 'Confirm forgot password');
    return this.authService.confirmForgotPassword(body);
  }

  /**
   * @OpenApi Resend confirmation code
   */
  @Post('/resend-confirmation-code')
  @OpenAPI({ summary: 'Resend confirmation code' })
  async resendConfirmationCode(@Body() body: ResendConfirmationCodeDto) {
    this.logger.info({ email: body.email }, 'Resend confirmation code');
    return this.authService.resendConfirmationCode(body.email);
  }

  /**
   * @OpenApi Get user attributes
   */
  @Post('/get-user')
  @OpenAPI({ summary: 'Get user attributes' })
  async getUser(@Body() body: { accessToken: string }) {
    this.logger.info({ accessToken: body.accessToken }, 'Get user');
    return this.authService.getUser(body.accessToken);
  }

  /**
   * @OpenApi Update user attributes
   */
  @Put('/update-user-attributes')
  @OpenAPI({ summary: 'Update user attributes' })
  async updateUserAttributes(@Body() body: UpdateUserAttributesDto) {
    this.logger.info({ accessToken: body.accessToken }, 'Update user attributes');
    return this.authService.updateUserAttributes(body.accessToken, body.attributes);
  }

  /**
   * @OpenApi Change password
   */
  @Put('/change-password')
  @OpenAPI({ summary: 'Change password' })
  async changePassword(@Body() body: ChangePasswordDto) {
    this.logger.info({ accessToken: body.accessToken }, 'Change password');
    return this.authService.changePassword(body);
  }

  /**
   * @OpenApi Sign out
   */
  @Post('/signout')
  @OpenAPI({ summary: 'Sign out' })
  async signOut(@Body() body: SignOutDto) {
    this.logger.info({ accessToken: body.accessToken }, 'Sign out');
    return this.authService.signOut(body.accessToken);
  }

  /**
   * @OpenApi Refresh token (dummy, as Cognito handles refresh via client SDK)
   */
  @Post('/refresh-token')
  @OpenAPI({ summary: 'Refresh token (handled by Cognito client SDK, not server)' })
  async refreshToken(@Body() body: RefreshTokenDto) {
    this.logger.info({ refreshToken: body.refreshToken }, 'Refresh token');
    // In Cognito, refresh is handled on the client side. This is a placeholder for completeness.
    return { message: 'Token refresh is handled by Cognito client SDK.' };
  }
}
