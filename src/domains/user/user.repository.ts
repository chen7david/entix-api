import { Injectable } from '@shared/utils/ioc.util';
import { DatabaseService } from '@shared/services/database/database.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import {
  usersTable,
  UserEntity,
  userRolesTable,
  CreateUserRoleEntity,
} from '@domains/user/user.schema';
import { UserId } from '@domains/user/user.model';
import { BaseRepository } from '@shared/repositories/base.repository';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { rolesTable, RoleEntity } from '@domains/role/role.schema';
import { RoleId } from '@domains/role/role.model';

/**
 * Repository for user data access, extending the BaseRepository.
 * Handles specific user-related operations and provides concrete table/column info.
 */
@Injectable()
export class UserRepository extends BaseRepository<typeof usersTable, UserEntity, UserId> {
  // Provide concrete implementations for abstract properties
  protected readonly table = usersTable;
  protected readonly idColumn = usersTable.id;
  // Specify the soft delete column for the User domain
  protected readonly deletedAtColumn = usersTable.deletedAt;

  /**
   * Creates an instance of UserRepository.
   * @param dbService - The DatabaseService instance, passed to the base repository.
   * @param loggerService - The LoggerService instance for logging.
   */
  constructor(
    protected readonly dbService: DatabaseService,
    protected readonly loggerService: LoggerService,
  ) {
    super(dbService, loggerService); // Pass both services to the base class constructor
  }

  // All other basic CRUD methods (create, findById, findAll, update)
  // are inherited from BaseRepository.

  /**
   * Retrieves all roles assigned to a specific user.
   * @param userId The ID of the user.
   * @returns A promise that resolves to an array of RoleEntity.
   */
  async getRolesForUser(userId: UserId): Promise<RoleEntity[]> {
    this.loggerService.info('Getting roles for user', { userId });
    return this.dbService.db
      .select({
        id: rolesTable.id,
        name: rolesTable.name,
        createdAt: rolesTable.createdAt,
        updatedAt: rolesTable.updatedAt,
        deletedAt: rolesTable.deletedAt, // Include for filtering if necessary, though RoleDto will omit
      })
      .from(rolesTable)
      .innerJoin(userRolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(and(eq(userRolesTable.userId, userId), isNull(rolesTable.deletedAt))) // Only active roles
      .orderBy(desc(rolesTable.name));
  }

  /**
   * Assigns a role to a user.
   * @param userId The ID of the user.
   * @param roleId The ID of the role.
   */
  async assignRole(userId: UserId, roleId: RoleId): Promise<void> {
    this.loggerService.info('Assigning role to user', { userId, roleId });
    const data: CreateUserRoleEntity = { userId, roleId };
    await this.dbService.db.insert(userRolesTable).values(data).onConflictDoNothing(); // Ignore if already assigned
  }

  /**
   * Removes a role from a user.
   * @param userId The ID of the user.
   * @param roleId The ID of the role.
   */
  async removeRole(userId: UserId, roleId: RoleId): Promise<void> {
    this.loggerService.info('Removing role from user', { userId, roleId });
    await this.dbService.db
      .delete(userRolesTable)
      .where(and(eq(userRolesTable.userId, userId), eq(userRolesTable.roleId, roleId)));
  }

  // Add any user-specific methods here if needed in the future.
  // For example:
  // async findByEmail(email: string): Promise<User | null> { ... }
  async findByCognitoSub(cognitoSub: string): Promise<UserEntity | null> {
    this.loggerService.info('Finding user by Cognito Sub', { cognitoSub });
    const users = await this.dbService.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.cognito_sub, cognitoSub));
    return users[0] || null;
  }
}
