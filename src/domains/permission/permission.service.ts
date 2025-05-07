import { Injectable } from '@shared/utils/ioc.util';
import { Logger } from '@shared/types/logger.type';
import { LoggerService } from '@shared/services/logger/logger.service';
import { PermissionRepository } from '@domains/permission/permission.repository';
import { Permission, PermissionId } from '@domains/permission/permission.model';
import { CreatePermissionDto, UpdatePermissionDto } from '@domains/permission/permission.dto';
import { NotFoundError, ConflictError } from '@shared/utils/error/error.util';
import { CreatePermissionEntity } from '@domains/permission/permission.schema';

/**
 * Service responsible for permission-related business logic.
 */
@Injectable()
export class PermissionService {
  private readonly logger: Logger;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly permissionRepository: PermissionRepository,
  ) {
    this.logger = this.loggerService.component('PermissionService');
  }

  /**
   * Retrieves all non-deleted permissions.
   */
  async findAll(): Promise<Permission[]> {
    this.logger.info('Finding all permissions');
    return this.permissionRepository.findAll();
  }

  /**
   * Retrieves a permission by its ID.
   */
  async findById(id: PermissionId): Promise<Permission> {
    this.logger.info('Finding permission by ID', { id });
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundError(`Permission with ID ${id} not found`);
    }
    return permission;
  }

  /**
   * Creates a new permission.
   */
  async create(data: CreatePermissionDto): Promise<Permission> {
    this.logger.info('Creating permission', { name: data.name });
    const existing = await this.permissionRepository.findByName(data.name);
    if (existing) {
      throw new ConflictError(`Permission with name '${data.name}' already exists.`);
    }
    const permissionToCreate: CreatePermissionEntity = { name: data.name };
    return this.permissionRepository.create(permissionToCreate);
  }

  /**
   * Updates an existing permission.
   */
  async update(id: PermissionId, data: UpdatePermissionDto): Promise<Permission> {
    this.logger.info('Updating permission', { id, data });
    const permissionToUpdate = await this.findById(id);

    if (data.name && data.name !== permissionToUpdate.name) {
      const existing = await this.permissionRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Another permission with name '${data.name}' already exists.`);
      }
    }
    return this.permissionRepository.update(id, data);
  }

  /**
   * Deletes a permission by its ID (soft delete).
   */
  async delete(id: PermissionId): Promise<void> {
    this.logger.info('Deleting permission (soft delete)', { id });
    await this.findById(id); // Ensure it exists
    await this.permissionRepository.delete(id);
    this.logger.info('Permission soft-deleted successfully', { id });
  }
}
