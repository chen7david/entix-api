import 'reflect-metadata';
import { Container } from 'typedi';
import { ServerService } from '@shared/services/server.service';
import { AppService } from '@shared/services/app.service';
import { ConfigService } from '@shared/services/config.service';

describe('ServerService', () => {
  /**
   * Test swapping AppService and ConfigService in the container for ServerService.
   */
  it('should use swapped AppService and ConfigService in the container', async () => {
    const mockListen = jest.fn((port, cb) => cb && cb());
    class MockAppService {
      getApp() {
        return { listen: mockListen };
      }
    }
    class MockConfigService {
      get() {
        return 5555;
      }
    }
    Container.set(AppService, new MockAppService() as unknown as AppService);
    Container.set(ConfigService, new MockConfigService() as unknown as ConfigService);
    const serverService = Container.get(ServerService);
    await serverService.start();
    expect(mockListen).toHaveBeenCalledWith(5555, expect.any(Function));
    // Reset
    Container.remove(AppService);
    Container.remove(ConfigService);
  });
});
