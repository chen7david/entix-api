import { DatabaseService } from '@shared/services/database/database.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { createAppError, NotFoundError } from '@shared/utils/error/error.util';
import { and, eq, isNull, SQLWrapper, InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { AnyPgColumn, PgTable, TableConfig } from 'drizzle-orm/pg-core';
import type { Logger } from '@shared/types/logger.type';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@database/schema';

/**
 * Abstract base class for repositories providing common CRUD operations
 * using Drizzle ORM, with optional soft delete support.
 *
 * @template TTable The Drizzle table schema type (e.g., `typeof users`).
 * @template TEntity The entity type corresponding to the table (e.g., `User`).
 * @template TId The type of the primary key ID (e.g., `number` or `string`).
 */
export abstract class BaseRepository<
  TTable extends PgTable<TableConfig>,
  TEntity extends InferSelectModel<TTable>,
  TId extends TEntity['id'],
> {
  /** The Drizzle table schema object. */
  protected abstract readonly table: TTable;
  /** The Drizzle column object representing the primary key ID. */
  protected abstract readonly idColumn: AnyPgColumn;
  /** Optional: The Drizzle column object representing the soft delete timestamp. */
  protected abstract readonly deletedAtColumn?: AnyPgColumn;
  /** Logger instance for repository operations */
  protected readonly logger: Logger;

  constructor(
    protected readonly dbService: DatabaseService,
    protected readonly loggerService: LoggerService,
  ) {
    // Create a child logger with repository name context
    this.logger = this.loggerService.component(this.constructor.name);
  }

  /**
   * Helper to retrieve the table's name for error messages.
   * Falls back to 'Resource' if metadata is missing.
   */
  private getEntityName(): string {
    return (this.table as unknown as { _?: { name: string } })._?.name ?? 'Resource';
  }

  /**
   * Builds the default WHERE clauses, including soft-delete filter if applicable.
   * @param includeDeleted - Whether to include soft-deleted records.
   * @returns An array of SQLWrapper conditions.
   */
  protected buildDefaultFilters(includeDeleted = false): SQLWrapper[] {
    const conditions: SQLWrapper[] = [];
    if (this.deletedAtColumn && !includeDeleted) {
      // Only include records where deletedAt is NULL (not soft-deleted)
      conditions.push(isNull(this.deletedAtColumn));
    }
    return conditions;
  }

  /**
   * Creates a new entity in the database.
   * @param data - The data for the new entity.
   * @returns The newly created entity.
   */
  async create(data: InferInsertModel<TTable>): Promise<TEntity> {
    try {
      const results = await this.dbService.db.insert(this.table).values(data).returning();
      const resultsArray = results as unknown as TEntity[];
      if (!resultsArray || resultsArray.length === 0) {
        throw new Error('Failed to create entity, no returning data.');
      }
      return resultsArray[0];
    } catch (err) {
      throw createAppError(err);
    }
  }

  /**
   * Creates a new entity in the database within a transaction.
   * @param data - The data for the new entity.
   * @param tx - The transaction object from Drizzle.
   * @returns The newly created entity.
   */
  async createWithTx(
    data: InferInsertModel<TTable>,
    tx: NodePgDatabase<typeof schema>,
  ): Promise<TEntity> {
    try {
      const results = await tx.insert(this.table).values(data).returning();
      const resultsArray = results as unknown as TEntity[];
      if (!resultsArray || resultsArray.length === 0) {
        throw new Error('Failed to create entity, no returning data.');
      }
      return resultsArray[0];
    } catch (err) {
      throw createAppError(err);
    }
  }

  /**
   * Retrieves an entity by its primary key ID.
   * Respects soft delete by default.
   * @param id - The ID of the entity to retrieve.
   * @param includeDeleted - Set to true to include soft-deleted records.
   * @returns The found entity.
   */
  async findById(id: TId, includeDeleted = false): Promise<TEntity> {
    const defaultFilters = this.buildDefaultFilters(includeDeleted);

    try {
      const query = this.dbService.db
        .select()
        .from(this.table as unknown as PgTable<TableConfig>)
        .where(and(eq(this.idColumn, id), ...defaultFilters));

      const results = await query;
      const resultsArray = results as unknown as TEntity[];

      if (!resultsArray || resultsArray.length === 0) {
        throw new NotFoundError(`${this.getEntityName()} not found`);
      }
      return resultsArray[0];
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw createAppError(err);
    }
  }

  /**
   * Retrieves all entities from the table.
   * Respects soft delete by default.
   * Consider pagination in the specific repository for large tables.
   * @param includeDeleted - Set to true to include soft-deleted records.
   * @returns An array of all entities.
   */
  async findAll(includeDeleted = false): Promise<TEntity[]> {
    const defaultFilters = this.buildDefaultFilters(includeDeleted);
    const whereCondition = defaultFilters.length > 0 ? and(...defaultFilters) : undefined;
    try {
      const query = this.dbService.db
        .select()
        .from(this.table as unknown as PgTable<TableConfig>)
        .$dynamic();
      if (whereCondition) {
        query.where(whereCondition);
      }
      const results = await query;
      return results as unknown as TEntity[];
    } catch (err) {
      throw createAppError(err);
    }
  }

  /**
   * Updates an entity by its primary key ID.
   * Bypasses soft delete checks.
   * @param id - The ID of the entity to update.
   * @param data - An object containing the fields to update.
   * @returns The updated entity.
   */
  async update(id: TId, data: Partial<InferInsertModel<TTable>>): Promise<TEntity> {
    try {
      const results = await this.dbService.db
        .update(this.table)
        .set(data)
        .where(eq(this.idColumn, id))
        .returning();

      const resultsArray = results as TEntity[];
      if (!resultsArray || resultsArray.length === 0) {
        throw new NotFoundError(`${this.getEntityName()} not found for update`);
      }
      return resultsArray[0];
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw createAppError(err);
    }
  }

  /**
   * Deletes a record by ID. Performs either a hard delete (removes the record)
   * or a soft delete (updates a deletion timestamp) depending on repository configuration.
   * @param id - The ID of the record to delete
   * @returns True if the operation was successful
   */
  async delete(id: TId): Promise<boolean> {
    try {
      this.logger.debug(`Attempting to delete by ID: ${String(id)}`);

      if (this.deletedAtColumn) {
        // Use the update method for soft delete
        const updated = await this.update(id, {
          deletedAt: new Date(),
        } as Partial<InferInsertModel<TTable>>);
        this.logger.debug(`Soft delete completed: ${updated ? 'Success' : 'No rows affected'}`);
        return !!updated;
      } else {
        // Hard delete: Remove the record from the database
        const result = await this.dbService.db
          .delete(this.table)
          .where(eq(this.idColumn, id))
          .returning();

        return Array.isArray(result) && result.length > 0;
      }
    } catch (error) {
      this.logger.error(`Error deleting record by ID: ${String(id)}`, error as Error);
      throw createAppError(error);
    }
  }
}
