import { Injectable } from '@shared/utils/ioc.util';
import { Logger } from '@shared/types/logger.type';
import { LoggerService } from '@shared/services/logger/logger.service';
import { validateBody, validateParams } from '@shared/middleware/validation.middleware';
import { CreateUserDto, UpdateUserDto, UserIdParamDto } from '@domains/user/user.dto';
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
  async getAll(): Promise<User[]> {
    this.logger.info('Fetching all users');
    return this.userService.findAll();
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
  async getById(@Param('id') id: string): Promise<User> {
    this.logger.info('Fetching user by ID', { id });
    return this.userService.findById(id);
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
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.info('Creating user', { email: createUserDto.email });
    return this.userService.create(createUserDto);
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
  @HttpCode(201)
  @Put('/:id')
  @UseBefore(validateParams(UserIdParamDto))
  @UseBefore(validateBody(UpdateUserDto))
  async update(@Param('id') id: string, @Body() data: UpdateUserDto): Promise<User> {
    this.logger.info('Updating user', { id });
    return this.userService.update(id, data);
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
}
