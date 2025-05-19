import { Injectable } from '@shared/utils/ioc.util';
import { LoggerService } from '@shared/services/logger/logger.service';
import { ConfigService } from '@shared/services/config/config.service';
import { mapCognitoErrorToAppError } from '@shared/utils/error/cognito-error.util';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminResetUserPasswordCommand,
  AdminSetUserPasswordCommand,
  AdminConfirmSignUpCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  CreateGroupCommand,
  UpdateGroupCommand,
  DeleteGroupCommand,
  ListGroupsCommand,
  AdminInitiateAuthCommand,
  AdminListGroupsForUserCommand,
  ListUsersInGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  ListUsersParams,
  ListUsersResult,
  AdminCreateUserParams,
  AdminCreateUserResult,
  AdminGetUserParams,
  AdminGetUserResult,
  AdminUpdateUserAttributesParams,
  AdminUpdateUserAttributesResult,
  AdminDeleteUserParams,
  AdminDeleteUserResult,
  AdminDisableUserParams,
  AdminDisableUserResult,
  AdminEnableUserParams,
  AdminEnableUserResult,
  AdminResetUserPasswordParams,
  AdminResetUserPasswordResult,
  AdminSetUserPasswordParams,
  AdminSetUserPasswordResult,
  AdminConfirmSignUpParams,
  AdminConfirmSignUpResult,
  AdminAddUserToGroupParams,
  AdminAddUserToGroupResult,
  AdminRemoveUserFromGroupParams,
  AdminRemoveUserFromGroupResult,
  CreateGroupParams,
  CreateGroupResult,
  UpdateGroupParams,
  UpdateGroupResult,
  DeleteGroupParams,
  DeleteGroupResult,
  ListGroupsParams,
  ListGroupsResult,
  AdminInitiateAuthParams,
  AdminInitiateAuthResult,
  UserType,
  GroupType,
  AdminListGroupsForUserParams,
  AdminListGroupsForUserResult,
  ListUsersInGroupParams,
  ListUsersInGroupResult,
} from '@shared/types/cognito-admin.type';

/**
 * Cognito Admin configuration.
 */
type CognitoAdminConfig = {
  region: string;
  userPoolId: string;
  accessKeyId: string;
  secretAccessKey: string;
};

/**
 * Service for administering Cognito user pool.
 * This service handles administrative operations which require elevated permissions.
 */
@Injectable()
export class CognitoAdminService {
  private readonly config: CognitoAdminConfig;

