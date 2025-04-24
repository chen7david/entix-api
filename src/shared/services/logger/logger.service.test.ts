import 'reflect-metadata';
import { LoggerService } from '@shared/services/logger/logger.service';
import { ConfigService } from '@shared/services/config/config.service';
import pino from 'pino';
import { Container } from 'typedi';

// We still need to mock external dependencies like pino
jest.mock('pino');

/**
 * Test suite for LoggerService.
 */
describe('LoggerService', () => {
  let loggerService: LoggerService;
  let mockLogger: Record<string, jest.Mock>;
  let configService: ConfigService;

  beforeEach(() => {
    // Reset the container before each test
    Container.reset();

    mockLogger = {
      fatal: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      child: jest.fn().mockReturnThis(),
      flush: jest.fn((cb) => cb && cb()),
    };

    (pino as unknown as jest.Mock).mockReturnValue(mockLogger);

    configService = {
      get: jest.fn((key) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'PORT') return 4000;
        return undefined;
      }),
    } as unknown as ConfigService;

    // Register mocks with the container
    Container.set(ConfigService, configService);

    // Get the service from the container
    loggerService = Container.get(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Should instantiate and configure pino logger.
   */
  it('should instantiate and configure pino logger', () => {
    expect(pino).toHaveBeenCalledWith(expect.objectContaining({ level: expect.any(String) }));
  });

  /**
   * Should log messages at all levels.
   */
  it('should log messages at all levels', () => {
    const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const;
    for (const level of levels) {
      loggerService.log({ level, msg: `${level} message` });
      expect(mockLogger[level]).toHaveBeenCalledWith(`${level} message`);
    }
  });

  /**
   * Should log messages with meta data.
   */
  it('should log messages with meta data', () => {
    loggerService.log({ level: 'info', msg: 'test', meta: { foo: 'bar' } });
    expect(mockLogger.info).toHaveBeenCalledWith({ foo: 'bar' }, 'test');
  });

  /**
   * Should create a child logger with bindings.
   */
  it('should create a child logger with bindings', () => {
    const child = loggerService.child({ service: 'test' });
    expect(mockLogger.child).toHaveBeenCalledWith({ service: 'test' });
    expect(child).toBe(mockLogger);
  });

  /**
   * Should call flush on cleanup if available.
   */
  it('should call flush on cleanup', async () => {
    await expect(loggerService.cleanup()).resolves.toBeUndefined();
    expect(mockLogger.flush).toHaveBeenCalled();
  });
});
