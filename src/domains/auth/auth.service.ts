import { Injectable } from '@shared/utils/ioc.util';
import { LoggerService } from '@shared/services/logger/logger.service';
import { CognitoService } from '@shared/services/cognito/cognito.service';
import {
  SignUpBody,
  AdminCreateUserBody,
  AdminInitiateAuthBody,
  ForgotPasswordBody,
  ConfirmForgotPasswordBody,
  ResendConfirmationCodeBody,
  AdminGetUserParams,
  AdminUpdateUserAttributesBody,
  ChangePasswordBody,
  ConfirmSignUpBody,
  SignOutBody,
  RefreshTokenBody,
  LoginBody,
  GetMeHeaders,
  UpdateMeBody,
  DeleteMeHeaders,
} from '@domains/auth/auth.dto';
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

/**
 * Service for authentication and user management using AWS Cognito.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly cognitoService: CognitoService,
    private readonly logger: LoggerService,
  ) {
    this.logger.component('AuthService');
  }

  /**
   * Registers a new user.
   */
  async signUp(body: SignUpBody): Promise<SignUpResult> {
    this.logger.info('signUp called', { username: body.username });
    return this.cognitoService.signUp(body);
  }

  /**
   * Creates a new user as admin.
   */
  async adminCreateUser(body: AdminCreateUserBody): Promise<AdminCreateUserResult> {
    this.logger.info('adminCreateUser called', { username: body.username });
    return this.cognitoService.adminCreateUser(body);
  }

  /**
   * Initiates authentication as admin (login).
   */
  async adminInitiateAuth(body: AdminInitiateAuthBody): Promise<AdminInitiateAuthResult> {
    this.logger.info('adminInitiateAuth called', { username: body.username });
    return this.cognitoService.adminInitiateAuth(body);
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
   * Gets user details as admin.
   */
  async adminGetUser(params: AdminGetUserParams): Promise<AdminGetUserResult> {
    this.logger.info('adminGetUser called', { username: params.username });
    return this.cognitoService.adminGetUser(params);
  }

  /**
   * Updates user attributes as admin.
   */
  async adminUpdateUserAttributes(
    body: AdminUpdateUserAttributesBody,
  ): Promise<AdminUpdateUserAttributesResult> {
    this.logger.info('adminUpdateUserAttributes called', { username: body.username });
    return this.cognitoService.adminUpdateUserAttributes(body);
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
   * Regular user login (USER_PASSWORD_AUTH).
   */
  async login(body: LoginBody): Promise<LoginResult> {
    this.logger.info('login called', { username: body.username });
    return this.cognitoService.login(body);
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
