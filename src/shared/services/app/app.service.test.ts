import 'reflect-metadata';
import { AppService } from '@shared/services/app/app.service';
import { Container } from '@shared/utils/ioc.util';
import { ConfigService } from '@shared/services/config/config.service';
import supertest from 'supertest';

describe('AppService', () => {
  // Reset container before each test for isolation
  beforeEach(() => {
    Container.reset();

    // Always register the ConfigService - this picks up current environment variables
    const configService = new ConfigService();
    Container.set(ConfigService, configService);

    // Register AppService using the registered ConfigService
    Container.set(AppService, new AppService(Container.get(ConfigService)));
  });

  /**
   * Test that AppService returns an Express app instance.
   */
  it('should return an Express app', () => {
    const appService = Container.get(AppService);
    const app = appService.getApp();
    expect(typeof app.listen).toBe('function');
  });

  /**
   * Test swapping AppService implementation in the container.
   */
  it('should allow swapping AppService implementation in the container', () => {
    class MockAppService {
      getApp() {
        return 'mock-app';
      }
    }
    // Override the registered AppService with a mock
    Container.set(AppService, new MockAppService() as unknown as AppService);
    const swapped = Container.get(AppService);
    expect(swapped.getApp()).toBe('mock-app');
  });

  /**
   * Test that rate limiting returns 429 after exceeding the configured limit.
   */
  it('should return 429 Too Many Requests when rate limit is exceeded', async () => {
    // Set up config with a very low limit for testing - just 1 request
    process.env.RATE_LIMIT_WINDOW_MS = '1000'; // 1 second
    process.env.RATE_LIMIT_MAX = '1'; // Just 1 request

    // Register fresh services that pick up the modified environment variables
    const configService = new ConfigService();
    Container.set(ConfigService, configService);
    Container.set(AppService, new AppService(configService));

    // Get the AppService from the container and verify config
    const appService = Container.get(AppService);
    const app = appService.getApp();
    const agent = supertest(app);

    // First request should be allowed
    const res1 = await agent.get('/');
    expect([200, 404]).toContain(res1.status);

    // Add small delay to ensure first request is processed
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Second request should be rate limited
    const res2 = await agent.get('/');
    expect(res2.status).toBe(429);
    expect(res2.text).toMatch(/too many requests/i);
  });
});
