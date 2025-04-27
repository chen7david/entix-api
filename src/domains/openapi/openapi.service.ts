import { Injectable } from '@shared/utils/ioc.util';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registerSchemas } from '@domains/openapi/openapi.register-schema';

/**
 * Service responsible for generating the OpenAPI JSON spec.
 */
@Injectable()
export class OpenApiService {
  /**
   * Generate and return the OpenAPI specification.
   */
  public generateSpec(): unknown {
    // Register all Zod schemas
    const registry = new OpenAPIRegistry();
    registerSchemas(registry);

    // Generate components from Zod definitions
    const generator = new OpenApiGeneratorV3(registry.definitions);
    const components = generator.generateComponents();

    // Generate the full OpenAPI spec from routing-controllers metadata
    return routingControllersToSpec(
      getMetadataArgsStorage(),
      {},
      {
        components: components.components,
        info: {
          title: 'Entix API',
          version: '1.0.0',
          description: 'OpenAPI documentation for Entix API',
        },
      },
    );
  }
}
