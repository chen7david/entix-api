import { PermissionEntity } from '@domains/permission/permission.schema';

/**
 * Type alias for Permission, extending PermissionEntity.
 * Represents a permission as used in the application logic.
 */
export type Permission = PermissionEntity;

/**
 * Type representing the payload for updating a permission.
 * Only the 'name' field can be updated.
 */
export type PermissionUpdatePayload = Partial<Pick<Permission, 'name'>>;

/**
 * Type representing a permission ID.
 */
export type PermissionId = number; // Permission ID is serial (number)
