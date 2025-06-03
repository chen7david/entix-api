import { ServerService } from '@core/services/server.service';
import { AppService } from '@core/services/app.service';
import { LoggerService } from '@core/services/logger.service';
import { ConfigService } from '@core/services/config.service';
import { CleanupHandler } from '@core/types/app.types';

// Disable ESLint just for server service tests
/* eslint-disable @typescript-eslint/no-explicit-any */

describe('ServerService', () => {
  let serverService: ServerService;
  let mockAppService: any;
  let mockLoggerService: any;
  let mockConfigService: any;
  let mockLogger: any;
  let mockExpressApp: any;
  let mockHttpServer: any;

  beforeEach(() => {
    // Create mock HTTP server
    mockHttpServer = {
      close: jest.fn().mockImplementation((callback) => callback()),
    };

    // Create mock Express app
    mockExpressApp = {
      listen: jest.fn().mockImplementation((port, callback) => {
        callback();
        return mockHttpServer;
      }),
    };

    // Create mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    // Create mock services
    mockLoggerService = {
      setContext: jest.fn().mockReturnValue(mockLogger),
      cleanup: jest.fn().mockResolvedValue(undefined),
    };

    mockAppService = {
      getApp: jest.fn().mockReturnValue(mockExpressApp),
      cleanup: jest.fn().mockResolvedValue(undefined),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue(3000),
    };

    // Create ServerService instance with mocks
    serverService = new ServerService(
      mockAppService as AppService,
      mockLoggerService as LoggerService,
      mockConfigService as ConfigService,
    );
  });

  describe('initialize', () => {
    it('should initialize the server and log port information', async () => {
      await serverService.initialize();

      expect(mockConfigService.get).toHaveBeenCalledWith('APP_PORT');
      expect(mockAppService.getApp).toHaveBeenCalled();
      expect(mockExpressApp.listen).toHaveBeenCalledWith(3000, expect.any(Function));
      expect(mockLogger.info).toHaveBeenCalledWith('Server started on port 3000');
    });

    it('should propagate errors from appService.getApp', async () => {
      const error = new Error('App initialization error');
      mockAppService.getApp.mockImplementationOnce(() => {
        throw error;
      });

      await expect(serverService.initialize()).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to initialize server', error);
    });
  });

  describe('registerForCleanup', () => {
    it('should register a handler for cleanup', () => {
      const mockHandler = {
        cleanup: jest.fn().mockResolvedValue(undefined),
        constructor: { name: 'TestHandler' },
      };

      serverService.registerForCleanup(mockHandler as unknown as CleanupHandler);

      expect(mockLogger.debug).toHaveBeenCalledWith('Registered cleanup handler: TestHandler');
    });

    it('should register a handler with constructor name if available', () => {
      class TestHandler implements CleanupHandler {
        async cleanup(): Promise<void> {
          /* noop */
        }
      }

      const mockHandler = new TestHandler();

      serverService.registerForCleanup(mockHandler);

      expect(mockLogger.debug).toHaveBeenCalledWith('Registered cleanup handler: TestHandler');
    });
  });

  describe('cleanup', () => {
    it('should run cleanup on all registered handlers', async () => {
      const mockHandler1 = {
        cleanup: jest.fn().mockResolvedValue(undefined),
        constructor: { name: 'MockHandler1' },
      };

      const mockHandler2 = {
        cleanup: jest.fn().mockResolvedValue(undefined),
        constructor: { name: 'MockHandler2' },
      };

      serverService.registerForCleanup(mockHandler1 as unknown as CleanupHandler);
      serverService.registerForCleanup(mockHandler2 as unknown as CleanupHandler);

      await serverService.cleanup();

      expect(mockHandler1.cleanup).toHaveBeenCalled();
      expect(mockHandler2.cleanup).toHaveBeenCalled();
      expect(mockAppService.cleanup).toHaveBeenCalled();
      expect(mockLoggerService.cleanup).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Starting cleanup of 4 registered services');
      expect(mockLogger.info).toHaveBeenCalledWith('All cleanup handlers completed successfully');
    });

    it('should throw an error if any handler cleanup fails', async () => {
      const mockHandler1 = {
        cleanup: jest.fn().mockResolvedValue(undefined),
        constructor: { name: 'MockHandler1' },
      };

      const failError = new Error('Cleanup failed');
      const mockHandler2 = {
        cleanup: jest.fn().mockRejectedValue(failError),
        constructor: { name: 'FailingHandler' },
      };

      serverService.registerForCleanup(mockHandler1 as unknown as CleanupHandler);
      serverService.registerForCleanup(mockHandler2 as unknown as CleanupHandler);

      await expect(serverService.cleanup()).rejects.toThrow();

      expect(mockHandler1.cleanup).toHaveBeenCalled();
      expect(mockHandler2.cleanup).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cleanup handler failed: FailingHandler',
        expect.any(Error),
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Server cleanup failed', expect.any(Error));
    });
  });

  describe('gracefulShutdown', () => {
    it('should log the signal and call cleanup', async () => {
      jest.spyOn(serverService, 'cleanup').mockResolvedValueOnce();

      await serverService.gracefulShutdown('SIGINT');

      expect(mockLogger.info).toHaveBeenCalledWith('Received SIGINT, shutting down gracefully...');
      expect(serverService.cleanup).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('All services cleaned up successfully');
    });

    it('should log errors if cleanup fails', async () => {
      const error = new Error('Cleanup error');
      jest.spyOn(serverService, 'cleanup').mockRejectedValueOnce(error);

      await expect(serverService.gracefulShutdown('SIGTERM')).rejects.toThrow(error);

      expect(mockLogger.info).toHaveBeenCalledWith('Received SIGTERM, shutting down gracefully...');
      expect(mockLogger.error).toHaveBeenCalledWith('Error during graceful shutdown', error);
    });
  });
});
