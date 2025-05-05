import { Injectable } from '@shared/utils/ioc.util';
import { DatabaseService } from '@shared/services/database/database.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { tenants, TenantEntity } from '@domains/tenant/tenant.schema';
import { TenantId } from '@domains/tenant/tenant.model';
import { BaseRepository } from '@shared/repositories/base.repository';
import { SQL, and, eq, isNull } from 'drizzle-orm';

/**
 * Repository for tenant data access, extending the BaseRepository.
 * Handles specific tenant-related operations and provides concrete table/column info.
 */
@Injectable()
export class TenantRepository extends BaseRepository<typeof tenants, TenantEntity, TenantId> {
  // Provide concrete implementations for abstract properties
  protected readonly table = tenants;
  protected readonly idColumn = tenants.id;
  // Specify the soft delete column for the Tenant domain
  protected readonly deletedAtColumn = tenants.deletedAt;

  /**
   * Creates an instance of TenantRepository.
   * @param dbService - The DatabaseService instance, passed to the base repository.
   * @param loggerService - The LoggerService instance for logging.
   */
  constructor(
    protected readonly dbService: DatabaseService,
    protected readonly loggerService: LoggerService,
  ) {
    super(dbService, loggerService); // Pass both services to the base class constructor
  }

  /**
   * Finds a tenant by name.
   * @param name - The name of the tenant to find
   * @returns Promise resolving to the tenant if found, null otherwise
   */
  async findByName(name: string): Promise<TenantEntity | null> {
    this.logger.info('Finding tenant by name', { name });

    const conditions: SQL[] = [eq(this.table.name, name)];

    if (this.deletedAtColumn) {
      conditions.push(isNull(this.deletedAtColumn));
    }

    const result = await this.dbService.db
      .select()
      .from(this.table)
      .where(and(...conditions))
      .limit(1);

    return result[0] || null;
  }

  // All other basic CRUD methods (create, findById, findAll, update)
  // are inherited from BaseRepository.
}
