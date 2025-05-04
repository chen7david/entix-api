import { DatabaseService } from '@shared/services/database/database.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { BaseRepository } from '@shared/repositories/base.repository';
import { tenants } from '@domains/tenant/tenant.schema';
import { Tenant } from '@domains/tenant/tenant.model';
import { Service } from 'typedi';
import { NotFoundError } from '@shared/utils/error/error.util';
import { and, eq } from 'drizzle-orm';

/**
 * Repository for tenant-related database operations.
 * Extends the base repository with tenant-specific functionality.
 */
@Service()
export class TenantRepository extends BaseRepository<typeof tenants, Tenant, string> {
  // Define the table and columns for the base repository to use
  protected readonly table = tenants;
  protected readonly idColumn = tenants.id;
  protected readonly deletedAtColumn = tenants.deletedAt;

  constructor(
    protected readonly dbService: DatabaseService,
    protected readonly loggerService: LoggerService,
  ) {
    super(dbService, loggerService);
  }

  /**
   * Finds a tenant by its name.
   * Respects soft delete by default.
   *
   * @param name - The tenant name to search for
   * @param includeDeleted - Whether to include soft-deleted tenants
   * @returns The found tenant entity
   * @throws NotFoundError if no tenant is found with the given name
   */
  async findByName(name: string, includeDeleted = false): Promise<Tenant> {
    const defaultFilters = this.buildDefaultFilters(includeDeleted);

    try {
      this.logger.debug(`Finding tenant by name: ${name}`);

      const whereConditions = [eq(tenants.name, name), ...defaultFilters];

      const query = this.dbService.db
        .select()
        .from(tenants)
        .where(and(...whereConditions));

      const results = await query;

      if (!results || results.length === 0) {
        throw new NotFoundError(`Tenant not found with name: ${name}`);
      }

      return results[0] as Tenant;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      this.logger.error('Error finding tenant by name', { name, error: err });
      throw err;
    }
  }
}
