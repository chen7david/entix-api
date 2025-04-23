import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { registerUserSchemas } from '@src/domains/user/user.dto';

/**
 * Registers all Zod schemas across domains in one place.
 * Add new domain schema registration functions here.
 *
 * @param registry - The OpenAPIRegistry to add schemas to
 */
export function registerSchemas(registry: OpenAPIRegistry): void {
  registerUserSchemas(registry);
}
