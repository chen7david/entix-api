import { CognitoUserClientToken } from '@core/constants/di-tokens.constant';
import { Injectable, Inject } from '@core/utils/di.util';
import {
  CognitoUserClient,
  AuthParams,
  SignUpParams,
  RefreshTokenParams,
  GetMeParams,
  ConfirmSignUpParams,
  ResendConfirmationCodeParams,
  ForgotPasswordParams,
  ConfirmForgotPasswordParams,
  ChangePasswordParams,
} from 'cognito-client';

@Injectable()
export class CognitoUserService {
  constructor(
    @Inject(CognitoUserClientToken) private readonly cognitoUserClient: CognitoUserClient,
  ) {}

  async signUp(signupParams: SignUpParams) {
    const user = await this.cognitoUserClient.signUp(signupParams);
    return user;
  }

  async signIn(signInParams: AuthParams) {
    const user = await this.cognitoUserClient.signIn(signInParams);
    return user;
  }

  async refreshToken(refreshTokenParams: RefreshTokenParams) {
    const user = await this.cognitoUserClient.refreshToken(refreshTokenParams);
    return user;
  }

  async getMe(params: GetMeParams) {
    const user = await this.cognitoUserClient.getMe(params);
    return user;
  }

  async confirmSignUp(params: ConfirmSignUpParams) {
    const succes = await this.cognitoUserClient.confirmSignUp(params);
    return succes;
  }

  async resendConfirmationCode(params: ResendConfirmationCodeParams) {
    const succes = await this.cognitoUserClient.resendConfirmationCode(params);
    return succes;
  }

  async forgotPassword(params: ForgotPasswordParams) {
    const succes = await this.cognitoUserClient.forgotPassword(params);
    return succes;
  }

  async confirmForgotPassword(params: ConfirmForgotPasswordParams) {
    const succes = await this.cognitoUserClient.confirmForgotPassword(params);
    return succes;
  }

  async changePassword(params: ChangePasswordParams) {
    const succes = await this.cognitoUserClient.changePassword(params);
    return succes;
  }
}
