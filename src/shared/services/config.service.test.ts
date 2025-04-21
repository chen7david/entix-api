import 'reflect-metadata';
import { Container } from 'typedi';
import { ConfigService } from '@shared/services/config.service';

describe('ConfigService', () => {
  beforeEach(() => {
    Container.reset();
  });

  /**
   * Test that ConfigService returns the correct port from env.
   */
  it('should return the port from env', () => {
    process.env.PORT = '1234';
    const configService = Container.get(ConfigService);
    expect(configService.get('PORT')).toBe(1234);
  });

  /**
   * Test that ConfigService throws on invalid env.
   */
  it('should throw if env is invalid', () => {
    process.env.PORT = 'not-a-number';
    const configService = Container.get(ConfigService);
    expect(() => configService.get('PORT')).toThrow();
  });

  /**
   * Test swapping ConfigService implementation in the container.
   */
  it('should allow swapping ConfigService implementation in the container', () => {
    class MockConfigService {
      get() {
        return 9999;
      }
    }
    Container.set(ConfigService, new MockConfigService() as unknown as ConfigService);
    const swapped = Container.get(ConfigService);
    expect(swapped.get('PORT')).toBe(9999);
    // Reset
    Container.remove(ConfigService);
  });
});
