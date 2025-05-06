import 'reflect-metadata';
import { Container } from 'typedi';
import { ServerService } from '@shared/services/server/server.service';
import { AppService } from '@shared/services/app/app.service';
import { ConfigService } from '@shared/services/config/config.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { DatabaseService } from '@shared/services/database/database.service';
import { createMockLogger } from '@tests/mocks/logger.service.mock';

describe('ServerService', () => {
  beforeEach(() => {
    Container.reset();
  });

  afterEach(() => {
    Container.reset(); // Ensure clean state after each test
    jest.clearAllMocks();
  });

  it('should start the server and call dependencies', async () => {
    // Create inline mocks for dependencies
    const mockListen = jest.fn((_port, cb) => cb && cb());
    const mockApp = { listen: mockListen, use: jest.fn(), get: jest.fn() };
    const mockAppService = {
      getApp: jest.fn().mockReturnValue(mockApp),
    } as unknown as jest.Mocked<AppService>;

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'PORT') return 5555;
        if (key === 'NODE_ENV') return 'test';
        return undefined;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    const mockLoggerInstance = createMockLogger(); // Use factory for logger

    const mockDatabaseService = {
      cleanup: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<DatabaseService>;

    // Register inline mocks
    Container.set(AppService, mockAppService);
    Container.set(ConfigService, mockConfigService);
    Container.set(LoggerService, mockLoggerInstance);
    Container.set(DatabaseService, mockDatabaseService);

    // Get the service
    const serverService = Container.get(ServerService);

    // Start the server (await is not strictly necessary here as listen calls back)
    serverService.start();

    // Assertions
    expect(mockConfigService.get).toHaveBeenCalledWith('PORT');
    expect(mockAppService.getApp).toHaveBeenCalled();
    expect(mockListen).toHaveBeenCalledWith(5555, expect.any(Function));
    expect(mockLoggerInstance.info).toHaveBeenCalledWith('Server started', expect.any(Object));

    // Simulate shutdown to test cleanup (optional but good)
    // You might need to manually call the registered shutdown function or mock process.on
  });
});
