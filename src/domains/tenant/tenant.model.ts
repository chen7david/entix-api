/**
 * Type representing a tenant entity as stored in the database.
 * Matches the Drizzle ORM tenants schema.
 */
export type Tenant = {
  /** Tenant ID (UUID, PK) */
  id: string;
  /** Tenant name */
  name: string;
  /** Tenant description */
  description: string | null;
  /** Created at timestamp */
  createdAt: Date | null;
  /** Updated at timestamp */
  updatedAt: Date | null;
  /** Soft delete timestamp */
  deletedAt: Date | null;
};
