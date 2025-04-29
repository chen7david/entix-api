import { Injectable } from '@shared/utils/ioc.util';
import { LoggerService } from '@shared/services/logger/logger.service';
import { ConfigService } from '@shared/services/config/config.service';
import { mapCognitoErrorToAppError } from '@shared/utils/error/cognito-error.util';
import { SignUpParams, SignUpResult } from '@shared/types/cognito.type';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminCreateUserCommand,
  AdminInitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ResendConfirmationCodeCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  ChangePasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  AdminCreateUserParams,
  AdminCreateUserResult,
  AdminInitiateAuthParams,
  AdminInitiateAuthResult,
  ForgotPasswordParams,
  ForgotPasswordResult,
  ConfirmForgotPasswordParams,
  ConfirmForgotPasswordResult,
  ResendConfirmationCodeParams,
  ResendConfirmationCodeResult,
  AdminGetUserParams,
  AdminGetUserResult,
  AdminUpdateUserAttributesParams,
  AdminUpdateUserAttributesResult,
  ChangePasswordParams,
  ChangePasswordResult,
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

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.component('CognitoService');
    this.config = {
      region: this.configService.get('COGNITO_REGION'),
      userPoolId: this.configService.get('COGNITO_USER_POOL_ID'),
      clientId: this.configService.get('COGNITO_CLIENT_ID'),
    };
    this.cognito = new CognitoIdentityProviderClient({
      region: this.config.region,
    });
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
   * Creates a new user as an admin in Cognito User Pool.
   * @param params - AdminCreateUser parameters
   * @returns An object containing Cognito sub (unique identifier) and user status.
   */
  async adminCreateUser(params: AdminCreateUserParams): Promise<AdminCreateUserResult> {
    try {
      const { username, email, temporaryPassword, attributes } = params;
      const userAttributes = [
        { Name: 'email', Value: email },
        ...(attributes ? Object.entries(attributes).map(([Name, Value]) => ({ Name, Value })) : []),
      ];
      const command = new AdminCreateUserCommand({
        UserPoolId: this.config.userPoolId,
        Username: username,
        TemporaryPassword: temporaryPassword,
        UserAttributes: userAttributes,
        MessageAction: 'SUPPRESS', // Don't send invite email automatically
      });
      const result = await this.cognito.send(command);
      return {
        sub: result.User?.Username,
        userStatus: result.User?.UserStatus,
      };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Initiates authentication as admin (login).
   * @param params - AdminInitiateAuth parameters
   */
  async adminInitiateAuth(params: AdminInitiateAuthParams): Promise<AdminInitiateAuthResult> {
    try {
      const command = new AdminInitiateAuthCommand({
        UserPoolId: this.config.userPoolId,
        ClientId: this.config.clientId,
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
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
   * Gets user details as admin.
   * @param params - AdminGetUser parameters
   */
  async adminGetUser(params: AdminGetUserParams): Promise<AdminGetUserResult> {
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: this.config.userPoolId,
        Username: params.username,
      });
      const result = await this.cognito.send(command);
      const attributes: Record<string, string> = {};
      result.UserAttributes?.forEach((attr) => {
        if (attr.Name && attr.Value) attributes[attr.Name] = attr.Value;
      });
      return {
        username: result.Username || '',
        userStatus: result.UserStatus || '',
        enabled: result.Enabled ?? false,
        userCreateDate: result.UserCreateDate,
        userLastModifiedDate: result.UserLastModifiedDate,
        attributes,
      };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Updates user attributes as admin.
   * @param params - AdminUpdateUserAttributes parameters
   */
  async adminUpdateUserAttributes(
    params: AdminUpdateUserAttributesParams,
  ): Promise<AdminUpdateUserAttributesResult> {
    try {
      const userAttributes = Object.entries(params.attributes).map(([Name, Value]) => ({
        Name,
        Value,
      }));
      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: this.config.userPoolId,
        Username: params.username,
        UserAttributes: userAttributes,
      });
      await this.cognito.send(command);
      return { success: true };
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
}
