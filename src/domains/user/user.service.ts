import { Injectable } from '@shared/utils/ioc.util';
import { Logger } from '@shared/types/logger.type';
import { LoggerService } from '@shared/services/logger/logger.service';
import { UserRepository } from '@domains/user/user.repository';
import { CreateUserDto, UpdateUserDto, UserDto } from '@domains/user/user.dto';
import { NotFoundError } from '@shared/utils/error/error.util';
import { User } from '@domains/user/user.model';

/**
 * Service responsible for user-related business logic.
 * Acts as an intermediary between controllers and the repository.
 */
@Injectable()
export class UserService {
  private readonly logger: Logger;

  /**
   * Creates an instance of UserService.
   * @param loggerService - Logger service for creating child loggers
   * @param userRepository - Repository for user data access
   */
  constructor(
    private readonly loggerService: LoggerService,
    private readonly userRepository: UserRepository,
  ) {
    this.logger = this.loggerService.component('UserService');
  }

  /**
   * Maps a User entity to a UserDto
   * @param user - The User entity to map
   * @returns A UserDto object
   */
  private mapToUserDto(user: User): UserDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      preferredLanguage: user.preferredLanguage,
      cognitoSub: user.cognitoSub,
      tenantId: user.tenantId,
      isDisabled: user.isDisabled,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }

  /**
   * Retrieves all users.
   * @returns Promise resolving to an array of UserDto objects
   */
  async findAll(): Promise<UserDto[]> {
    this.logger.info('Finding all users');
    const users = await this.userRepository.findAll();
    return users.map((user) => this.mapToUserDto(user));
  }

  /**
   * Retrieves a user by their ID.
   * @param id - The ID of the user to retrieve
   * @returns Promise resolving to the UserDto object
   * @throws NotFoundError if user doesn't exist
   */
  async findById(id: string): Promise<UserDto> {
    this.logger.info('Finding user by ID', { id });
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
    return this.mapToUserDto(user);
  }

  /**
   * Creates a new user.
   * @param data - Data for creating the user
   * @returns Promise resolving to the created UserDto object
   */
  async create(data: CreateUserDto): Promise<UserDto> {
    this.logger.info('Creating user', { username: data.username, email: data.email });
    const user = await this.userRepository.create(data);
    return this.mapToUserDto(user);
  }

  /**
   * Updates an existing user.
   * @param id - ID of the user to update
   * @param data - Data for updating the user
   * @returns Promise resolving to the updated UserDto object
   * @throws NotFoundError if user doesn't exist
   */
  async update(id: string, data: UpdateUserDto): Promise<UserDto> {
    this.logger.info('Updating user', { id });
    // Verify user exists before update
    await this.findById(id);
    const user = await this.userRepository.update(id, data);
    return this.mapToUserDto(user);
  }

  /**
   * Deletes a user by their ID.
   * @param id - ID of the user to delete
   * @throws NotFoundError if user doesn't exist
   */
  async delete(id: string): Promise<void> {
    this.logger.info('Deleting user', { id });
    // Verify user exists before deletion
    await this.findById(id);
    await this.userRepository.delete(id);
  }
}
