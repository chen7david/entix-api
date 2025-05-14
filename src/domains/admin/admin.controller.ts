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
  ListUsersQueryDto,
  AdminCreateUserBody,
  AdminUpdateUserAttributesBody,
  AdminSetUserPasswordBody,
  ListGroupsQueryDto,
  CreateGroupBody,
  UpdateGroupBody,
  AdminAuthBody,
} from '@domains/admin/admin.dto';
import {
  ListUsersResult,
  AdminCreateUserResult,
  AdminGetUserResult,
  AdminUpdateUserAttributesResult,
  AdminDeleteUserResult,
  AdminDisableUserResult,
  AdminEnableUserResult,
  AdminResetUserPasswordResult,
  AdminSetUserPasswordResult,
  AdminConfirmSignUpResult,
  AdminAddUserToGroupResult,
  AdminRemoveUserFromGroupResult,
  CreateGroupResult,
  UpdateGroupResult,
  DeleteGroupResult,
  ListGroupsResult,
  AdminInitiateAuthResult,
} from '@shared/types/cognito-admin.type';

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
   * List all users in the Cognito user pool.
   */
  @Get('/users')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @UseBefore(validateParams(listUsersQuerySchema))
  @OpenAPI({ summary: 'List all users' })
  async listUsers(@QueryParams() query: ListUsersQueryDto): Promise<ListUsersResult> {
    this.logger.info('GET /admin/users', { query });
    try {
      return await this.adminService.listUsers(query);
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
  async createUser(@Body() body: AdminCreateUserBody): Promise<AdminCreateUserResult> {
    this.logger.info('POST /admin/users', { username: body.username });
    try {
      return await this.adminService.createUser(body);
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
  @OpenAPI({ summary: 'Get user details by username' })
  async getUser(@Param('username') username: string): Promise<AdminGetUserResult> {
    this.logger.info('GET /admin/users/:username', { username });
    try {
      return await this.adminService.getUser({ username });
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
  @UseBefore(validateBody(adminUpdateUserAttributesBodySchema))
  @OpenAPI({ summary: 'Update user attributes' })
  async updateUserAttributes(
    @Param('username') username: string,
    @Body() body: AdminUpdateUserAttributesBody,
  ): Promise<AdminUpdateUserAttributesResult> {
    this.logger.info('PATCH /admin/users/:username', { username });
    try {
      return await this.adminService.updateUserAttributes(username, {
        attributes: body.attributes,
        username,
      });
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
  @OpenAPI({ summary: 'Delete a user' })
  async deleteUser(@Param('username') username: string): Promise<AdminDeleteUserResult> {
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
  @OpenAPI({ summary: 'Disable a user' })
  async disableUser(@Param('username') username: string): Promise<AdminDisableUserResult> {
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
  @OpenAPI({ summary: 'Enable a user' })
  async enableUser(@Param('username') username: string): Promise<AdminEnableUserResult> {
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
  @OpenAPI({ summary: "Reset a user's password" })
  async resetUserPassword(
    @Param('username') username: string,
  ): Promise<AdminResetUserPasswordResult> {
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
  @UseBefore(validateBody(adminSetUserPasswordBodySchema))
  @OpenAPI({ summary: "Set a user's password" })
  async setUserPassword(
    @Param('username') username: string,
    @Body() body: AdminSetUserPasswordBody,
  ): Promise<AdminSetUserPasswordResult> {
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
  @OpenAPI({ summary: "Confirm a user's sign-up" })
  async confirmUserSignUp(@Param('username') username: string): Promise<AdminConfirmSignUpResult> {
    this.logger.info('POST /admin/users/:username/confirm', { username });
    try {
      return await this.adminService.confirmUserSignUp({ username });
    } catch (err) {
      this.logger.error('Error in confirmUserSignUp', { err });
      throw err;
    }
  }

  /**
   * Add a user to a group.
   */
  @Post('/groups/:groupName/users/:username')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @OpenAPI({ summary: 'Add a user to a group' })
  async addUserToGroup(
    @Param('groupName') groupName: string,
    @Param('username') username: string,
  ): Promise<AdminAddUserToGroupResult> {
    this.logger.info('POST /admin/groups/:groupName/users/:username', { groupName, username });
    try {
      return await this.adminService.addUserToGroup(groupName, username);
    } catch (err) {
      this.logger.error('Error in addUserToGroup', { err });
      throw err;
    }
  }

  /**
   * Remove a user from a group.
   */
  @Delete('/groups/:groupName/users/:username')
  @UseBefore(validateHeaders(adminAuthHeadersSchema))
  @OpenAPI({ summary: 'Remove a user from a group' })
  async removeUserFromGroup(
    @Param('groupName') groupName: string,
    @Param('username') username: string,
  ): Promise<AdminRemoveUserFromGroupResult> {
    this.logger.info('DELETE /admin/groups/:groupName/users/:username', { groupName, username });
    try {
      return await this.adminService.removeUserFromGroup(groupName, username);
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
  async listGroups(@QueryParams() query: ListGroupsQueryDto): Promise<ListGroupsResult> {
    this.logger.info('GET /admin/groups', { query });
    try {
      return await this.adminService.listGroups(query);
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
  async createGroup(@Body() body: CreateGroupBody): Promise<CreateGroupResult> {
    this.logger.info('POST /admin/groups', { groupName: body.groupName });
    try {
      return await this.adminService.createGroup(body);
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
  @UseBefore(validateBody(updateGroupBodySchema))
  @OpenAPI({ summary: 'Update a group' })
  async updateGroup(
    @Param('groupName') groupName: string,
    @Body() body: UpdateGroupBody,
  ): Promise<UpdateGroupResult> {
    this.logger.info('PATCH /admin/groups/:groupName', { groupName });
    try {
      return await this.adminService.updateGroup(groupName, {
        ...body,
        groupName,
      });
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
  @OpenAPI({ summary: 'Delete a group' })
  async deleteGroup(@Param('groupName') groupName: string): Promise<DeleteGroupResult> {
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
