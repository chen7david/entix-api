import { Injectable } from '@shared/utils/ioc.util';
import { LoggerService, Logger } from '@shared/services/logger/logger.service';
import { UserRepository } from '@domains/user/user.repository';
import { User, UserId } from '@domains/user/user.model';
import { CreateUserDto, UpdateUserDto } from '@domains/user/user.dto';
import { NotFoundError } from '@shared/utils/error/error.util';

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
   * Retrieves all users.
   * @returns Promise resolving to an array of User objects
   */
  async findAll(): Promise<User[]> {
    this.logger.info('Finding all users');
    return this.userRepository.findAll();
  }

  /**
   * Retrieves a user by their ID.
   * @param id - The ID of the user to retrieve
   * @returns Promise resolving to the User object
   * @throws NotFoundError if user doesn't exist
   */
  async findById(id: UserId): Promise<User> {
    this.logger.info('Finding user by ID', { id });
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Creates a new user.
   * @param data - Data for creating the user
   * @returns Promise resolving to the created User object
   */
  async create(data: CreateUserDto): Promise<User> {
    this.logger.info('Creating user', { email: data.email });
    return this.userRepository.create(data);
  }

  /**
   * Updates an existing user.
   * @param id - ID of the user to update
   * @param data - Data for updating the user
   * @returns Promise resolving to the updated User object
   * @throws NotFoundError if user doesn't exist
   */
  async update(id: UserId, data: UpdateUserDto): Promise<User> {
    this.logger.info('Updating user', { id });

    // Verify user exists before update
    await this.findById(id);

    return this.userRepository.update(id, data);
  }

  /**
   * Deletes a user by their ID.
   * @param id - ID of the user to delete
   * @throws NotFoundError if user doesn't exist
   */
  async delete(id: UserId): Promise<void> {
    this.logger.info('Deleting user', { id });

    // Verify user exists before deletion
    await this.findById(id);

    await this.userRepository.delete(id);
  }
}
