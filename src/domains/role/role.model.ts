import { RoleEntity } from '@domains/role/role.schema';

/**
 * Type alias for Role, extending RoleEntity.
 * Represents a role as used in the application logic.
 */
export type Role = RoleEntity;

/**
 * Type representing the payload for updating a role.
 * Only the 'name' field can be updated.
 * Other fields like id, createdAt, updatedAt, deletedAt are managed by the system.
 */
export type RoleUpdatePayload = Partial<Pick<Role, 'name'>>;

/**
 * Type representing a role ID.
 */
export type RoleId = number; // Role ID is serial (number)
