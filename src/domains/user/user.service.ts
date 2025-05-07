import { Injectable } from '@shared/utils/ioc.util';
import { Logger } from '@shared/types/logger.type';
import { LoggerService } from '@shared/services/logger/logger.service';
import { UserRepository } from '@domains/user/user.repository';
import { User, UserId } from '@domains/user/user.model';
import { CreateUserDto, UpdateUserDto } from '@domains/user/user.dto';
import { NotFoundError, ConflictError, BadRequestError } from '@shared/utils/error/error.util';
import { CognitoService } from '@shared/services/cognito/cognito.service';
import { mapCognitoErrorToAppError } from '@shared/utils/error/cognito-error.util';
import { CreateUserEntity } from '@domains/user/user.schema';
import { RoleDto } from '@domains/role/role.dto';
import { RoleService } from '@domains/role/role.service';
import { RoleId } from '@domains/role/role.model';

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
   * @param cognitoService - Service for Cognito interactions
   * @param roleService - Service for role-related operations
   */
  // eslint-disable-next-line max-params
  constructor(
    private readonly loggerService: LoggerService,
    private readonly userRepository: UserRepository,
    private readonly cognitoService: CognitoService,
    private readonly roleService: RoleService,
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
   * Creates a new user in Cognito and then in the local database.
   * @param data - Data for creating the user (email, username, password)
   * @returns Promise resolving to the created User object (local representation)
   * @throws ConflictError if username or email already exists in Cognito or locally
   * @throws BadRequestError for invalid parameters (e.g., password policy)
   */
  async create(data: CreateUserDto): Promise<User> {
    this.logger.info('Attempting to create user in Cognito', {
      username: data.username,
      email: data.email,
    });

    let cognitoUserSub: string | undefined;

    try {
      const cognitoResult = await this.cognitoService.signUp({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      cognitoUserSub = cognitoResult.sub;
      this.logger.info('User successfully created in Cognito', {
        username: data.username,
        sub: cognitoUserSub,
      });
    } catch (error) {
      this.logger.error('Cognito signUp failed', { error });
      throw mapCognitoErrorToAppError(error);
    }

    if (!cognitoUserSub) {
      this.logger.error('Cognito user sub is undefined after signUp call', {
        username: data.username,
      });
      throw new BadRequestError('Failed to retrieve Cognito user identifier after sign up.');
    }

    const userToCreate: Omit<
      CreateUserEntity,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isActive' | 'password'
    > &
      Partial<Pick<CreateUserEntity, 'isActive' | 'password'>> = {
      email: data.email,
      username: data.username,
      cognito_sub: cognitoUserSub,
    };

    try {
      this.logger.info('Creating user in local database', {
        username: data.username,
        cognito_sub: cognitoUserSub,
      });
      const newUser = await this.userRepository.create(userToCreate as CreateUserEntity);
      this.logger.info('User successfully created in local database', {
        id: newUser.id,
        username: newUser.username,
      });
      return newUser;
    } catch (dbError: unknown) {
      this.logger.error('Local database user creation failed', {
        error: dbError,
        username: data.username,
      });
      if (
        typeof dbError === 'object' &&
        dbError !== null &&
        'code' in dbError &&
        (dbError as { code: unknown }).code === '23505'
      ) {
        throw new ConflictError(
          `User with username '${data.username}' or email '${data.email}' already exists.`,
        );
      }
      throw dbError;
    }
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

  /**
   * Retrieves all roles assigned to a specific user.
   * @param userId The ID of the user.
   * @returns Promise resolving to an array of RoleDto objects.
   * @throws NotFoundError if the user doesn't exist.
   */
  async getRolesForUser(userId: UserId): Promise<RoleDto[]> {
    this.logger.info('Getting roles for user', { userId });
    await this.findById(userId); // Ensure user exists
    const roles = await this.userRepository.getRolesForUser(userId);
    // Map RoleEntity to RoleDto (omitting deletedAt etc.)
    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  /**
   * Assigns a role to a user.
   * @param userId The ID of the user.
   * @param roleId The ID of the role to assign.
   * @throws NotFoundError if the user or role doesn't exist.
   */
  async assignRoleToUser(userId: UserId, roleId: RoleId): Promise<void> {
    this.logger.info('Assigning role to user', { userId, roleId });
    await this.findById(userId); // Ensure user exists
    await this.roleService.findById(roleId); // Ensure role exists
    await this.userRepository.assignRole(userId, roleId);
    this.logger.info('Role assigned to user successfully', { userId, roleId });
  }

  /**
   * Removes a role from a user.
   * @param userId The ID of the user.
   * @param roleId The ID of the role to remove.
   * @throws NotFoundError if the user doesn't exist.
   */
  async removeRoleFromUser(userId: UserId, roleId: RoleId): Promise<void> {
    this.logger.info('Removing role from user', { userId, roleId });
    await this.findById(userId); // Ensure user exists
    await this.userRepository.removeRole(userId, roleId);
    this.logger.info('Role removed from user successfully', { userId, roleId });
  }
}
