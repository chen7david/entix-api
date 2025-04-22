import { Injectable } from '@shared/utils/ioc.util';
import { LoggerService, Logger } from '@shared/services/logger/logger.service';
import { validateBody } from '@shared/middleware/validation.middleware';
import { CreateUserDto, UpdateUserDto } from '@domains/user/user.dto';
import { UserRepository } from '@domains/user/user.repository';
import { User } from '@domains/user/user.model';
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
} from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

/**
 * UsersController handles user-related endpoints.
 */
@Injectable()
@JsonController('/v1/users')
export class UsersController {
  private readonly logger: Logger;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly userRepository: UserRepository,
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
    responses: {
      '200': {
        description: 'A list of users',
        content: {
          'application/json': {
            schema: { type: 'array', items: { $ref: '#/components/schemas/User' } },
          },
        },
      },
    },
    tags: ['Users'],
  })
  // TODO: Use a runtime class or Zod-to-JSON-schema utility for @ResponseSchema if available
  async getAll(): Promise<User[]> {
    this.logger.info('Fetching all users');
    return this.userRepository.getAll();
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
      '200': {
        description: 'The user object',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/User' },
          },
        },
      },
      '404': { description: 'User not found' },
    },
    tags: ['Users'],
  })
  // TODO: Use a runtime class or Zod-to-JSON-schema utility for @ResponseSchema if available
  async getById(@Param('id') id: number): Promise<User> {
    this.logger.info({ id }, 'Fetching user by ID');
    return this.userRepository.getById(id);
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
      '200': {
        description: 'The created user',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/User' },
          },
        },
      },
      '400': { description: 'Invalid input' },
    },
    tags: ['Users'],
  })
  // TODO: Use a runtime class or Zod-to-JSON-schema utility for @ResponseSchema if available
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.info({ email: createUserDto.email }, 'Creating user');
    return this.userRepository.create(createUserDto);
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
      '200': {
        description: 'The updated user',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/User' },
          },
        },
      },
      '404': { description: 'User not found' },
    },
    tags: ['Users'],
  })
  // TODO: Use a runtime class or Zod-to-JSON-schema utility for @ResponseSchema if available
  async update(@Param('id') id: number, @Body() data: UpdateUserDto): Promise<User> {
    this.logger.info({ id }, 'Updating user');
    return this.userRepository.update(id, data);
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
    await this.userRepository.delete(id);
  }
}
