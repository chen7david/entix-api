import {
  JsonController,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  QueryParams,
  UseBefore,
  HttpCode,
} from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { AdminService } from '@domains/admin/admin.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { Logger } from '@shared/types/logger.type';
import { Injectable } from '@shared/utils/ioc.util';
import {
  validateBody,
  validateHeaders,
  validateParams,
  validateQuery,
} from '@shared/middleware/validation.middleware';
import {
  adminAuthHeadersSchema,
  listUsersQuerySchema,
  adminCreateUserBodySchema,
  adminUpdateUserAttributesBodySchema,
  adminSetUserPasswordBodySchema,
  listGroupsQuerySchema,
  createGroupBodySchema,
  updateGroupBodySchema,
  adminAuthBodySchema,
  adminAddUserToGroupBodySchema,
  adminRemoveUserFromGroupBodySchema,
  listUsersInGroupQuerySchema,
  listGroupsForUserQuerySchema,
  ListUsersQueryDto,
  AdminCreateUserBody,
  AdminUpdateUserAttributesBody,
  AdminSetUserPasswordBody,
  ListGroupsQueryDto,
  CreateGroupBody,
  UpdateGroupBody,
  AdminAuthBody,
  AdminAddUserToGroupBody,
  AdminRemoveUserFromGroupBody,
  ListUsersInGroupQueryDto,
  ListGroupsForUserQueryDto,
  groupNameParamsSchema,
  usernameParamsSchema,
} from '@domains/admin/admin.dto';
import { AdminInitiateAuthResult, UserType, GroupType } from '@shared/types/cognito-admin.type';

/**
 * Type for normalized user response
 */
