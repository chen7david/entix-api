import { Injectable } from '@shared/utils/ioc.util';
import { LoggerService } from '@shared/services/logger/logger.service';
import { CognitoService } from '@shared/services/cognito/cognito.service';
import { UserService } from '@domains/user/user.service';
import {
  SignUpBody,
  ForgotPasswordBody,
  ConfirmForgotPasswordBody,
  ResendConfirmationCodeBody,
  ChangePasswordBody,
  ConfirmSignUpBody,
  SignOutBody,
  RefreshTokenBody,
  SigninBody,
  GetMeHeaders,
  UpdateMeBody,
  DeleteMeHeaders,
} from '@domains/auth/auth.dto';
import {
  SignUpResult,
  ForgotPasswordResult,
  ConfirmForgotPasswordResult,
  ResendConfirmationCodeResult,
  ChangePasswordResult,
  ConfirmSignUpResult,
  SignOutResult,
  RefreshTokenResult,
  LoginResult,
  GetUserResult,
  UpdateUserAttributesResult,
  DeleteUserResult,
} from '@shared/types/cognito.type';
import { Logger } from '@shared/types/logger.type';
import { CreateUserDto } from '@domains/user/user.dto';

/**
 * Service for authentication and user management using AWS Cognito.
 */
@Injectable()
export class AuthService {
  private readonly logger: Logger;

  // eslint-disable-next-line max-params
  constructor(
    private readonly cognitoService: CognitoService,
    private readonly loggerService: LoggerService,
    private readonly userService: UserService,
  ) {
    this.logger = this.loggerService.component('AuthService');
  }

  /**
   * Registers a new user by creating them in Cognito and the local database via UserService.
   * @param body - The signup data including username, email, password, and optional attributes.
   * @returns A promise resolving to the signup result including user confirmation status and Cognito sub.
   */
  async signUp(body: SignUpBody): Promise<SignUpResult> {
    this.logger.info('AuthService signUp called', { username: body.username });

    const createUserDto: CreateUserDto = {
      username: body.username,
      email: body.email,
      password: body.password,
      attributes: body.attributes,
    };

    const { cognitoUserConfirmed, cognitoSub } = await this.userService.create(createUserDto);

    return {
      userConfirmed: cognitoUserConfirmed,
      sub: cognitoSub,
    };
  }

  /**
   * Initiates forgot password flow.
   */
  async forgotPassword(body: ForgotPasswordBody): Promise<ForgotPasswordResult> {
    this.logger.info('forgotPassword called', { username: body.username });
    return this.cognitoService.forgotPassword(body);
  }

  /**
   * Confirms a new password using a confirmation code.
   */
  async confirmForgotPassword(
    body: ConfirmForgotPasswordBody,
  ): Promise<ConfirmForgotPasswordResult> {
    this.logger.info('confirmForgotPassword called', { username: body.username });
    return this.cognitoService.confirmForgotPassword(body);
  }

  /**
   * Resends the confirmation code for user sign-up.
   */
  async resendConfirmationCode(
    body: ResendConfirmationCodeBody,
  ): Promise<ResendConfirmationCodeResult> {
    this.logger.info('resendConfirmationCode called', { username: body.username });
    return this.cognitoService.resendConfirmationCode(body);
  }

  /**
   * Changes the password for the currently authenticated user.
   */
  async changePassword(body: ChangePasswordBody): Promise<ChangePasswordResult> {
    this.logger.info('changePassword called', { accessToken: body.accessToken });
    return this.cognitoService.changePassword(body);
  }

  /**
   * Confirms user signup with confirmation code.
   */
  async confirmSignUp(body: ConfirmSignUpBody): Promise<ConfirmSignUpResult> {
    this.logger.info('confirmSignUp called', { username: body.username });
    return this.cognitoService.confirmSignUp(body);
  }

  /**
   * Signs out a user globally (invalidates all tokens).
   */
  async signOut(body: SignOutBody): Promise<SignOutResult> {
    this.logger.info('signOut called');
    return this.cognitoService.signOut(body);
  }

  /**
   * Refreshes tokens using a refresh token.
   */
  async refreshToken(body: RefreshTokenBody): Promise<RefreshTokenResult> {
    this.logger.info('refreshToken called');
    return this.cognitoService.refreshToken(body);
  }

  /**
   * Regular user signin (USER_PASSWORD_AUTH).
   */
  async signin(body: SigninBody): Promise<LoginResult> {
    this.logger.info('signin called', { username: body.username });
    return this.cognitoService.signin(body);
  }

  /**
   * Get current user info (self-service, by access token).
   */
  async getMe(headers: GetMeHeaders): Promise<GetUserResult> {
    this.logger.info('getMe called');
    const accessToken = extractAccessToken(headers.authorization);
    return this.cognitoService.getUser({ accessToken });
  }

  /**
   * Update current user attributes (self-service).
   */
  async updateMe(headers: GetMeHeaders, body: UpdateMeBody): Promise<UpdateUserAttributesResult> {
    this.logger.info('updateMe called');
    const accessToken = extractAccessToken(headers.authorization);
    return this.cognitoService.updateUserAttributes({ accessToken, attributes: body.attributes });
  }

  /**
   * Delete current user (self-service).
   */
  async deleteMe(headers: DeleteMeHeaders): Promise<DeleteUserResult> {
    this.logger.info('deleteMe called');
    const accessToken = extractAccessToken(headers.authorization);
    return this.cognitoService.deleteUser({ accessToken });
  }
}

// Helper to extract Bearer token
function extractAccessToken(authHeader: string): string {
  if (!authHeader) return '';
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7);
  return authHeader;
}
