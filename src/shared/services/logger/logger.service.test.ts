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
    loggerService.fatal('fatal message');
    expect(mockLogger.fatal).toHaveBeenCalledWith('fatal message');
    loggerService.error('error message');
    expect(mockLogger.error).toHaveBeenCalledWith('error message');
    loggerService.warn('warn message');
    expect(mockLogger.warn).toHaveBeenCalledWith('warn message');
    loggerService.info('info message');
    expect(mockLogger.info).toHaveBeenCalledWith('info message');
    loggerService.debug('debug message');
    expect(mockLogger.debug).toHaveBeenCalledWith('debug message');
    loggerService.trace('trace message');
    expect(mockLogger.trace).toHaveBeenCalledWith('trace message');
  });

  /**
   * Should log messages with meta data.
   */
  it('should log messages with meta data', () => {
    loggerService.info('test', { foo: 'bar' });
    expect(mockLogger.info).toHaveBeenCalledWith({ foo: 'bar' }, 'test');
    loggerService.error('err', { err: 1 });
    expect(mockLogger.error).toHaveBeenCalledWith({ err: 1 }, 'err');
    loggerService.trace('trace', { t: true });
    expect(mockLogger.trace).toHaveBeenCalledWith({ t: true }, 'trace');
  });

  /**
   * Should create a child logger with bindings.
   */
  it('should create a child logger with bindings', () => {
    const child = loggerService.component('test');
    expect(mockLogger.child).toHaveBeenCalledWith({ component: 'test' });
    expect(child).toBeInstanceOf(LoggerService);
  });

  /**
   * Should call flush on cleanup if available.
   */
  it('should call flush on cleanup', async () => {
    await expect(loggerService.cleanup()).resolves.toBeUndefined();
    expect(mockLogger.flush).toHaveBeenCalled();
  });
});
