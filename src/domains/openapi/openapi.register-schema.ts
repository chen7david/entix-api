import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { registerUserSchemas } from '@domains/user/user.dto';
import { registerAuthSchemas } from '@domains/auth/auth.dto';
import { registerRoleSchemas } from '@domains/role/role.dto';
import { registerPermissionSchemas } from '@domains/permission/permission.dto';

/**
 * Registers all domain Zod schemas with OpenAPI registry.
 * Add new domain schema registration functions here.
 *
 * @param registry - The OpenAPIRegistry to add schemas to
 */
export function registerSchemas(registry: OpenAPIRegistry): void {
  registerUserSchemas(registry);
  registerAuthSchemas(registry);
  registerRoleSchemas(registry);
  registerPermissionSchemas(registry);
}

/**
 * Creates and configures an OpenAPI registry with schemas
 *
 * @returns An OpenAPI registry with all API schemas registered
 */
export function createApiRegistry(): OpenAPIRegistry {
  const registry = new OpenAPIRegistry();

  // Add global security components
  registry.registerComponent('securitySchemes', 'BearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'JWT token issued by Cognito upon successful authentication',
  });

  // Register all schemas
  registerAuthSchemas(registry);
  registerRoleSchemas(registry);
  registerPermissionSchemas(registry);
  registerUserSchemas(registry);

  return registry;
}