  /**
   * Constructs a CognitoAdminService.
   * @param configService The config service.
   * @param logger The logger service.
   * @param cognito The Cognito client (injected).
   */
  // eslint-disable-next-line max-params
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly cognito: CognitoIdentityProviderClient,
  ) {
    this.logger.component('CognitoAdminService');
    this.config = {
      region: this.configService.get('COGNITO_REGION'),
      userPoolId: this.configService.get('COGNITO_USER_POOL_ID'),
      accessKeyId: this.configService.get('COGNITO_ADMIN_ACCESS_KEY'),
      secretAccessKey: this.configService.get('COGNITO_ADMIN_SECRET_KEY'),
    };
  }

  /**
   * Lists users in the Cognito user pool.
   * @param params - Optional parameters for listing users
   */
  async listUsers(params?: ListUsersParams): Promise<ListUsersResult> {
    try {
      const command = new ListUsersCommand({
        UserPoolId: this.config.userPoolId,
        Limit: params?.limit,
        PaginationToken: params?.paginationToken,
        Filter: params?.filter,
      });

      const result = await this.cognito.send(command);
      const users: UserType[] =
        result.Users?.map((user) => {
          const attributes: Record<string, string> = {};
          user.Attributes?.forEach((attr) => {
            if (attr.Name && attr.Value) attributes[attr.Name] = attr.Value;
          });

          return {
            username: user.Username || '',
            userStatus: user.UserStatus,
            enabled: user.Enabled,
            userCreateDate: user.UserCreateDate,
            userLastModifiedDate: user.UserLastModifiedDate,
            attributes,
          };
        }) || [];

      return {
        users,
        paginationToken: result.PaginationToken,
      };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Creates a new user in the Cognito user pool.
   * @param params - Parameters for creating a new user
   */
  async adminCreateUser(params: AdminCreateUserParams): Promise<AdminCreateUserResult> {
    try {
      const userAttributes = [
        { Name: 'email', Value: params.email },
        ...(params.attributes
          ? Object.entries(params.attributes).map(([Name, Value]) => ({ Name, Value }))
          : []),
      ];

      const command = new AdminCreateUserCommand({
        UserPoolId: this.config.userPoolId,
        Username: params.username,
        TemporaryPassword: params.temporaryPassword,
        UserAttributes: userAttributes,
        MessageAction: params.messageAction,
      });

      const result = await this.cognito.send(command);
      const user = result.User;

      if (!user) {
        throw new Error('User creation failed');
      }

      const attributes: Record<string, string> = {};
      user.Attributes?.forEach((attr) => {
        if (attr.Name && attr.Value) attributes[attr.Name] = attr.Value;
      });

      return {
        user: {
          username: user.Username || '',
          userStatus: user.UserStatus,
          enabled: user.Enabled,
          userCreateDate: user.UserCreateDate,
          userLastModifiedDate: user.UserLastModifiedDate,
          attributes,
        },
      };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Gets a user by username.
   * @param params - Parameters for getting a user
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
        userStatus: result.UserStatus,
        enabled: result.Enabled,
        userCreateDate: result.UserCreateDate,
        userLastModifiedDate: result.UserLastModifiedDate,
        attributes,
      };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Updates user attributes.
   * @param params - Parameters for updating user attributes
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
   * Deletes a user.
   * @param params - Parameters for deleting a user
   */
  async adminDeleteUser(params: AdminDeleteUserParams): Promise<AdminDeleteUserResult> {
    try {
      const command = new AdminDeleteUserCommand({
        UserPoolId: this.config.userPoolId,
        Username: params.username,
      });

      await this.cognito.send(command);

      return { success: true };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Disables a user.
   * @param params - Parameters for disabling a user
   */
  async adminDisableUser(params: AdminDisableUserParams): Promise<AdminDisableUserResult> {
    try {
      const command = new AdminDisableUserCommand({
        UserPoolId: this.config.userPoolId,
        Username: params.username,
      });

      await this.cognito.send(command);

      return { success: true };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Enables a user.
   * @param params - Parameters for enabling a user
   */
  async adminEnableUser(params: AdminEnableUserParams): Promise<AdminEnableUserResult> {
    try {
      const command = new AdminEnableUserCommand({
        UserPoolId: this.config.userPoolId,
        Username: params.username,
      });

      await this.cognito.send(command);

      return { success: true };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Resets a user's password.
   * @param params - Parameters for resetting a user's password
   */
  async adminResetUserPassword(
    params: AdminResetUserPasswordParams,
  ): Promise<AdminResetUserPasswordResult> {
    try {
      const command = new AdminResetUserPasswordCommand({
        UserPoolId: this.config.userPoolId,
        Username: params.username,
      });

      await this.cognito.send(command);

      return { success: true };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Sets a user's password.
   * @param params - Parameters for setting a user's password
   */
  async adminSetUserPassword(
    params: AdminSetUserPasswordParams,
  ): Promise<AdminSetUserPasswordResult> {
    try {
      const command = new AdminSetUserPasswordCommand({
        UserPoolId: this.config.userPoolId,
        Username: params.username,
        Password: params.password,
        Permanent: params.permanent,
      });

      await this.cognito.send(command);

      return { success: true };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Confirms a user's sign-up as an admin.
   * @param params - Parameters for confirming sign-up
   */
  async adminConfirmSignUp(params: AdminConfirmSignUpParams): Promise<AdminConfirmSignUpResult> {
    try {
      const command = new AdminConfirmSignUpCommand({
        UserPoolId: this.config.userPoolId,
        Username: params.username,
      });

      await this.cognito.send(command);

      return { success: true };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Adds a user to a group.
   * @param params - Parameters for adding a user to a group
   */
  async adminAddUserToGroup(params: AdminAddUserToGroupParams): Promise<AdminAddUserToGroupResult> {
    try {
      const command = new AdminAddUserToGroupCommand({
        UserPoolId: this.config.userPoolId,
        Username: params.username,
        GroupName: params.groupName,
      });

      await this.cognito.send(command);

      return { success: true };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Removes a user from a group.
   * @param params - Parameters for removing a user from a group
   */
  async adminRemoveUserFromGroup(
    params: AdminRemoveUserFromGroupParams,
  ): Promise<AdminRemoveUserFromGroupResult> {
    try {
      const command = new AdminRemoveUserFromGroupCommand({
        UserPoolId: this.config.userPoolId,
        Username: params.username,
        GroupName: params.groupName,
      });

      await this.cognito.send(command);

      return { success: true };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Creates a new group.
   * @param params - Parameters for creating a group
   */
  async createGroup(params: CreateGroupParams): Promise<CreateGroupResult> {
    try {
      const command = new CreateGroupCommand({
        UserPoolId: this.config.userPoolId,
        GroupName: params.groupName,
        Description: params.description,
        Precedence: params.precedence,
        RoleArn: params.roleArn,
      });

      const result = await this.cognito.send(command);
      const group = result.Group;

      if (!group) {
        throw new Error('Group creation failed');
      }

      return {
        group: {
          groupName: group.GroupName || '',
          description: group.Description,
          precedence: group.Precedence,
          roleArn: group.RoleArn,
          creationDate: group.CreationDate,
          lastModifiedDate: group.LastModifiedDate,
        },
      };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Updates a group.
   * @param params - Parameters for updating a group
   */
  async updateGroup(params: UpdateGroupParams): Promise<UpdateGroupResult> {
    try {
      const command = new UpdateGroupCommand({
        UserPoolId: this.config.userPoolId,
        GroupName: params.groupName,
        Description: params.description,
        Precedence: params.precedence,
        RoleArn: params.roleArn,
      });

      const result = await this.cognito.send(command);
      const group = result.Group;

      if (!group) {
        throw new Error('Group update failed');
      }

      return {
        group: {
          groupName: group.GroupName || '',
          description: group.Description,
          precedence: group.Precedence,
          roleArn: group.RoleArn,
          creationDate: group.CreationDate,
          lastModifiedDate: group.LastModifiedDate,
        },
      };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Deletes a group.
   * @param params - Parameters for deleting a group
   */
  async deleteGroup(params: DeleteGroupParams): Promise<DeleteGroupResult> {
    try {
      const command = new DeleteGroupCommand({
        UserPoolId: this.config.userPoolId,
        GroupName: params.groupName,
      });

      await this.cognito.send(command);

      return { success: true };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Lists groups in the Cognito user pool.
   * @param params - Optional parameters for listing groups
   */
  async listGroups(params?: ListGroupsParams): Promise<ListGroupsResult> {
    try {
      const command = new ListGroupsCommand({
        UserPoolId: this.config.userPoolId,
        Limit: params?.limit,
        NextToken: params?.nextToken,
      });

      const result = await this.cognito.send(command);
      const groups: GroupType[] =
        result.Groups?.map((group) => {
          return {
            groupName: group.GroupName || '',
            description: group.Description,
            precedence: group.Precedence,
            roleArn: group.RoleArn,
            creationDate: group.CreationDate,
            lastModifiedDate: group.LastModifiedDate,
          };
        }) || [];

      return {
        groups,
        nextToken: result.NextToken,
      };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Admin authenticate a user.
   * @param params - Parameters for admin authentication
   */
  async adminInitiateAuth(params: AdminInitiateAuthParams): Promise<AdminInitiateAuthResult> {
    try {
      const command = new AdminInitiateAuthCommand({
        UserPoolId: this.config.userPoolId,
        ClientId: this.configService.get('COGNITO_CLIENT_ID'),
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
   * Lists groups for a user.
   * @param params - Parameters for listing groups for a user
   */
  async adminListGroupsForUser(
    params: AdminListGroupsForUserParams,
  ): Promise<AdminListGroupsForUserResult> {
    try {
      const command = new AdminListGroupsForUserCommand({
        UserPoolId: this.config.userPoolId,
        Username: params.username,
        Limit: params.limit,
        NextToken: params.nextToken,
      });

      const result = await this.cognito.send(command);
      const groups: GroupType[] =
        result.Groups?.map((group) => ({
          groupName: group.GroupName || '',
          description: group.Description,
          precedence: group.Precedence,
          roleArn: group.RoleArn,
          creationDate: group.CreationDate,
          lastModifiedDate: group.LastModifiedDate,
        })) || [];

      return {
        groups,
        nextToken: result.NextToken,
      };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }

  /**
   * Lists users in a group.
   * @param params - Parameters for listing users in a group
   */
  async listUsersInGroup(params: ListUsersInGroupParams): Promise<ListUsersInGroupResult> {
    try {
      const command = new ListUsersInGroupCommand({
        UserPoolId: this.config.userPoolId,
        GroupName: params.groupName,
        Limit: params.limit,
        NextToken: params.nextToken,
      });

      const result = await this.cognito.send(command);
      const users: UserType[] =
        result.Users?.map((user) => {
          const attributes: Record<string, string> = {};
          user.Attributes?.forEach((attr) => {
            if (attr.Name && attr.Value) attributes[attr.Name] = attr.Value;
          });

          return {
            username: user.Username || '',
            userStatus: user.UserStatus,
            enabled: user.Enabled,
            userCreateDate: user.UserCreateDate,
            userLastModifiedDate: user.UserLastModifiedDate,
            attributes,
          };
        }) || [];

      return {
        users,
        nextToken: result.NextToken,
      };
    } catch (error) {
      throw mapCognitoErrorToAppError(error);
    }
  }
}
