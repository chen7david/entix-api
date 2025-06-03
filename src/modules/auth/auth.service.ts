import { CognitoUserService } from '@core/services/cognito-user.service';
import { Injectable } from '@core/utils/di.util';
import {
  AuthParams,
  ChangePasswordParams,
  ConfirmForgotPasswordParams,
  ConfirmSignUpParams,
  ForgotPasswordParams,
  GetMeParams,
  RefreshTokenParams,
  ResendConfirmationCodeParams,
  SignUpParams,
} from 'cognito-client';

@Injectable()
export class AuthService {
  constructor(private readonly cognitoUserService: CognitoUserService) {}

  async signUp(signUpParams: SignUpParams) {
    return this.cognitoUserService.signUp(signUpParams);
  }

  async signIn(signInParams: AuthParams) {
    return this.cognitoUserService.signIn(signInParams);
  }

  async refreshToken(refreshTokenParams: RefreshTokenParams) {
    return this.cognitoUserService.refreshToken(refreshTokenParams);
  }

  async getMe(params: GetMeParams) {
    return this.cognitoUserService.getMe(params);
  }

  async confirmSignUp(params: ConfirmSignUpParams) {
    return this.cognitoUserService.confirmSignUp(params);
  }

  async resendConfirmationCode(params: ResendConfirmationCodeParams) {
    return this.cognitoUserService.resendConfirmationCode(params);
  }

  async forgotPassword(params: ForgotPasswordParams) {
    return this.cognitoUserService.forgotPassword(params);
  }

  async confirmForgotPassword(params: ConfirmForgotPasswordParams) {
    return this.cognitoUserService.confirmForgotPassword(params);
  }

  async changePassword(params: ChangePasswordParams) {
    return this.cognitoUserService.changePassword(params);
  }
}
