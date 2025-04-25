import { Injectable } from '@shared/utils/ioc.util';
import { LoggerService, Logger } from '@shared/services/logger/logger.service';
import { validateBody } from '@shared/middleware/validation.middleware';
import { CreateUserDto, UpdateUserDto } from '@domains/user/user.dto';
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
    this.logger = this.loggerService.child({ controller: 'UsersController' });
  }

  /**
   * Get all users.
   */
  @Get('/')
  @OpenAPI({
    summary: 'Get all users',
    description: 'Returns a list of all users in the system.',
    tags: ['Users'],
  })
  @ResponseSchema('UserDto', { isArray: true })
  async getAll(): Promise<User[]> {
    this.logger.info('Fetching all users');
    return this.userService.findAll();
  }

  /**
   * Get a user by ID.
   */
  @Get('/:id')
  @OpenAPI({
    summary: 'Get user by ID',
    description: 'Fetch a single user by their unique ID.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
        description: 'The ID of the user to retrieve',
      },
    ],
    responses: {
      '404': { description: 'User not found' },
    },
    tags: ['Users'],
  })
  @ResponseSchema('UserDto', { statusCode: 200, description: 'The user object' })
  async getById(@Param('id') id: number): Promise<User> {
    this.logger.info({ id }, 'Fetching user by ID');
    return this.userService.findById(id);
  }

  /**
   * Create a new user.
   */
  @Post('/')
  @UseBefore(validateBody(CreateUserDto))
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
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.info({ email: createUserDto.email }, 'Creating user');
    return this.userService.create(createUserDto);
  }

  /**
   * Update a user by ID.
   */
  @Put('/:id')
  @UseBefore(validateBody(UpdateUserDto))
  @OpenAPI({
    summary: 'Update user',
    description: 'Update an existing user by their unique ID.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
        description: 'The ID of the user to update',
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
  async update(@Param('id') id: number, @Body() data: UpdateUserDto): Promise<User> {
    this.logger.info({ id }, 'Updating user');
    return this.userService.update(id, data);
  }

  /**
   * Delete a user by ID.
   */
  @Delete('/:id')
  @OnUndefined(204)
  @OpenAPI({
    summary: 'Delete user',
    description: 'Delete a user by their unique ID. Returns 204 if successful.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
        description: 'The ID of the user to delete',
      },
    ],
    responses: {
      '204': { description: 'User deleted successfully' },
      '404': { description: 'User not found' },
    },
    tags: ['Users'],
  })
  async delete(@Param('id') id: number): Promise<void> {
    this.logger.info({ id }, 'Deleting user');
    await this.userService.delete(id);
  }
}
