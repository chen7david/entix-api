import { z } from '@shared/utils/zod.util';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { PgTable, TableConfig } from 'drizzle-orm/pg-core';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Ensure zod is extended with openapi
extendZodWithOpenApi(z);

/**
 * Options for creating entity schemas
 */
type EntitySchemaOptions = {
  name?: string;
  description?: string;
};

/**
 * Utility function to create a type-safe Zod schema for database entity selection
 * based on a Drizzle table definition.
 *
 * @param table - The Drizzle table definition
 * @param options - Optional configuration for the schema
 * @returns A Zod schema for the entity corresponding to the table
 */
export function createEntitySchema<T extends PgTable<TableConfig>>(
  table: T,
  options?: EntitySchemaOptions,
) {
  // Create the base schema using drizzle-zod
  const schema = createSelectSchema(table);

  // Add OpenAPI metadata if name is provided
  if (options?.name) {
    return schema.openapi(options.name, {
      description: options.description || `${options.name} entity`,
    });
  }

  return schema;
}

/**
 * Utility function to create a type-safe Zod schema for database entity insertion
 * based on a Drizzle table definition.
 *
 * @param table - The Drizzle table definition
 * @param options - Optional configuration for the schema
 * @returns A Zod schema for creating a new entity
 */
export function createInsertEntitySchema<T extends PgTable<TableConfig>>(
  table: T,
  options?: EntitySchemaOptions,
) {
  // Create the base schema using drizzle-zod
  const schema = createInsertSchema(table);

  // Add OpenAPI metadata if name is provided
  if (options?.name) {
    return schema.openapi(options.name, {
      description: options.description || `Create ${options.name}`,
    });
  }

  return schema;
}

/**
 * Type naming convention for database entity types
 * Example: UserEntity = z.infer<typeof UserEntitySchema>
 */
export type EntityType<Schema extends z.ZodType> = z.infer<Schema>;
