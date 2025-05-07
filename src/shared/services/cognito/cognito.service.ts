import { Injectable } from '@shared/utils/ioc.util';
import { LoggerService } from '@shared/services/logger/logger.service';
import { ConfigService } from '@shared/services/config/config.service';
import { mapCognitoErrorToAppError } from '@shared/utils/error/cognito-error.util';
import { SignUpParams, SignUpResult } from '@shared/types/cognito.type';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ResendConfirmationCodeCommand,
  ChangePasswordCommand,
  ConfirmSignUpCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  GetUserCommand,
  UpdateUserAttributesCommand,
  DeleteUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  ForgotPasswordParams,
  ForgotPasswordResult,
  ConfirmForgotPasswordParams,
  ConfirmForgotPasswordResult,
  ResendConfirmationCodeParams,
  ResendConfirmationCodeResult,
  ChangePasswordParams,
  ChangePasswordResult,
  ConfirmSignUpParams,
  ConfirmSignUpResult,
  SignOutParams,
  SignOutResult,
  RefreshTokenParams,
  RefreshTokenResult,
  LoginParams,
  LoginResult,
  GetUserParams,
  GetUserResult,
  UpdateUserAttributesParams,
  UpdateUserAttributesResult,
  DeleteUserParams,
  DeleteUserResult,
} from '@shared/types/cognito.type';

/**
 * Cognito configuration required for AuthService.
 */
type CognitoConfig = {
  region: string;
  userPoolId: string;
  clientId: string;
};
@Injectable()
export class CognitoService {
  private readonly cognito: CognitoIdentityProviderClient;
  private readonly config: CognitoConfig;

