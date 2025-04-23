import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { registerOpenApiUserSchemas } from '@src/domains/user/user.dto';

/**
 * registerSchemas adds all Zod schemas to the provided OpenAPIRegistry.
 * Add new DTO registrations here as your API grows.
 */
export function registerSchemas(registry: OpenAPIRegistry): void {
  registerOpenApiUserSchemas(registry);
}
