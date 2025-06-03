import { Injectable } from '@core/utils/di.util';
import { Body, Get, HeaderParams, JsonController, Post, UseBefore } from 'routing-controllers';
import { AuthService } from '@modules/auth/auth.service';
import {
  ConfirmSignUpDto,
  ConfirmForgotPasswordDto,
  ForgotPasswordDto,
  GetMeDto,
  RefreshTokenDto,
  ResendConfirmationCodeDto,
  SignInDto,
  SignUpDto,
  ChangePasswordDto,
} from '@modules/auth/auth.dto';
import { validateBody, validateHeaders } from '@core/middleware/validation.middleware';

@Injectable()
@JsonController('/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signin')
  @UseBefore(validateBody(SignInDto))
  async signIn(@Body() signInParams: SignInDto) {
    return this.authService.signIn({
      username: signInParams.username,
      password: signInParams.password,
    });
  }

  @Post('/signup')
  @UseBefore(validateBody(SignUpDto))
  async signUp(@Body() signUpParams: SignUpDto) {
    return this.authService.signUp({
      username: signUpParams.username,
      password: signUpParams.password,
      email: signUpParams.email,
    });
  }

  @Post('/refresh-token')
  @UseBefore(validateBody(RefreshTokenDto))
  async refreshToken(@Body() refreshTokenParams: RefreshTokenDto) {
    return this.authService.refreshToken({
      refreshToken: refreshTokenParams.refreshToken,
    });
  }

  @Get('/me')
  @UseBefore(validateHeaders(GetMeDto))
  async getMe(@HeaderParams() headers: GetMeDto) {
    return this.authService.getMe(headers);
  }

  @Post('/confirm-signup')
  @UseBefore(validateBody(ConfirmSignUpDto))
  async confirmSignup(@Body() confirmSignupParams: ConfirmSignUpDto) {
    return this.authService.confirmSignUp(confirmSignupParams);
  }

  @Post('/resend-confirmation-code')
  @UseBefore(validateBody(ResendConfirmationCodeDto))
  async resendConfirmationCode(@Body() resendConfirmationCodeParams: ResendConfirmationCodeDto) {
    return this.authService.resendConfirmationCode(resendConfirmationCodeParams);
  }

  @Post('/forgot-password')
  @UseBefore(validateBody(ForgotPasswordDto))
  async forgotPassword(@Body() forgotPasswordParams: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordParams);
  }

  @Post('/confirm-forgot-password')
  @UseBefore(validateBody(ConfirmForgotPasswordDto))
  async confirmForgotPassword(@Body() confirmForgotPasswordParams: ConfirmForgotPasswordDto) {
    return this.authService.confirmForgotPassword(confirmForgotPasswordParams);
  }

  @Post('/change-password')
  @UseBefore(validateBody(ChangePasswordDto))
  async changePassword(
    @Body() changePasswordParams: ChangePasswordDto,
    @HeaderParams() headers: GetMeDto,
  ) {
    return this.authService.changePassword({
      ...changePasswordParams,
      accessToken: headers.authorization,
    });
  }
}