type NormalizedUser = {
  username: string;
  email?: string;
  enabled?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

/**
 * Type for normalized group response
 */
type NormalizedGroup = {
  name: string;
  description?: string;
  precedence?: number;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Controller for admin operations.
 */
@Injectable()
@JsonController('/api/v1/admin')
@OpenAPI({ summary: 'Admin operations for user management and groups' })
export class AdminController {
  private readonly logger: Logger;

  constructor(
    private readonly adminService: AdminService,
    private readonly loggerService: LoggerService,
  ) {
    this.logger = this.loggerService.component('AdminController');
  }

  /**
   * Normalizes a Cognito user to a more friendly API response
   * @param user - The Cognito user to normalize
   */
  public normalizeUser(user: UserType): NormalizedUser {
    const normalized: NormalizedUser = {
      username: user.username,
      email: user.attributes.email,
      enabled: user.enabled,
      status: user.userStatus,
      createdAt: user.userCreateDate?.toISOString(),
      updatedAt: user.userLastModifiedDate?.toISOString(),
    };

    // Add any custom attributes (excluding internal cognito ones)
    Object.entries(user.attributes).forEach(([key, value]) => {
      if (!key.startsWith('cognito:') && !['sub', 'email_verified'].includes(key)) {
        if (key.startsWith('custom:')) {
          // Remove custom: prefix for cleaner API
          const cleanKey = key.replace('custom:', '');
          normalized[cleanKey] = value;
        } else if (!['email'].includes(key)) {
          // Skip duplicates we already added
          normalized[key] = value;
        }
      }
    });

    return normalized;
  }

  /**
   * Normalizes a Cognito group to a more friendly API response
   * @param group - The Cognito group to normalize
   */
  public normalizeGroup(group: GroupType): NormalizedGroup {
    return {
      name: group.groupName,
      description: group.description,
      precedence: group.precedence,
      createdAt: group.creationDate?.toISOString(),
      updatedAt: group.lastModifiedDate?.toISOString(),
    };
  }

  /**
   * List all users in the Cognito user pool.
   */
  @Get('/users')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateParams(listUsersQuerySchema))
  @OpenAPI({ summary: 'List all users' })
  async listUsers(
    @QueryParams() query: ListUsersQueryDto,
  ): Promise<{ users: NormalizedUser[]; paginationToken?: string }> {
    this.logger.info('GET /admin/users', { query });
    try {
      const result = await this.adminService.listUsers(query);
      return {
        users: result.users.map((user) => this.normalizeUser(user)),
        paginationToken: result.paginationToken,
      };
    } catch (err) {
      this.logger.error('Error in listUsers', { err });
      throw err;
    }
  }

  /**
   * Create a new user in the Cognito user pool.
   */
  @Post('/users')
  @HttpCode(201)
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateBody(adminCreateUserBodySchema))
  @OpenAPI({ summary: 'Create a new user' })
  async createUser(@Body() body: AdminCreateUserBody): Promise<{ user: NormalizedUser }> {
    this.logger.info('POST /admin/users', { username: body.username });
    try {
      const result = await this.adminService.createUser(body);
      return {
        user: this.normalizeUser(result.user),
      };
    } catch (err) {
      this.logger.error('Error in createUser', { err });
      throw err;
    }
  }

  /**
   * Get user details by username.
   */
  @Get('/users/:username')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateParams(usernameParamsSchema))
  @OpenAPI({ summary: 'Get user details by username' })
  async getUser(@Param('username') username: string): Promise<NormalizedUser> {
    this.logger.info('GET /admin/users/:username', { username });
    try {
      const result = await this.adminService.getUser({ username });
      return this.normalizeUser(result);
    } catch (err) {
      this.logger.error('Error in getUser', { err });
      throw err;
    }
  }

  /**
   * Update user attributes.
   */
  @Patch('/users/:username')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateParams(usernameParamsSchema))
  @UseBefore(validateBody(adminUpdateUserAttributesBodySchema))
  @OpenAPI({ summary: 'Update user attributes' })
  async updateUserAttributes(
    @Param('username') username: string,
    @Body() body: AdminUpdateUserAttributesBody,
  ): Promise<{ success: boolean }> {
    this.logger.info('PATCH /admin/users/:username', { username });
    try {
      const result = await this.adminService.updateUserAttributes(username, {
        attributes: body.attributes,
        username,
      });
      return result;
    } catch (err) {
      this.logger.error('Error in updateUserAttributes', { err });
      throw err;
    }
  }

  /**
   * Delete a user.
   */
  @Delete('/users/:username')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateParams(usernameParamsSchema))
  @OpenAPI({ summary: 'Delete a user' })
  async deleteUser(@Param('username') username: string): Promise<{ success: boolean }> {
    this.logger.info('DELETE /admin/users/:username', { username });
    try {
      return await this.adminService.deleteUser({ username });
    } catch (err) {
      this.logger.error('Error in deleteUser', { err });
      throw err;
    }
  }

  /**
   * Disable a user.
   */
  @Post('/users/:username/disable')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateParams(usernameParamsSchema))
  @OpenAPI({ summary: 'Disable a user' })
  async disableUser(@Param('username') username: string): Promise<{ success: boolean }> {
    this.logger.info('POST /admin/users/:username/disable', { username });
    try {
      return await this.adminService.disableUser({ username });
    } catch (err) {
      this.logger.error('Error in disableUser', { err });
      throw err;
    }
  }

  /**
   * Enable a user.
   */
  @Post('/users/:username/enable')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateParams(usernameParamsSchema))
  @OpenAPI({ summary: 'Enable a user' })
  async enableUser(@Param('username') username: string): Promise<{ success: boolean }> {
    this.logger.info('POST /admin/users/:username/enable', { username });
    try {
      return await this.adminService.enableUser({ username });
    } catch (err) {
      this.logger.error('Error in enableUser', { err });
      throw err;
    }
  }

  /**
   * Reset a user's password.
   */
  @Post('/users/:username/reset-password')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateParams(usernameParamsSchema))
  @OpenAPI({ summary: "Reset a user's password" })
  async resetUserPassword(@Param('username') username: string): Promise<{ success: boolean }> {
    this.logger.info('POST /admin/users/:username/reset-password', { username });
    try {
      return await this.adminService.resetUserPassword({ username });
    } catch (err) {
      this.logger.error('Error in resetUserPassword', { err });
      throw err;
    }
  }

  /**
   * Set a user's password.
   */
  @Post('/users/:username/set-password')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateParams(usernameParamsSchema))
  @UseBefore(validateBody(adminSetUserPasswordBodySchema))
  @OpenAPI({ summary: "Set a user's password" })
  async setUserPassword(
    @Param('username') username: string,
    @Body() body: AdminSetUserPasswordBody,
  ): Promise<{ success: boolean }> {
    this.logger.info('POST /admin/users/:username/set-password', { username });
    try {
      return await this.adminService.setUserPassword(username, {
        password: body.password,
        permanent: body.permanent,
        username,
      });
    } catch (err) {
      this.logger.error('Error in setUserPassword', { err });
      throw err;
    }
  }

  /**
   * Confirm a user's sign-up.
   */
  @Post('/users/:username/confirm')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateParams(usernameParamsSchema))
  @OpenAPI({ summary: "Confirm a user's sign-up" })
  async confirmUserSignUp(@Param('username') username: string): Promise<{ success: boolean }> {
    this.logger.info('POST /admin/users/:username/confirm', { username });
    try {
      return await this.adminService.confirmUserSignUp({ username });
    } catch (err) {
      this.logger.error('Error in confirmUserSignUp', { err });
      throw err;
    }
  }

  /**
   * List all groups that a user belongs to.
   */
  @Get('/users/:username/groups')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateParams(usernameParamsSchema))
  @UseBefore(validateQuery(listGroupsForUserQuerySchema))
  @OpenAPI({ summary: 'List all groups that a user belongs to' })
  async listGroupsForUser(
    @Param('username') username: string,
    @QueryParams() query: ListGroupsForUserQueryDto,
  ): Promise<{ groups: NormalizedGroup[]; nextToken?: string }> {
    this.logger.info('GET /admin/users/:username/groups', { username, query });
    try {
      const result = await this.adminService.listGroupsForUser({
        username,
        limit: query.limit,
        nextToken: query.nextToken,
      });

      return {
        groups: result.groups.map((group) => this.normalizeGroup(group)),
        nextToken: result.nextToken,
      };
    } catch (err) {
      this.logger.error('Error in listGroupsForUser', { err });
      throw err;
    }
  }

  /**
   * List all users in a group.
   */
  @Get('/groups/:groupName/users')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateParams(groupNameParamsSchema))
  @UseBefore(validateQuery(listUsersInGroupQuerySchema))
  @OpenAPI({ summary: 'List all users in a group' })
  async listUsersInGroup(
    @Param('groupName') groupName: string,
    @QueryParams() query: ListUsersInGroupQueryDto,
  ): Promise<{ users: NormalizedUser[]; nextToken?: string }> {
    this.logger.info('GET /admin/groups/:groupName/users', { groupName, query });
    try {
      const result = await this.adminService.listUsersInGroup({
        groupName,
        limit: query.limit,
        nextToken: query.nextToken,
      });

      return {
        users: result.users.map((user) => this.normalizeUser(user)),
        nextToken: result.nextToken,
      };
    } catch (err) {
      this.logger.error('Error in listUsersInGroup', { err });
      throw err;
    }
  }

  /**
   * Add a user to a group.
   */
  @Post('/groups/add-user')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateBody(adminAddUserToGroupBodySchema))
  @OpenAPI({ summary: 'Add a user to a group' })
  async addUserToGroup(@Body() body: AdminAddUserToGroupBody): Promise<{ success: boolean }> {
    this.logger.info('POST /admin/groups/add-user', {
      groupName: body.groupName,
      username: body.username,
    });
    try {
      return await this.adminService.addUserToGroup({
        groupName: body.groupName,
        username: body.username,
      });
    } catch (err) {
      this.logger.error('Error in addUserToGroup', { err });
      throw err;
    }
  }

  /**
   * Remove a user from a group.
   */
  @Post('/groups/remove-user')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateBody(adminRemoveUserFromGroupBodySchema))
  @OpenAPI({ summary: 'Remove a user from a group' })
  async removeUserFromGroup(
    @Body() body: AdminRemoveUserFromGroupBody,
  ): Promise<{ success: boolean }> {
    this.logger.info('POST /admin/groups/remove-user', {
      groupName: body.groupName,
      username: body.username,
    });
    try {
      return await this.adminService.removeUserFromGroup({
        groupName: body.groupName,
        username: body.username,
      });
    } catch (err) {
      this.logger.error('Error in removeUserFromGroup', { err });
      throw err;
    }
  }

  /**
   * List all groups in the Cognito user pool.
   */
  @Get('/groups')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateParams(listGroupsQuerySchema))
  @OpenAPI({ summary: 'List all groups' })
  async listGroups(
    @QueryParams() query: ListGroupsQueryDto,
  ): Promise<{ groups: NormalizedGroup[]; nextToken?: string }> {
    this.logger.info('GET /admin/groups', { query });
    try {
      const result = await this.adminService.listGroups(query);
      return {
        groups: result.groups.map((group) => this.normalizeGroup(group)),
        nextToken: result.nextToken,
      };
    } catch (err) {
      this.logger.error('Error in listGroups', { err });
      throw err;
    }
  }

  /**
   * Create a new group.
   */
  @Post('/groups')
  @HttpCode(201)
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateBody(createGroupBodySchema))
  @OpenAPI({ summary: 'Create a new group' })
  async createGroup(@Body() body: CreateGroupBody): Promise<{ group: NormalizedGroup }> {
    this.logger.info('POST /admin/groups', { groupName: body.groupName });
    try {
      const result = await this.adminService.createGroup(body);
      return {
        group: this.normalizeGroup(result.group),
      };
    } catch (err) {
      this.logger.error('Error in createGroup', { err });
      throw err;
    }
  }

  /**
   * Update a group.
   */
  @Patch('/groups/:groupName')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateParams(groupNameParamsSchema))
  @UseBefore(validateBody(updateGroupBodySchema))
  @OpenAPI({ summary: 'Update a group' })
  async updateGroup(
    @Param('groupName') groupName: string,
    @Body() body: UpdateGroupBody,
  ): Promise<{ group: NormalizedGroup }> {
    this.logger.info('PATCH /admin/groups/:groupName', { groupName });
    try {
      const result = await this.adminService.updateGroup(groupName, {
        ...body,
        groupName,
      });
      return {
        group: this.normalizeGroup(result.group),
      };
    } catch (err) {
      this.logger.error('Error in updateGroup', { err });
      throw err;
    }
  }

  /**
   * Delete a group.
   */
  @Delete('/groups/:groupName')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateParams(groupNameParamsSchema))
  @OpenAPI({ summary: 'Delete a group' })
  async deleteGroup(@Param('groupName') groupName: string): Promise<{ success: boolean }> {
    this.logger.info('DELETE /admin/groups/:groupName', { groupName });
    try {
      return await this.adminService.deleteGroup({ groupName });
    } catch (err) {
      this.logger.error('Error in deleteGroup', { err });
      throw err;
    }
  }

  /**
   * Admin authenticate a user.
   */
  @Post('/auth/login')
  @UseBefore(validateBody(adminAuthBodySchema))
  @OpenAPI({ summary: 'Admin authenticate a user' })
  async adminLogin(@Body() body: AdminAuthBody): Promise<AdminInitiateAuthResult> {
    this.logger.info('POST /admin/auth/login', { username: body.username });
    try {
      return await this.adminService.adminLogin(body);
    } catch (err) {
      this.logger.error('Error in adminLogin', { err });
      throw err;
    }
  }
}
