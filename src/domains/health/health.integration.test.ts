import 'reflect-metadata';
import { Container } from 'typedi';
import { AppService } from '@shared/services/app/app.service';
import { ConfigService } from '@shared/services/config/config.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { Express } from 'express';
import { createMockLogger } from '@shared/utils/test-helpers/mocks/mock-logger.util';
import { HealthController } from '@domains/health/health.controller';
import { IntegrationTestManager } from '@shared/utils/test-helpers/integration-test-manager.util';

describe('GET /health - Integration', () => {
  let manager: IntegrationTestManager;
  let app: Express;

  beforeAll(() => {
    // Reset the container to make sure we have a clean state
    Container.reset();
    manager = Container.get(IntegrationTestManager);
    // Register services
    const configService = new ConfigService();
    Container.set(ConfigService, configService);

    const mockLogger = createMockLogger();
    Container.set(LoggerService, mockLogger);

    // Make sure the HealthController is registered
    Container.set(HealthController, new HealthController());

    // Create the app service with dependency injection
    const appService = new AppService(configService, mockLogger);
    Container.set(AppService, appService);

    // Get the app instance
    app = appService.getApp();

    // Debug routes
    console.log('Available Express routes:');
    // Define a proper type for routes
    interface RouteInfo {
      path: string;
      method: string;
    }
    const routes: RouteInfo[] = [];

    // Define middleware type
    type MiddlewareStack = {
      route?: {
        path: string;
        methods: Record<string, boolean>;
      };
      name?: string;
      handle: {
        stack: {
          route?: {
            path: string;
            methods: Record<string, boolean>;
          };
        }[];
      };
    };

    app._router.stack.forEach((middleware: MiddlewareStack) => {
      if (middleware.route) {
        // Routes registered directly on the app
        routes.push({
          path: middleware.route.path,
          method: Object.keys(middleware.route.methods)[0],
        });
      } else if (middleware.name === 'router') {
        // Routes registered with Router
        middleware.handle.stack.forEach((handler: MiddlewareStack['handle']['stack'][0]) => {
          if (handler.route) {
            routes.push({
              path: handler.route.path,
              method: Object.keys(handler.route.methods)[0],
            });
          }
        });
      }
    });
    console.log(JSON.stringify(routes, null, 2));
  });

  beforeEach(async () => {
    await manager.beginTransaction();
  });

  afterEach(async () => {
    await manager.rollbackTransaction();
  });

  afterAll(async () => {
    await manager.close();
  });

  // We don't need transaction management for this simple test
  // since we're not modifying any database state

  it('should return 200 OK with status, message, and timestamp', async () => {
    try {
      console.log('Making request to /health');
      const response = await manager.request.get('/health');
      console.log('Response status:', response.status);
      console.log('Response body:', response.body);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('message', 'API is running');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('string');
      // Check if timestamp is a valid ISO string
      expect(!isNaN(Date.parse(response.body.timestamp))).toBe(true);
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  });
});
