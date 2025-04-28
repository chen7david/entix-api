import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { registerUserSchemas } from '@domains/user/user.dto';
import { registerAuthSchemas } from '@domains/auth/auth.dto';

/**
 * Registers all domain Zod schemas with OpenAPI registry.
 * Add new domain schema registration functions here.
 *
 * @param registry - The OpenAPIRegistry to add schemas to
 */
export function registerSchemas(registry: OpenAPIRegistry): void {
  registerUserSchemas(registry);
  registerAuthSchemas(registry);
}
