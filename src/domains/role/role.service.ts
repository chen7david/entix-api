import { Injectable } from '@shared/utils/ioc.util';
import { Logger } from '@shared/types/logger.type';
import { LoggerService } from '@shared/services/logger/logger.service';
import { RoleRepository } from '@domains/role/role.repository';
import { Role, RoleId } from '@domains/role/role.model';
import { CreateRoleDto, UpdateRoleDto } from '@domains/role/role.dto';
import { PermissionDto } from '@domains/permission/permission.dto';
import { NotFoundError, ConflictError } from '@shared/utils/error/error.util';
import { CreateRoleEntity } from '@domains/role/role.schema';
import { PermissionService } from '@domains/permission/permission.service';
import { PermissionId as ActualPermissionId } from '@domains/permission/permission.model';

/**
 * Service responsible for role-related business logic.
 */
@Injectable()
export class RoleService {
  private readonly logger: Logger;

  // eslint-disable-next-line max-params
  constructor(
    private readonly loggerService: LoggerService,
    private readonly roleRepository: RoleRepository,
    private readonly permissionService: PermissionService,
  ) {
    this.logger = this.loggerService.component('RoleService');
  }

  /**
   * Retrieves all non-deleted roles.
   * @returns Promise resolving to an array of Role objects.
   */
  async findAll(): Promise<Role[]> {
    this.logger.info('Finding all roles');
    return this.roleRepository.findAll(); // BaseRepository.findAll handles soft delete filtering
  }

  /**
   * Retrieves a role by its ID.
   * @param id - The ID of the role to retrieve.
   * @returns Promise resolving to the Role object.
   * @throws NotFoundError if role doesn't exist or is soft-deleted.
   */
  async findById(id: RoleId): Promise<Role> {
    this.logger.info('Finding role by ID', { id });
    const role = await this.roleRepository.findById(id); // BaseRepository.findById handles soft delete
    if (!role) {
      throw new NotFoundError(`Role with ID ${id} not found`);
    }
    return role;
  }

  /**
   * Creates a new role.
   * Checks for name uniqueness among non-deleted roles.
   * @param data - Data for creating the role (name).
   * @returns Promise resolving to the created Role object.
   * @throws ConflictError if a role with the same name already exists.
   */
  async create(data: CreateRoleDto): Promise<Role> {
    this.logger.info('Creating role', { name: data.name });

    const existingRole = await this.roleRepository.findByName(data.name);
    if (existingRole) {
      throw new ConflictError(`Role with name '${data.name}' already exists.`);
    }
    // CreateRoleEntity type for repository expects only name, other fields are auto-managed
    const roleToCreate: CreateRoleEntity = { name: data.name };
    return this.roleRepository.create(roleToCreate);
  }

  /**
   * Updates an existing role.
   * Checks for name uniqueness if name is being changed.
   * @param id - ID of the role to update.
   * @param data - Data for updating the role (optional name).
   * @returns Promise resolving to the updated Role object.
   * @throws NotFoundError if role doesn't exist.
   * @throws ConflictError if new name conflicts with an existing role.
   */
  async update(id: RoleId, data: UpdateRoleDto): Promise<Role> {
    this.logger.info('Updating role', { id, data });
    const roleToUpdate = await this.findById(id); // Ensures role exists

    if (data.name && data.name !== roleToUpdate.name) {
      const existingRoleWithNewName = await this.roleRepository.findByName(data.name);
      if (existingRoleWithNewName && existingRoleWithNewName.id !== id) {
        throw new ConflictError(`Another role with name '${data.name}' already exists.`);
      }
    }

    return this.roleRepository.update(id, data); // BaseRepository.update handles partial updates
  }

  /**
   * Deletes a role by its ID (soft delete).
   * @param id - ID of the role to delete.
   * @throws NotFoundError if role doesn't exist.
   */
  async delete(id: RoleId): Promise<void> {
    this.logger.info('Deleting role (soft delete)', { id });
    await this.findById(id); // Ensures role exists before attempting delete
    await this.roleRepository.delete(id); // BaseRepository.delete performs soft delete
    this.logger.info('Role soft-deleted successfully', { id });
  }

  /**
   * Retrieves all permissions assigned to a specific role.
   * @param roleId The ID of the role.
   * @returns Promise resolving to an array of PermissionDto objects.
   * @throws NotFoundError if the role doesn't exist.
   */
  async getPermissionsForRole(roleId: RoleId): Promise<PermissionDto[]> {
    this.logger.info('Getting permissions for role', { roleId });
    await this.findById(roleId); // Ensure role exists
    const permissions = await this.roleRepository.getPermissionsForRole(roleId);
    // Manually map PermissionEntity to PermissionDto if needed (e.g. omitting fields)
    // For now, assuming PermissionEntity is compatible enough or direct pass-through is okay if PermissionDto matches structure.
    // If PermissionDto definition in role.dto.ts is from PermissionEntitySchema.omit, this is mostly fine.
    // It would be cleaner if RoleService returned PermissionEntity[] and controller mapped to PermissionDto[].
    // However, for now, let's assume direct compatibility for simplicity if PermissionDto is defined generically.
    // Let's create a proper PermissionDto from permission.dto.ts for return type clarity.
    return permissions.map((p) => ({
      id: p.id,
      name: p.name,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      // deletedAt is omitted in PermissionDto from permission.dto.ts
    }));
  }

  /**
   * Assigns a permission to a role.
   * @param roleId The ID of the role.
   * @param permissionId The ID of the permission to assign.
   * @returns Promise that resolves when the assignment is complete.
   * @throws NotFoundError if the role or permission doesn't exist.
   */
  async assignPermissionToRole(roleId: RoleId, permissionId: ActualPermissionId): Promise<void> {
    this.logger.info('Assigning permission to role', { roleId, permissionId });
    await this.findById(roleId); // Ensure role exists
    await this.permissionService.findById(permissionId); // Ensure permission exists
    await this.roleRepository.assignPermission(roleId, permissionId);
    this.logger.info('Permission assigned to role successfully', { roleId, permissionId });
  }

  /**
   * Removes a permission from a role.
   * @param roleId The ID of the role.
   * @param permissionId The ID of the permission to remove.
   * @returns Promise that resolves when the removal is complete.
   * @throws NotFoundError if the role doesn't exist (permission existence not strictly checked for removal).
   */
  async removePermissionFromRole(roleId: RoleId, permissionId: ActualPermissionId): Promise<void> {
    this.logger.info('Removing permission from role', { roleId, permissionId });
    await this.findById(roleId); // Ensure role exists
    // We don't strictly need to check if permissionId exists before trying to remove the link.
    // The DB operation will just do nothing if the link isn't there.
    await this.roleRepository.removePermission(roleId, permissionId);
    this.logger.info('Permission removed from role successfully', { roleId, permissionId });
  }
}
