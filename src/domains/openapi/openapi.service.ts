import { Injectable } from '@shared/utils/ioc.util';
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { LoggerService } from '@shared/services/logger/logger.service';
import { Logger } from '@shared/types/logger.type';
import { createApiRegistry } from '@domains/openapi/openapi.register-schema';

/**
 * Service responsible for generating the OpenAPI JSON spec.
 */
@Injectable()
export class OpenApiService {
  private readonly registry: OpenAPIRegistry;
  private readonly logger: Logger;

  constructor(private readonly loggerService: LoggerService) {
    this.logger = this.loggerService.component('OpenApiService');
    this.registry = createApiRegistry();
  }

  /**
   * Generates an OpenAPI specification document
   * @returns OpenAPI specification document
   */
  public generateSpec(): ReturnType<OpenApiGeneratorV3['generateDocument']> {
    this.logger.debug('Generating OpenAPI spec...');

    const generator = new OpenApiGeneratorV3(this.registry.definitions);

    // Generate the OpenAPI specification
    const document = generator.generateDocument({
      openapi: '3.0.0',
      info: {
        title: 'Entix API',
        version: '1.0.0',
        description: 'API documentation for Entix API',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'API server',
        },
      ],
      // Add global security - require Bearer auth for all endpoints unless explicitly overridden
      security: [
        {
          BearerAuth: [],
        },
      ],
    });

    return document;
  }
}
