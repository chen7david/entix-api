import { DatabaseService } from '@shared/services/database/database.service';
import { createAppError, NotFoundError } from '@shared/utils/error/error.util';
import { and, eq, isNull, SQLWrapper, InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { AnyPgColumn, PgTable, TableConfig } from 'drizzle-orm/pg-core';

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

  constructor(protected readonly dbService: DatabaseService) {}

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
   * Retrieves an entity by its primary key ID.
   * Respects soft delete by default.
   * @param id - The ID of the entity to retrieve.
   * @param includeDeleted - Set to true to include soft-deleted records.
   * @returns The found entity.
   */
  async findById(id: TId, includeDeleted = false): Promise<TEntity> {
    const defaultFilters = this.buildDefaultFilters(includeDeleted);
    try {
      const results = await this.dbService.db
        .select()
        .from(this.table as unknown as PgTable<TableConfig>)
        .where(and(eq(this.idColumn, id), ...defaultFilters));

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
   * Deletes an entity by its primary key ID.
   * Performs a soft delete if `deletedAtColumn` is configured, otherwise hard delete.
   * @param id - The ID of the entity to delete.
   * @returns A promise that resolves when the deletion is complete.
   */
  async delete(id: TId): Promise<void> {
    try {
      if (this.deletedAtColumn) {
        // Soft delete
        const results = await this.dbService.db
          .update(this.table)
          .set({ [this.deletedAtColumn.name]: new Date() } as unknown as InferInsertModel<TTable>)
          .where(and(eq(this.idColumn, id), isNull(this.deletedAtColumn)))
          .returning({ id: this.idColumn });

        const resultsArray = results as { id: TId }[];
        if (!resultsArray || resultsArray.length === 0) {
          try {
            await this.findById(id, true);
            console.warn(
              `Attempted to soft delete already soft-deleted ${this.getEntityName()} with id: ${id}`,
            );
          } catch (findErr) {
            throw createAppError(findErr);
          }
        }
      } else {
        // Hard delete
        await this.dbService.db.delete(this.table).where(eq(this.idColumn, id)).returning();
      }
    } catch (err) {
      throw createAppError(err);
    }
  }
}
