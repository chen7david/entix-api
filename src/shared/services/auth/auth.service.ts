import { mapCognitoErrorToAppError } from '@shared/utils/error/cognito-error.util';
import { ConfigService } from '@shared/services/config/config.service';
import { Service } from 'typedi';
import type {
  SignUpParams,
  ConfirmForgotPasswordParams,
  ChangePasswordParams,
} from '@shared/types/authentication.type';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ResendConfirmationCodeCommand,
  GetUserCommand,
  ChangePasswordCommand,
  UpdateUserAttributesCommand,
  GlobalSignOutCommand,
  AuthFlowType,
} from '@aws-sdk/client-cognito-identity-provider';

/**
 * Cognito configuration required for AuthService.
 */
type CognitoConfig = {
  region: string;
  userPoolId: string;
  clientId: string;
};

/**
 * AuthService provides user registration and account management using AWS Cognito.
 *
 * @remarks
 * - Uses AWS SDK v3 CognitoIdentityProviderClient.
 * - Exposes common user management methods.
 * - Injectable via typedi.
 */
@Service()
export class AuthService {
  private readonly cognito: CognitoIdentityProviderClient;
  private readonly config: CognitoConfig;

  /**
   * Constructs the AuthService.
   * @param configService - Injected ConfigService for environment variables.
   */
  constructor(private readonly configService: ConfigService) {
    this.config = {
      region: this.configService.get('COGNITO_REGION'),
      userPoolId: this.configService.get('COGNITO_USER_POOL_ID'),
      clientId: this.configService.get('COGNITO_CLIENT_ID'),
    };
    this.cognito = new CognitoIdentityProviderClient({ region: this.config.region });
  }

  /**
   * Registers a new user in Cognito User Pool.
   * @param params - SignUp parameters
   */
  async signUp(params: SignUpParams) {
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
      return await this.cognito.send(command);
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Confirms a user's sign up with a confirmation code.
   * @param username - User's username
   * @param code - Confirmation code sent to the user
   */
  async confirmSignUp(username: string, code: string) {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: this.config.clientId,
        Username: username,
        ConfirmationCode: code,
      });
      return await this.cognito.send(command);
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Authenticates a user and returns tokens.
   * @param email - User's email address
   * @param password - User's password
   */
  async signIn(email: string, password: string) {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        ClientId: this.config.clientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });
      return await this.cognito.send(command);
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Initiates forgot password flow for a user.
   * @param email - User's email address
   */
  async forgotPassword(email: string) {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: this.config.clientId,
        Username: email,
      });
      return await this.cognito.send(command);
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Confirms a new password using the code sent to the user.
   * @param params - ConfirmForgotPassword parameters
   */
  async confirmForgotPassword(params: ConfirmForgotPasswordParams) {
    try {
      const { email, code, newPassword } = params;
      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.config.clientId,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
      });
      return await this.cognito.send(command);
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Resends the confirmation code to the user.
   * @param email - User's email address
   */
  async resendConfirmationCode(email: string) {
    try {
      const command = new ResendConfirmationCodeCommand({
        ClientId: this.config.clientId,
        Username: email,
      });
      return await this.cognito.send(command);
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Gets user attributes using the access token.
   * @param accessToken - The user's access token
   */
  async getUser(accessToken: string) {
    try {
      const command = new GetUserCommand({ AccessToken: accessToken });
      return await this.cognito.send(command);
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Updates user attributes.
   * @param accessToken - The user's access token
   * @param attributes - Attributes to update
   */
  async updateUserAttributes(accessToken: string, attributes: Record<string, string>) {
    try {
      const userAttributes = Object.entries(attributes).map(([Name, Value]) => ({ Name, Value }));
      const command = new UpdateUserAttributesCommand({
        AccessToken: accessToken,
        UserAttributes: userAttributes,
      });
      return await this.cognito.send(command);
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Changes the user's password.
   * @param params - ChangePassword parameters
   */
  async changePassword(params: ChangePasswordParams) {
    try {
      const { accessToken, previousPassword, proposedPassword } = params;
      const command = new ChangePasswordCommand({
        AccessToken: accessToken,
        PreviousPassword: previousPassword,
        ProposedPassword: proposedPassword,
      });
      return await this.cognito.send(command);
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Signs the user out globally (all devices).
   * @param accessToken - The user's access token
   */
  async signOut(accessToken: string) {
    try {
      const command = new GlobalSignOutCommand({ AccessToken: accessToken });
      return await this.cognito.send(command);
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }
}
