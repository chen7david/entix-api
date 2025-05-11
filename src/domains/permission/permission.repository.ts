import { Injectable } from '@shared/utils/ioc.util';
import { DatabaseService } from '@shared/services/database/database.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { permissionsTable, PermissionEntity } from '@domains/permission/permission.schema';
import { PermissionId } from '@domains/permission/permission.model';
import { BaseRepository } from '@shared/repositories/base.repository';
import { eq, and, isNull } from 'drizzle-orm';

/**
 * Repository for permission data access.
 */
@Injectable()
export class PermissionRepository extends BaseRepository<
  typeof permissionsTable,
  PermissionEntity,
  PermissionId
> {
  protected readonly table = permissionsTable;
  protected readonly idColumn = permissionsTable.id;
  protected readonly deletedAtColumn = permissionsTable.deletedAt;

  constructor(
    protected readonly dbService: DatabaseService,
    protected readonly loggerService: LoggerService,
  ) {
    super(dbService, loggerService);
  }

  /**
   * Finds a permission by its name, excluding soft-deleted ones.
   * @param name - The name of the permission.
   * @returns Promise resolving to the PermissionEntity or null.
   */
  async findByName(name: string): Promise<PermissionEntity | null> {
    this.loggerService.info('Finding permission by name', {
      name,
      table: this.table?._?.name ?? 'permissions',
    });
    const result = await this.dbService.db
      .select()
      .from(this.table)
      .where(and(eq(this.table.name, name), isNull(this.deletedAtColumn)))
      .limit(1);
    return result[0] || null;
  }
}
