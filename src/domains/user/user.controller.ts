import { Injectable } from '@shared/utils/ioc.util';
import { Logger } from '@shared/types/logger.type';
import { LoggerService } from '@shared/services/logger/logger.service';
import { validateBody, validateParams } from '@shared/middleware/validation.middleware';
import {
  CreateUserDto,
  UpdateUserDto,
  UserIdParamDto,
  UserDto,
  AssignRoleToUserDto,
  RemoveRoleFromUserParamsDto,
} from '@domains/user/user.dto';
import { User } from '@domains/user/user.model';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { UserService } from '@domains/user/user.service';
import {
  JsonController,
  Get,
  UseBefore,
  Post,
  Body,
  Param,
  Put,
  Delete,
  OnUndefined,
  HttpCode,
} from 'routing-controllers';
import { RoleDto } from '@domains/role/role.dto';

/** Helper to map User entity to UserDto */
export const toUserDto = (user: User): UserDto => ({
  id: user.id,
  email: user.email,
  username: user.username,
  cognito_sub: user.cognito_sub,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  // password and deletedAt are omitted in UserDto
});

/**
 * UsersController handles user-related endpoints.
 */
@JsonController('/api/v1/users')
@Injectable()
export class UsersController {
  private readonly logger: Logger;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly userService: UserService,
  ) {
    this.logger = this.loggerService.component('UsersController');
  }

  /**
   * Get all users.
   */
  @OpenAPI({
    summary: 'Get all users',
    description: 'Returns a list of all users in the system.',
    tags: ['Users'],
  })
  @ResponseSchema('UserDto', { isArray: true })
  @Get('/')
  async getAll(): Promise<UserDto[]> {
    this.logger.info('Fetching all users');
    const users = await this.userService.findAll();
    return users.map(toUserDto);
  }

  /**
   * Get a user by ID.
   */
  @OpenAPI({
    summary: 'Get user by ID',
    description: 'Fetch a single user by their unique ID.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'The UUID of the user to retrieve',
      },
    ],
    responses: {
      '404': { description: 'User not found' },
    },
    tags: ['Users'],
  })
  @ResponseSchema('UserDto', { statusCode: 200, description: 'The user object' })
  @Get('/:id')
  @UseBefore(validateParams(UserIdParamDto))
  async getById(@Param('id') id: string): Promise<UserDto> {
    this.logger.info('Fetching user by ID', { id });
    const user = await this.userService.findById(id);
    return toUserDto(user);
  }

  /**
   * Create a new user.
   */
  @OpenAPI({
    summary: 'Create user',
    description: 'Create a new user with the provided details.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/CreateUserDto' },
        },
      },
    },
    responses: {
      '400': { description: 'Invalid input' },
    },
    tags: ['Users'],
  })
  @ResponseSchema('UserDto', { statusCode: 201, description: 'The created user' })
  @Post('/')
  @HttpCode(201)
  @UseBefore(validateBody(CreateUserDto))
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    this.logger.info('Creating user', { email: createUserDto.email });
    const { user: createdUser } = await this.userService.create(createUserDto);
    return toUserDto(createdUser);
  }

  /**
   * Update a user by ID.
   */
  @OpenAPI({
    summary: 'Update user',
    description: 'Update an existing user by their unique ID.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'The UUID of the user to update',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/UpdateUserDto' },
        },
      },
    },
    responses: {
      '404': { description: 'User not found' },
    },
    tags: ['Users'],
  })
  @ResponseSchema('UserDto')
  @HttpCode(200)
  @Put('/:id')
  @UseBefore(validateParams(UserIdParamDto))
  @UseBefore(validateBody(UpdateUserDto))
  async update(@Param('id') id: string, @Body() data: UpdateUserDto): Promise<UserDto> {
    this.logger.info('Updating user', { id });
    const user = await this.userService.update(id, data);
    return toUserDto(user);
  }

  /**
   * Delete a user by ID.
   */
  @OpenAPI({
    summary: 'Delete user',
    description: 'Delete a user by their unique ID. Returns 204 if successful.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'The UUID of the user to delete',
      },
    ],
    responses: {
      '204': { description: 'User deleted successfully' },
      '404': { description: 'User not found' },
    },
    tags: ['Users'],
  })
  @Delete('/:id')
  @UseBefore(validateParams(UserIdParamDto))
  @OnUndefined(204)
  async delete(@Param('id') id: string): Promise<void> {
    this.logger.info('Deleting user', { id });
    await this.userService.delete(id);
  }

  /**
   * Get all roles for a specific user.
   */
  @OpenAPI({
    summary: 'Get roles for a user',
    description: 'Returns a list of all roles assigned to a specific user.',
    tags: ['Users', 'Roles'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'The UUID of the user',
      },
    ],
  })
  @ResponseSchema('RoleDto', { isArray: true, description: 'List of roles for the user' })
  @Get('/:id/roles')
  @UseBefore(validateParams(UserIdParamDto))
  async getRolesForUser(@Param('id') userId: string): Promise<RoleDto[]> {
    this.logger.info('Fetching roles for user', { userId });
    return this.userService.getRolesForUser(userId);
  }

  /**
   * Assign a role to a user.
   */
  @OpenAPI({
    summary: 'Assign role to user',
    description: 'Assigns a specific role to a user.',
    tags: ['Users', 'Roles'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'The UUID of the user',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/AssignRoleToUserDto' },
        },
      },
    },
    responses: {
      '204': { description: 'Role assigned successfully' },
      '404': { description: 'User or Role not found' },
    },
  })
  @Post('/:id/roles')
  @UseBefore(validateParams(UserIdParamDto))
  @UseBefore(validateBody(AssignRoleToUserDto))
  @OnUndefined(204)
  async assignRoleToUser(
    @Param('id') userId: string,
    @Body() assignDto: AssignRoleToUserDto,
  ): Promise<void> {
    this.logger.info('Assigning role to user', { userId, roleId: assignDto.roleId });
    await this.userService.assignRoleToUser(userId, assignDto.roleId);
  }

  /**
   * Remove a role from a user.
   */
  @OpenAPI({
    summary: 'Remove role from user',
    description: 'Removes a specific role from a user.',
    tags: ['Users', 'Roles'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'The UUID of the user',
      },
      {
        name: 'roleId',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
        description: 'The ID of the role to remove',
      },
    ],
    responses: {
      '204': { description: 'Role removed successfully' },
      '404': { description: 'User not found or Role not found for user' },
    },
  })
  @Delete('/:id/roles/:roleId')
  @UseBefore(validateParams(RemoveRoleFromUserParamsDto))
  @OnUndefined(204)
  async removeRoleFromUser(
    @Param('id') userId: string,
    @Param('roleId') roleId: number,
  ): Promise<void> {
    this.logger.info('Removing role from user', { userId, roleId });
    await this.userService.removeRoleFromUser(userId, roleId);
  }
}
