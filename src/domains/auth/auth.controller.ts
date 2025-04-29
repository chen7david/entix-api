import { JsonController, Post, Body, Put, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Injectable } from '@shared/utils/ioc.util';
import { AuthService } from '@shared/services/auth/auth.service';
import { LoggerService, Logger } from '@shared/services/logger/logger.service';
import { validateBody } from '@shared/middleware/validation.middleware';
import { z } from 'zod';
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
  type SignUpResponseDto,
  type SignInResponseDto,
  type ConfirmSignUpResponseDto,
  type ForgotPasswordResponseDto,
  type ConfirmForgotPasswordResponseDto,
  type ResendConfirmationCodeResponseDto,
  type GetUserResponseDto,
  type UpdateUserAttributesResponseDto,
  type ChangePasswordResponseDto,
  type SignOutResponseDto,
  type RefreshTokenResponseDto,
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
  @UseBefore(validateBody(SignUpDto))
  @ResponseSchema('SignUpResponseDto')
  async signUp(@Body() body: SignUpDto): Promise<SignUpResponseDto> {
    this.logger.info({ username: body.username, email: body.email }, 'Sign up attempt');
    const result = await this.authService.signUp(body);
    return {
      userId: result.UserSub || '',
      confirmed: !!result.UserConfirmed,
      codeDelivery: result.CodeDeliveryDetails
        ? {
            attribute: result.CodeDeliveryDetails.AttributeName || '',
            medium: result.CodeDeliveryDetails.DeliveryMedium || '',
            destination: result.CodeDeliveryDetails.Destination || '',
          }
        : null,
    };
  }

  /**
   * @OpenApi Confirm user sign up
   */
  @Post('/confirm-signup')
  @OpenAPI({ summary: 'Confirm user sign up' })
  @UseBefore(validateBody(ConfirmSignUpDto))
  @ResponseSchema('ConfirmSignUpResponseDto')
  async confirmSignUp(@Body() body: ConfirmSignUpDto): Promise<ConfirmSignUpResponseDto> {
    this.logger.info({ username: body.username }, 'Confirm sign up');
    await this.authService.confirmSignUp(body.username, body.code);
    return { success: true, message: 'User confirmed' };
  }

  /**
   * @OpenApi Sign in a user
   */
  @Post('/signin')
  @OpenAPI({ summary: 'Sign in a user' })
  @UseBefore(validateBody(SignInDto))
  @ResponseSchema('SignInResponseDto')
  async signIn(@Body() body: SignInDto): Promise<SignInResponseDto> {
    this.logger.info({ email: body.email }, 'Sign in attempt');
    const result = await this.authService.signIn(body.email, body.password);
    const auth = result.AuthenticationResult || {};
    return {
      accessToken: auth.AccessToken || '',
      refreshToken: auth.RefreshToken,
      idToken: auth.IdToken,
      expiresIn: auth.ExpiresIn,
      tokenType: auth.TokenType,
    };
  }

  /**
   * @OpenApi Forgot password
   */
  @Post('/forgot-password')
  @OpenAPI({ summary: 'Forgot password' })
  @UseBefore(validateBody(ForgotPasswordDto))
  @ResponseSchema('ForgotPasswordResponseDto')
  async forgotPassword(@Body() body: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    this.logger.info({ email: body.email }, 'Forgot password');
    const result = await this.authService.forgotPassword(body.email);
    return {
      codeDelivery: result.CodeDeliveryDetails
        ? {
            attribute: result.CodeDeliveryDetails.AttributeName || '',
            medium: result.CodeDeliveryDetails.DeliveryMedium || '',
            destination: result.CodeDeliveryDetails.Destination || '',
          }
        : null,
    };
  }

  /**
   * @OpenApi Confirm forgot password
   */
  @Post('/confirm-forgot-password')
  @OpenAPI({ summary: 'Confirm forgot password' })
  @UseBefore(validateBody(ConfirmForgotPasswordDto))
  @ResponseSchema('ConfirmForgotPasswordResponseDto')
  async confirmForgotPassword(
    @Body() body: ConfirmForgotPasswordDto,
  ): Promise<ConfirmForgotPasswordResponseDto> {
    this.logger.info({ email: body.email }, 'Confirm forgot password');
    await this.authService.confirmForgotPassword(body);
    return { success: true, message: 'Password changed' };
  }

  /**
   * @OpenApi Resend confirmation code
   */
  @Post('/resend-confirmation-code')
  @OpenAPI({ summary: 'Resend confirmation code' })
  @UseBefore(validateBody(ResendConfirmationCodeDto))
  @ResponseSchema('ResendConfirmationCodeResponseDto')
  async resendConfirmationCode(
    @Body() body: ResendConfirmationCodeDto,
  ): Promise<ResendConfirmationCodeResponseDto> {
    this.logger.info({ email: body.email }, 'Resend confirmation code');
    const result = await this.authService.resendConfirmationCode(body.email);
    return {
      codeDelivery: result.CodeDeliveryDetails
        ? {
            attribute: result.CodeDeliveryDetails.AttributeName || '',
            medium: result.CodeDeliveryDetails.DeliveryMedium || '',
            destination: result.CodeDeliveryDetails.Destination || '',
          }
        : null,
    };
  }

  /**
   * @OpenApi Get user attributes
   */
  @Post('/get-user')
  @OpenAPI({ summary: 'Get user attributes' })
  @UseBefore(validateBody(z.object({ accessToken: z.string() })))
  @ResponseSchema('GetUserResponseDto')
  async getUser(@Body() body: { accessToken: string }): Promise<GetUserResponseDto> {
    this.logger.info({ accessToken: body.accessToken }, 'Get user');
    const result = await this.authService.getUser(body.accessToken);
    return {
      username: result.Username || '',
      attributes: (result.UserAttributes || []).reduce(
        (acc, attr) => {
          if (attr.Name && attr.Value) acc[attr.Name] = attr.Value;
          return acc;
        },
        {} as Record<string, string>,
      ),
    };
  }

  /**
   * @OpenApi Update user attributes
   */
  @Put('/update-user-attributes')
  @OpenAPI({ summary: 'Update user attributes' })
  @UseBefore(validateBody(UpdateUserAttributesDto))
  @ResponseSchema('UpdateUserAttributesResponseDto')
  async updateUserAttributes(
    @Body() body: UpdateUserAttributesDto,
  ): Promise<UpdateUserAttributesResponseDto> {
    this.logger.info({ accessToken: body.accessToken }, 'Update user attributes');
    await this.authService.updateUserAttributes(body.accessToken, body.attributes);
    return { success: true, message: 'User attributes updated' };
  }

  /**
   * @OpenApi Change password
   */
  @Put('/change-password')
  @OpenAPI({ summary: 'Change password' })
  @UseBefore(validateBody(ChangePasswordDto))
  @ResponseSchema('ChangePasswordResponseDto')
  async changePassword(@Body() body: ChangePasswordDto): Promise<ChangePasswordResponseDto> {
    this.logger.info({ accessToken: body.accessToken }, 'Change password');
    await this.authService.changePassword(body);
    return { success: true, message: 'Password changed' };
  }

  /**
   * @OpenApi Sign out
   */
  @Post('/signout')
  @OpenAPI({ summary: 'Sign out' })
  @UseBefore(validateBody(SignOutDto))
  @ResponseSchema('SignOutResponseDto')
  async signOut(@Body() body: SignOutDto): Promise<SignOutResponseDto> {
    this.logger.info({ accessToken: body.accessToken }, 'Sign out');
    await this.authService.signOut(body.accessToken);
    return { success: true, message: 'Signed out' };
  }

  /**
   * @OpenApi Refresh token (dummy, as Cognito handles refresh via client SDK)
   */
  @Post('/refresh-token')
  @OpenAPI({ summary: 'Refresh token (handled by Cognito client SDK, not server)' })
  @UseBefore(validateBody(RefreshTokenDto))
  @ResponseSchema('RefreshTokenResponseDto')
  async refreshToken(@Body() body: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    this.logger.info({ refreshToken: body.refreshToken }, 'Refresh token');
    // In Cognito, refresh is handled on the client side. This is a placeholder for completeness.
    return { message: 'Token refresh is handled by Cognito client SDK.' };
  }
}
