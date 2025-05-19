import { Injectable } from '@shared/utils/ioc.util';
import { CognitoAdminService } from '@shared/services/cognito/cognito-admin.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { Logger } from '@shared/types/logger.type';
import {
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
  ListUsersParams,
  ListUsersResult,
  ListGroupsParams,
  ListGroupsResult,
  AdminInitiateAuthParams,
  AdminInitiateAuthResult,
  AdminListGroupsForUserParams,
  AdminListGroupsForUserResult,
  ListUsersInGroupParams,
  ListUsersInGroupResult,
} from '@shared/types/cognito-admin.type';

/**
 * Service for handling admin operations.
 */
@Injectable()
export class AdminService {
  private readonly logger: Logger;

  constructor(
    private readonly cognitoAdminService: CognitoAdminService,
    private readonly loggerService: LoggerService,
  ) {
    this.logger = this.loggerService.component('AdminService');
  }

  /**
   * List all users in the Cognito user pool.
   * @param params - Optional parameters for listing users
   */
  async listUsers(params?: ListUsersParams): Promise<ListUsersResult> {
    this.logger.info('Listing users', { limit: params?.limit });
    return this.cognitoAdminService.listUsers(params);
  }

  /**
   * Create a new user in the Cognito user pool.
   * @param params - Parameters for creating a new user
   */
  async createUser(params: AdminCreateUserParams): Promise<AdminCreateUserResult> {
    this.logger.info('Creating user', { username: params.username });
    return this.cognitoAdminService.adminCreateUser(params);
  }

  /**
   * Get a user by username.
   * @param params - Parameters for getting a user
   */
  async getUser(params: AdminGetUserParams): Promise<AdminGetUserResult> {
    this.logger.info('Getting user', { username: params.username });
    return this.cognitoAdminService.adminGetUser(params);
  }

  /**
   * Update a user's attributes.
   * @param username - The username of the user to update
   * @param params - Parameters for updating user attributes
   */
  async updateUserAttributes(
    username: string,
    params: AdminUpdateUserAttributesParams,
  ): Promise<AdminUpdateUserAttributesResult> {
    this.logger.info('Updating user attributes', { username });
    return this.cognitoAdminService.adminUpdateUserAttributes({
      ...params,
      username,
    });
  }

  /**
   * Delete a user.
   * @param params - Parameters for deleting a user
   */
  async deleteUser(params: AdminDeleteUserParams): Promise<AdminDeleteUserResult> {
    this.logger.info('Deleting user', { username: params.username });
    return this.cognitoAdminService.adminDeleteUser(params);
  }

  /**
   * Disable a user.
   * @param params - Parameters for disabling a user
   */
  async disableUser(params: AdminDisableUserParams): Promise<AdminDisableUserResult> {
    this.logger.info('Disabling user', { username: params.username });
    return this.cognitoAdminService.adminDisableUser(params);
  }

  /**
   * Enable a user.
   * @param params - Parameters for enabling a user
   */
  async enableUser(params: AdminEnableUserParams): Promise<AdminEnableUserResult> {
    this.logger.info('Enabling user', { username: params.username });
    return this.cognitoAdminService.adminEnableUser(params);
  }

  /**
   * Reset a user's password.
   * @param params - Parameters for resetting a user's password
   */
  async resetUserPassword(
    params: AdminResetUserPasswordParams,
  ): Promise<AdminResetUserPasswordResult> {
    this.logger.info('Resetting user password', { username: params.username });
    return this.cognitoAdminService.adminResetUserPassword(params);
  }

  /**
   * Set a user's password.
   * @param username - The username of the user
   * @param params - Parameters for setting a user's password
   */
  async setUserPassword(
    username: string,
    params: AdminSetUserPasswordParams,
  ): Promise<AdminSetUserPasswordResult> {
    this.logger.info('Setting user password', { username });
    return this.cognitoAdminService.adminSetUserPassword({
      ...params,
      username,
    });
  }

  /**
   * Confirm a user's sign-up.
   * @param params - Parameters for confirming a user's sign-up
   */
  async confirmUserSignUp(params: AdminConfirmSignUpParams): Promise<AdminConfirmSignUpResult> {
    this.logger.info('Confirming user sign-up', { username: params.username });
    return this.cognitoAdminService.adminConfirmSignUp(params);
  }

  /**
   * Add a user to a group.
   * @param params - Parameters for adding a user to a group
   */
  async addUserToGroup(params: AdminAddUserToGroupParams): Promise<AdminAddUserToGroupResult> {
    this.logger.info('Adding user to group', {
      username: params.username,
      groupName: params.groupName,
    });
    return this.cognitoAdminService.adminAddUserToGroup(params);
  }

  /**
   * Remove a user from a group.
   * @param params - Parameters for removing a user from a group
   */
  async removeUserFromGroup(
    params: AdminRemoveUserFromGroupParams,
  ): Promise<AdminRemoveUserFromGroupResult> {
    this.logger.info('Removing user from group', {
      username: params.username,
      groupName: params.groupName,
    });
    return this.cognitoAdminService.adminRemoveUserFromGroup(params);
  }

  /**
   * List groups for a user.
   * @param params - Parameters for listing groups for a user
   */
  async listGroupsForUser(
    params: AdminListGroupsForUserParams,
  ): Promise<AdminListGroupsForUserResult> {
    this.logger.info('Listing groups for user', { username: params.username });
    return this.cognitoAdminService.adminListGroupsForUser(params);
  }

  /**
   * List users in a group.
   * @param params - Parameters for listing users in a group
   */
  async listUsersInGroup(params: ListUsersInGroupParams): Promise<ListUsersInGroupResult> {
    this.logger.info('Listing users in group', { groupName: params.groupName });
    return this.cognitoAdminService.listUsersInGroup(params);
  }

  /**
   * Create a new group.
   * @param params - Parameters for creating a group
   */
  async createGroup(params: CreateGroupParams): Promise<CreateGroupResult> {
    this.logger.info('Creating group', { groupName: params.groupName });
    return this.cognitoAdminService.createGroup(params);
  }

  /**
   * Update a group.
   * @param groupName - The name of the group to update
   * @param params - Parameters for updating a group
   */
  async updateGroup(groupName: string, params: UpdateGroupParams): Promise<UpdateGroupResult> {
    this.logger.info('Updating group', { groupName });
    return this.cognitoAdminService.updateGroup({
      ...params,
      groupName,
    });
  }

  /**
   * Delete a group.
   * @param params - Parameters for deleting a group
   */
  async deleteGroup(params: DeleteGroupParams): Promise<DeleteGroupResult> {
    this.logger.info('Deleting group', { groupName: params.groupName });
    return this.cognitoAdminService.deleteGroup(params);
  }

  /**
   * List all groups in the Cognito user pool.
   * @param params - Optional parameters for listing groups
   */
  async listGroups(params?: ListGroupsParams): Promise<ListGroupsResult> {
    this.logger.info('Listing groups', { limit: params?.limit });
    return this.cognitoAdminService.listGroups(params);
  }

  /**
   * Admin authenticate a user.
   * @param params - Parameters for admin authentication
   */
  async adminLogin(params: AdminInitiateAuthParams): Promise<AdminInitiateAuthResult> {
    this.logger.info('Admin login', { username: params.username });
    return this.cognitoAdminService.adminInitiateAuth(params);
  }
}