  /**
   * Constructs a CognitoService.
   * @param configService - The config service
   * @param logger - The logger service
   * @param cognitoClient - Cognito client for dependency injection/testing
   */
  // eslint-disable-next-line max-params
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    cognitoClient: CognitoIdentityProviderClient,
  ) {
    this.logger.component('CognitoService');
    this.config = {
      region: this.configService.get('COGNITO_REGION'),
      userPoolId: this.configService.get('COGNITO_USER_POOL_ID'),
      clientId: this.configService.get('COGNITO_CLIENT_ID'),
    };
    this.cognito = cognitoClient;
  }

  /**
   * Registers a new user in Cognito User Pool.
   * @param params - SignUp parameters
   * @returns An object containing user confirmation status and Cognito sub (unique identifier).
   */
  async signUp(params: SignUpParams): Promise<SignUpResult> {
    try {
      const { username, email, password, attributes } = params;
      const userAttributes = [
        { Name: 'email', Value: email },
        ...(attributes ? Object.entries(attributes).map(([Name, Value]) => ({ Name, Value })) : []),
      ];
      const command = new SignUpCommand({
        ClientId: this.config.clientId,
        Username: username,
        Password: password,
        UserAttributes: userAttributes,
      });

      const result = await this.cognito.send(command);

      return {
        userConfirmed: result.UserConfirmed,
        sub: result.UserSub,
      };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Initiates forgot password flow.
   * @param params - ForgotPassword parameters
   */
  async forgotPassword(params: ForgotPasswordParams): Promise<ForgotPasswordResult> {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: this.config.clientId,
        Username: params.username,
      });
      const result = await this.cognito.send(command);
      return {
        codeDeliveryDetails: result.CodeDeliveryDetails
          ? {
              destination: result.CodeDeliveryDetails.Destination,
              deliveryMedium: result.CodeDeliveryDetails.DeliveryMedium,
              attributeName: result.CodeDeliveryDetails.AttributeName,
            }
          : undefined,
      };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Confirms a new password using a confirmation code.
   * @param params - ConfirmForgotPassword parameters
   */
  async confirmForgotPassword(
    params: ConfirmForgotPasswordParams,
  ): Promise<ConfirmForgotPasswordResult> {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.config.clientId,
        Username: params.username,
        ConfirmationCode: params.code,
        Password: params.newPassword,
      });
      await this.cognito.send(command);
      return { success: true };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Resends the confirmation code for user sign-up.
   * @param params - ResendConfirmationCode parameters
   */
  async resendConfirmationCode(
    params: ResendConfirmationCodeParams,
  ): Promise<ResendConfirmationCodeResult> {
    try {
      const command = new ResendConfirmationCodeCommand({
        ClientId: this.config.clientId,
        Username: params.username,
      });
      const result = await this.cognito.send(command);
      return {
        codeDeliveryDetails: result.CodeDeliveryDetails
          ? {
              destination: result.CodeDeliveryDetails.Destination,
              deliveryMedium: result.CodeDeliveryDetails.DeliveryMedium,
              attributeName: result.CodeDeliveryDetails.AttributeName,
            }
          : undefined,
      };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Changes the password for the currently authenticated user.
   * @param params - ChangePassword parameters
   */
  async changePassword(params: ChangePasswordParams): Promise<ChangePasswordResult> {
    try {
      const command = new ChangePasswordCommand({
        AccessToken: params.accessToken,
        PreviousPassword: params.previousPassword,
        ProposedPassword: params.proposedPassword,
      });
      await this.cognito.send(command);
      return { success: true };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Confirms user signup with confirmation code.
   * @param params - ConfirmSignUp parameters
   * @returns An object indicating success.
   */
  async confirmSignUp(params: ConfirmSignUpParams): Promise<ConfirmSignUpResult> {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: this.config.clientId,
        Username: params.username,
        ConfirmationCode: params.code,
      });
      await this.cognito.send(command);
      return { success: true };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Signs out a user globally (invalidates all tokens).
   * @param params - SignOut parameters
   */
  async signOut(params: SignOutParams): Promise<SignOutResult> {
    try {
      const command = new GlobalSignOutCommand({
        AccessToken: params.accessToken,
      });
      await this.cognito.send(command);
      return { success: true };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Refreshes tokens using a refresh token.
   * @param params - RefreshToken parameters
   */
  async refreshToken(params: RefreshTokenParams): Promise<RefreshTokenResult> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: params.clientId,
        AuthParameters: {
          REFRESH_TOKEN: params.refreshToken,
        },
      });
      const result = await this.cognito.send(command);
      return {
        accessToken: result.AuthenticationResult?.AccessToken || '',
        idToken: result.AuthenticationResult?.IdToken,
        expiresIn: result.AuthenticationResult?.ExpiresIn,
        tokenType: result.AuthenticationResult?.TokenType,
      };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Regular user login (USER_PASSWORD_AUTH).
   * @param params - Login parameters
   */
  async login(params: LoginParams): Promise<LoginResult> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: this.config.clientId,
        AuthParameters: {
          USERNAME: params.username,
          PASSWORD: params.password,
        },
      });
      const result = await this.cognito.send(command);
      return {
        accessToken: result.AuthenticationResult?.AccessToken || '',
        refreshToken: result.AuthenticationResult?.RefreshToken,
        idToken: result.AuthenticationResult?.IdToken,
        expiresIn: result.AuthenticationResult?.ExpiresIn,
        tokenType: result.AuthenticationResult?.TokenType,
      };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Get current user info (self-service, by access token).
   * @param params - GetUser parameters
   */
  async getUser(params: GetUserParams): Promise<GetUserResult> {
    try {
      const command = new GetUserCommand({
        AccessToken: params.accessToken,
      });
      const result = await this.cognito.send(command);
      const attributes: Record<string, string> = {};
      result.UserAttributes?.forEach((attr) => {
        if (attr.Name && attr.Value) attributes[attr.Name] = attr.Value;
      });
      return {
        username: result.Username || '',
        userStatus: undefined,
        enabled: undefined,
        userCreateDate: undefined,
        userLastModifiedDate: undefined,
        attributes,
      };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Update current user attributes (self-service).
   * @param params - UpdateUserAttributes parameters
   */
  async updateUserAttributes(
    params: UpdateUserAttributesParams,
  ): Promise<UpdateUserAttributesResult> {
    try {
      const userAttributes = Object.entries(params.attributes).map(([Name, Value]) => ({
        Name,
        Value,
      }));
      const command = new UpdateUserAttributesCommand({
        AccessToken: params.accessToken,
        UserAttributes: userAttributes,
      });
      await this.cognito.send(command);
      return { success: true };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Delete current user (self-service).
   * @param params - DeleteUser parameters
   */
  async deleteUser(params: DeleteUserParams): Promise<DeleteUserResult> {
    try {
      const command = new DeleteUserCommand({
        AccessToken: params.accessToken,
      });
      await this.cognito.send(command);
      return { success: true };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }
}
