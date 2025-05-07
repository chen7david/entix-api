import { Injectable } from '@shared/utils/ioc.util';
import { DatabaseService } from '@shared/services/database/database.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import {
  rolesTable,
  RoleEntity,
  rolePermissionsTable,
  CreateRolePermissionEntity,
} from '@domains/role/role.schema';
import { RoleId } from '@domains/role/role.model';
import { BaseRepository } from '@shared/repositories/base.repository';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { permissionsTable, PermissionEntity } from '@domains/permission/permission.schema';
import { PermissionId } from '@domains/permission/permission.model';

/**
 * Repository for role data access, extending the BaseRepository.
 * Handles specific role-related operations.
 */
@Injectable()
export class RoleRepository extends BaseRepository<typeof rolesTable, RoleEntity, RoleId> {
  protected readonly table = rolesTable;
  protected readonly idColumn = rolesTable.id;
  protected readonly deletedAtColumn = rolesTable.deletedAt;

  /**
   * Creates an instance of RoleRepository.
   * @param dbService - The DatabaseService instance.
   * @param loggerService - The LoggerService instance.
   */
  constructor(
    protected readonly dbService: DatabaseService,
    protected readonly loggerService: LoggerService,
  ) {
    super(dbService, loggerService);
  }

  /**
   * Finds a role by its name, excluding soft-deleted roles.
   * @param name - The name of the role to find.
   * @returns Promise resolving to the RoleEntity or null if not found.
   */
  async findByName(name: string): Promise<RoleEntity | null> {
    this.loggerService.info('Finding role by name', {
      name,
      table: this.table?._?.name ?? 'roles',
    });
    const result = await this.dbService.db
      .select()
      .from(this.table)
      .where(and(eq(this.table.name, name), isNull(this.deletedAtColumn)))
      .limit(1);
    return result[0] || null;
  }

  /**
   * Retrieves all permissions assigned to a specific role.
   * @param roleId The ID of the role.
   * @returns A promise that resolves to an array of PermissionEntity.
   */
  async getPermissionsForRole(roleId: RoleId): Promise<PermissionEntity[]> {
    this.loggerService.info('Getting permissions for role', { roleId });
    return this.dbService.db
      .select({
        id: permissionsTable.id,
        name: permissionsTable.name,
        createdAt: permissionsTable.createdAt,
        updatedAt: permissionsTable.updatedAt,
        deletedAt: permissionsTable.deletedAt,
      })
      .from(permissionsTable)
      .innerJoin(rolePermissionsTable, eq(rolePermissionsTable.permissionId, permissionsTable.id))
      .where(and(eq(rolePermissionsTable.roleId, roleId), isNull(permissionsTable.deletedAt)))
      .orderBy(desc(permissionsTable.name));
  }

  /**
   * Assigns a permission to a role.
   * @param roleId The ID of the role.
   * @param permissionId The ID of the permission.
   * @returns A promise that resolves when the operation is complete.
   */
  async assignPermission(roleId: RoleId, permissionId: PermissionId): Promise<void> {
    this.loggerService.info('Assigning permission to role', { roleId, permissionId });
    const data: CreateRolePermissionEntity = { roleId, permissionId };
    await this.dbService.db.insert(rolePermissionsTable).values(data).onConflictDoNothing(); // Ignore if already assigned
  }

  /**
   * Removes a permission from a role.
   * @param roleId The ID of the role.
   * @param permissionId The ID of the permission.
   * @returns A promise that resolves when the operation is complete.
   */
  async removePermission(roleId: RoleId, permissionId: PermissionId): Promise<void> {
    this.loggerService.info('Removing permission from role', { roleId, permissionId });
    await this.dbService.db
      .delete(rolePermissionsTable)
      .where(
        and(
          eq(rolePermissionsTable.roleId, roleId),
          eq(rolePermissionsTable.permissionId, permissionId),
        ),
      );
  }
}
