import 'reflect-metadata';
import { LoggerService } from './logger.service';
import { ConfigService } from '@shared/services/config/config.service';
import pino, { Logger as PinoLogger } from 'pino';
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

describe('LoggerService advanced scenarios', () => {
  let configService: ConfigService;
  let newRelicService: { enrichLoggerOptions: jest.Mock };
  let pinoMock: jest.Mock;

  beforeEach(() => {
    pinoMock = pino as unknown as jest.Mock;
    newRelicService = { enrichLoggerOptions: jest.fn((opts) => opts.options) };
    configService = {
      get: jest.fn((key) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'NEW_RELIC_ENABLED') return false;
        return undefined;
      }),
    } as unknown as ConfigService;
  });

  it('should use pretty-printing in development', () => {
    (configService.get as jest.Mock).mockImplementation((key) => {
      if (key === 'NODE_ENV') return 'development';
      return undefined;
    });
    newRelicService.enrichLoggerOptions = jest.fn((opts) => opts.options);
    pinoMock.mockClear();
    new LoggerService(configService, newRelicService, undefined);
    expect(pinoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        level: expect.any(String),
        transport: expect.objectContaining({ target: 'pino-pretty' }),
        timestamp: expect.any(Function),
      }),
    );
  });

  it('should use New Relic enrichment in production', () => {
    (configService.get as jest.Mock).mockImplementation((key) => {
      if (key === 'NODE_ENV') return 'production';
      if (key === 'NEW_RELIC_ENABLED') return true;
      return undefined;
    });
    newRelicService.enrichLoggerOptions = jest.fn((opts) => ({ ...opts.options, enriched: true }));
    pinoMock.mockClear();
    new LoggerService(configService, newRelicService, undefined);
    expect(newRelicService.enrichLoggerOptions).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true }),
    );
    expect(pinoMock).toHaveBeenCalledWith(
      expect.objectContaining({ level: expect.any(String), enriched: true }),
    );
  });

  it('should not pretty-print or enrich in test environment', () => {
    (configService.get as jest.Mock).mockImplementation((key) => {
      if (key === 'NODE_ENV') return 'test';
      return undefined;
    });
    newRelicService.enrichLoggerOptions = jest.fn((opts) => opts.options);
    pinoMock.mockClear();
    new LoggerService(configService, newRelicService, undefined);
    expect(pinoMock).toHaveBeenCalledWith(
      expect.not.objectContaining({ transport: expect.anything() }),
    );
    expect(newRelicService.enrichLoggerOptions).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });

  it('should resolve cleanup if flush is not available', async () => {
    const loggerService = new LoggerService(configService, newRelicService, {
      fatal: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      child: jest.fn().mockReturnThis(),
      // flush is not defined
    } as unknown as PinoLogger);
    await expect(loggerService.cleanup()).resolves.toBeUndefined();
  });

  it('should reject cleanup if flush returns error', async () => {
    const flush = jest.fn((cb) => cb(new Error('flush error')));
    const loggerService = new LoggerService(configService, newRelicService, {
      fatal: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      child: jest.fn().mockReturnThis(),
      flush,
    } as unknown as PinoLogger);
    await expect(loggerService.cleanup()).rejects.toThrow('flush error');
  });

  it('should return a new instance for child/component loggers', () => {
    const baseLogger = {
      fatal: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      child: jest.fn().mockReturnValue({
        fatal: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
        trace: jest.fn(),
        child: jest.fn().mockReturnThis(),
      }),
    } as unknown as PinoLogger;
    const loggerService = new LoggerService(configService, newRelicService, baseLogger);
    const childLogger = loggerService.child({ foo: 'bar' });
    expect(childLogger).not.toBe(loggerService);
    expect(childLogger).toBeInstanceOf(LoggerService);
    const componentLogger = loggerService.component('TestComponent');
    expect(componentLogger).not.toBe(loggerService);
    expect(componentLogger).toBeInstanceOf(LoggerService);
  });
});
