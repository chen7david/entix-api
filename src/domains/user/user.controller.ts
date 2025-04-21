import { Injectable } from '@shared/utils/ioc.util';
import { LoggerService, Logger } from '@shared/services/logger/logger.service';
import { validateBody } from '@shared/middleware/validation.middleware';
import { CreateUserDto } from '@domains/user/user.dto';
import { UserRepository } from '@domains/user/user.repository';
import { User, UserUpdatePayload } from '@domains/user/user.model';
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
  async getAll(): Promise<User[]> {
    this.logger.info('Fetching all users');
    return this.userRepository.getAll();
  }

  /**
   * Get a user by ID.
   */
  @Get('/:id')
  async getById(@Param('id') id: number): Promise<User> {
    this.logger.info({ id }, 'Fetching user by ID');
    return this.userRepository.getById(id);
  }

  /**
   * Create a new user.
   */
  @Post('/')
  @UseBefore(validateBody(CreateUserDto))
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.info({ email: createUserDto.email }, 'Creating user');
    return this.userRepository.create(createUserDto);
  }

  /**
   * Update a user by ID.
   */
  @Put('/:id')
  async update(@Param('id') id: number, @Body() data: UserUpdatePayload): Promise<User> {
    this.logger.info({ id }, 'Updating user');
    return this.userRepository.update(id, data);
  }

  /**
   * Delete a user by ID.
   */
  @Delete('/:id')
  @OnUndefined(204)
  async delete(@Param('id') id: number): Promise<void> {
    this.logger.info({ id }, 'Deleting user');
    await this.userRepository.delete(id);
  }
}
