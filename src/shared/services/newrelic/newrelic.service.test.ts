import { NewRelicService } from './newrelic.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { ConfigService } from '@shared/services/config/config.service';
import { NodeEnv } from '@shared/constants/app.constants';

// Mock dependencies
jest.mock('@shared/services/logger/logger.service');
jest.mock('@shared/services/config/config.service');

describe('NewRelicService', () => {
  let newRelicService: NewRelicService;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockLoggerService: jest.Mocked<LoggerService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock logger with child method
    mockLoggerService = {
      child: jest.fn().mockReturnValue({
        info: jest.fn(),
        warn: jest.fn(),
      }),
      getLogger: jest.fn(),
      log: jest.fn(),
      cleanup: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<LoggerService>;

    // Create mock config service
    mockConfigService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;
  });

  test('should be disabled in development mode', () => {
    // Mock config to return development environment
    mockConfigService.get.mockReturnValue(NodeEnv.DEVELOPMENT);

    // Initialize service
    newRelicService = new NewRelicService(mockConfigService, mockLoggerService);

    // Assertions
    expect(newRelicService.isEnabled()).toBe(false);
    expect(newRelicService.getNewRelic()).toBeNull();
  });

  test('should be disabled in test mode', () => {
    // Mock config to return test environment
    mockConfigService.get.mockReturnValue(NodeEnv.TEST);

    // Initialize service
    newRelicService = new NewRelicService(mockConfigService, mockLoggerService);

    // Assertions
    expect(newRelicService.isEnabled()).toBe(false);
    expect(newRelicService.getNewRelic()).toBeNull();
  });

  test('should not call New Relic methods when disabled', () => {
    // Mock config to return test environment
    mockConfigService.get.mockReturnValue(NodeEnv.TEST);

    // Initialize service
    newRelicService = new NewRelicService(mockConfigService, mockLoggerService);

    // Create spy to ensure we don't try to access methods on null
    const getNewRelicSpy = jest.spyOn(newRelicService, 'getNewRelic');

    // Call methods that should be no-ops when disabled
    newRelicService.addCustomAttributes({ test: 'value' });
    newRelicService.recordCustomEvent('TestEvent', { test: 'value' });

    // Verify New Relic was not accessed
    expect(getNewRelicSpy).not.toHaveBeenCalled();
  });

  // Note: Testing the production mode behavior is challenging
  // because it requires the New Relic module to be available.
  // In a real environment, we might use a mock of the New Relic module,
  // but for this test suite, we focus on the non-production behavior.
});
