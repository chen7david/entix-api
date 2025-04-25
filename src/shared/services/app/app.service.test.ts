import 'reflect-metadata';
import { Container } from 'typedi';
import { AppService } from '@shared/services/app/app.service';

describe('AppService', () => {
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
    Container.set(AppService, new MockAppService() as unknown as AppService);
    const swapped = Container.get(AppService);
    expect(swapped.getApp()).toBe('mock-app');
    // Reset
    Container.remove(AppService);
  });
});
