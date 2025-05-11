import { z } from '@shared/utils/zod.util';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { RoleEntitySchema } from '@domains/role/role.schema';

/**
 * Zod schema for creating a role. Used for request body validation.
 * Requires the 'name' of the role.
 */
export const CreateRoleDto = z
  .object({
    /**
     * Name of the role (must be unique for non-deleted roles).
     * @example Administrator
     */
    name: z.string().min(2).max(100).openapi({ example: 'Administrator' }),
  })
  .openapi('CreateRoleDto', { description: 'Data required to create a new role.' });

/**
 * Type alias for CreateRoleDto schema inference
 */
export type CreateRoleDto = z.infer<typeof CreateRoleDto>;

/**
 * Zod schema for updating a role. Allows partial updates (only name).
 */
export const UpdateRoleDto = CreateRoleDto.partial().openapi('UpdateRoleDto', {
  description: 'Data for updating an existing role. Name is optional.',
});

/**
 * Type alias for UpdateRoleDto schema inference
 */
export type UpdateRoleDto = z.infer<typeof UpdateRoleDto>;

/**
 * Zod schema representing a role object as returned by the API.
 * Based on the RoleEntitySchema but omits deletedAt.
 */
export const RoleDto = RoleEntitySchema.omit({ deletedAt: true }).openapi('RoleDto', {
  description: 'Represents a role returned from the API.',
});

/**
 * Type alias for RoleDto inferred type.
 */
export type RoleDto = z.infer<typeof RoleDto>;

/**
 * Zod schema for role ID parameter in URL paths.
 */
export const RoleIdParamDto = z
  .object({
    /**
     * Role ID to identify the specific role.
     * @example 123
     */
    id: z.coerce.number().int().positive().openapi({ example: 123 }), // Role ID is a number
  })
  .openapi('RoleIdParamDto', { description: 'URL parameter for role ID.' });

/**
 * Type alias for RoleIdParamDto schema inference
 */
export type RoleIdParamDto = z.infer<typeof RoleIdParamDto>;

/**
 * Zod schema for assigning a permission to a role.
 */
export const AssignPermissionToRoleDto = z
  .object({
    /**
     * The ID of the permission to assign.
     * @example 789
     */
    permissionId: z.number().int().positive().openapi({ example: 789 }),
  })
  .openapi('AssignPermissionToRoleDto', {
    description: 'Payload for assigning a permission to a role.',
  });

export type AssignPermissionToRoleDto = z.infer<typeof AssignPermissionToRoleDto>;

/**
 * Zod schema for parameters when deleting a permission from a role.
 * Includes both role ID and permission ID from the path.
 */
export const DeleteRolePermissionParamsDto = z
  .object({
    id: z.coerce
      .number()
      .int()
      .positive()
      .openapi({ example: 123, description: 'The ID of the role' }),
    permissionId: z.coerce
      .number()
      .int()
      .positive()
      .openapi({ example: 789, description: 'The ID of the permission' }),
  })
  .openapi('DeleteRolePermissionParamsDto', {
    description: 'URL parameters for deleting a role-permission link.',
  });

export type DeleteRolePermissionParamsDto = z.infer<typeof DeleteRolePermissionParamsDto>;

/**
 * Registers role-related Zod schemas with the OpenAPI registry.
 * @param registry - The OpenAPIRegistry instance to register schemas on.
 */
export function registerRoleSchemas(registry: OpenAPIRegistry): void {
  registry.register('CreateRoleDto', CreateRoleDto);
  registry.register('UpdateRoleDto', UpdateRoleDto);
  registry.register('RoleDto', RoleDto);
  registry.register('RoleIdParamDto', RoleIdParamDto);
  registry.register('AssignPermissionToRoleDto', AssignPermissionToRoleDto);
  registry.register('DeleteRolePermissionParamsDto', DeleteRolePermissionParamsDto);
}
