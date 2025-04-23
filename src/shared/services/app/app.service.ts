import { ErrorHandlerMiddleware } from '@src/shared/middleware/app-error.middleware';
import { useContainer, useExpressServer, getMetadataArgsStorage } from 'routing-controllers';
import { Injectable } from '@shared/utils/ioc.util';
import express, { Express } from 'express';
import { Container } from 'typedi';
import path from 'path';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { CreateUserDto, UpdateUserDto, UserDto } from '@src/domains/user/user.dto';

/**
 * AppService configures the Express app with routing-controllers and DI.
 */
@Injectable()
export class AppService {
  private app: Express;

  /**
   * @param _deps Dependency injection object (future-proof for logger, etc.)
   */
  constructor(_deps?: Record<string, unknown>) {
    useContainer(Container);
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    useExpressServer(this.app, {
      routePrefix: '/api',
      controllers: [path.join(__dirname, '../../../domains/**/*.controller.{ts,js}')],
      validation: false, // Disable class-validator
      classTransformer: false, // Disable class-transformer
      middlewares: [ErrorHandlerMiddleware],
      defaultErrorHandler: false,
    });

    /**
     * Serve the OpenAPI spec at /api/openapi.json
     */
    this.app.get('/api/openapi.json', (_req, res) => {
      const registry = new OpenAPIRegistry();

      // --- Register Zod Schemas Here ---
      registry.register('CreateUserDto', CreateUserDto);
      registry.register('UpdateUserDto', UpdateUserDto);
      registry.register('UserDto', UserDto);
      // Add registrations for other schemas used across controllers if any

      // Generate OpenAPI schema components from Zod schemas
      const generator = new OpenApiGeneratorV3(registry.definitions);
      const zodComponents = generator.generateComponents(); // Generate the components object

      // Generate the base spec from routing-controllers metadata
      const storage = getMetadataArgsStorage();
      const spec = routingControllersToSpec(
        storage,
        {
          routePrefix: '/api',
        },
        {
          // Merge generated Zod schema components
          components: {
            ...zodComponents.components, // Use the generated components here
            // You could add/override other components (like securitySchemes) if needed
          },
          info: {
            title: 'Entix API',
            version: '1.0.0',
            description: 'OpenAPI documentation for Entix API',
          },
        },
      );

      res.json(spec);
    });
  }

  /**
   * Get the configured Express app instance.
   */
  getApp(): Express {
    return this.app;
  }
}
