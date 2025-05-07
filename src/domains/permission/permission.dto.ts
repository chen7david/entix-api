import { z } from '@shared/utils/zod.util';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { PermissionEntitySchema } from '@domains/permission/permission.schema';

/**
 * Zod schema for creating a permission. Requires 'name'.
 * Name could be a colon-separated string like 'resource:action'.
 */
export const CreatePermissionDto = z
  .object({
    /**
     * Name of the permission (must be unique for non-deleted permissions).
     * @example users:create
     */
    name: z
      .string()
      .min(3)
      .max(150)
      .regex(/^[a-zA-Z0-9_]+(:[a-zA-Z0-9_]+)*$/)
      .openapi({
        example: 'users:create',
        description: 'Permission name, typically resource:action, e.g., articles:publish',
      }),
  })
  .openapi('CreatePermissionDto', { description: 'Data required to create a new permission.' });

export type CreatePermissionDto = z.infer<typeof CreatePermissionDto>;

/**
 * Zod schema for updating a permission. Name is optional.
 */
export const UpdatePermissionDto = CreatePermissionDto.pick({ name: true })
  .partial()
  .openapi('UpdatePermissionDto', {
    description: 'Data for updating an existing permission. Name is optional.',
  });

export type UpdatePermissionDto = z.infer<typeof UpdatePermissionDto>;

/**
 * Zod schema representing a permission object as returned by the API.
 */
export const PermissionDto = PermissionEntitySchema.omit({ deletedAt: true }).openapi(
  'PermissionDto',
  {
    description: 'Represents a permission returned from the API.',
  },
);

export type PermissionDto = z.infer<typeof PermissionDto>;

/**
 * Zod schema for permission ID parameter in URL paths.
 */
export const PermissionIdParamDto = z
  .object({
    id: z.coerce.number().int().positive().openapi({ example: 456 }),
  })
  .openapi('PermissionIdParamDto', { description: 'URL parameter for permission ID.' });

export type PermissionIdParamDto = z.infer<typeof PermissionIdParamDto>;

/**
 * Zod schema for permission ID in the context of a role path parameter (e.g. /roles/:id/permissions/:permissionId)
 */
export const RoleContextPermissionIdParamDto = z
  .object({
    permissionId: z.coerce.number().int().positive().openapi({ example: 789 }),
  })
  .openapi('RoleContextPermissionIdParamDto', {
    description: 'URL path parameter for a permission ID in role context.',
  });

export type RoleContextPermissionIdParamDto = z.infer<typeof RoleContextPermissionIdParamDto>;

/**
 * Registers permission-related Zod schemas with OpenAPI.
 */
export function registerPermissionSchemas(registry: OpenAPIRegistry): void {
  registry.register('CreatePermissionDto', CreatePermissionDto);
  registry.register('UpdatePermissionDto', UpdatePermissionDto);
  registry.register('PermissionDto', PermissionDto);
  registry.register('PermissionIdParamDto', PermissionIdParamDto);
  registry.register('RoleContextPermissionIdParamDto', RoleContextPermissionIdParamDto);
}
