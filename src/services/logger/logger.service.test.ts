import { LoggerService } from './logger.service';
import { AppError } from '@src/shared/utils/errors/error.util';
import pino from 'pino';

jest.mock('pino');

/**
 * Creates a mock pino logger with all log level methods as jest.fn().
 */
const createMockPinoLogger = () => {
  const logger: Record<string, jest.Mock> = {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };
  return logger as unknown as pino.Logger;
};

/**
 * Mocks the env config to avoid loading any real environment variables.
 */
jest.mock('@src/config/env.config', () => ({
  env: {
    APP_NAME: 'test-app',
    LOG_LEVEL: 'info',
    NODE_ENV: 'test',
    NEW_RELIC_ENABLED: false,
  },
}));

describe('LoggerService', () => {
  let mockLogger: pino.Logger;
  let loggerService: LoggerService;

  beforeEach(() => {
    mockLogger = createMockPinoLogger();
    loggerService = new LoggerService(mockLogger);
    jest.clearAllMocks();
  });

  /**
   * Tests the getPinoLogger method returns the underlying pino logger instance.
   */
  it('should return the underlying pino logger', () => {
    expect(loggerService.getPinoLogger()).toBe(mockLogger);
  });

  /**
   * Tests the trace method calls the trace log level with correct arguments.
   */
  it('should log trace messages', () => {
    loggerService.trace('trace message', { foo: 'bar' });
    expect(mockLogger.trace).toHaveBeenCalledWith(
      { foo: 'bar' },
      'trace message'
    );
  });

  /**
   * Tests the debug method calls the debug log level with correct arguments.
   */
  it('should log debug messages', () => {
    loggerService.debug('debug message', { foo: 'bar' });
    expect(mockLogger.debug).toHaveBeenCalledWith(
      { foo: 'bar' },
      'debug message'
    );
  });

  /**
   * Tests the info method calls the info log level with correct arguments.
   */
  it('should log info messages', () => {
    loggerService.info('info message', { foo: 'bar' });
    expect(mockLogger.info).toHaveBeenCalledWith(
      { foo: 'bar' },
      'info message'
    );
  });

  /**
   * Tests the warn method calls the warn log level with correct arguments.
   */
  it('should log warn messages', () => {
    loggerService.warn('warn message', { foo: 'bar' });
    expect(mockLogger.warn).toHaveBeenCalledWith(
      { foo: 'bar' },
      'warn message'
    );
  });

  /**
   * Tests the fatal method calls the fatal log level with correct arguments.
   */
  it('should log fatal messages', () => {
    loggerService.fatal('fatal message', { foo: 'bar' });
    expect(mockLogger.fatal).toHaveBeenCalledWith(
      { foo: 'bar' },
      'fatal message'
    );
  });

  /**
   * Tests the error method logs AppError with formatted context and message.
   */
  it('should log AppError with formatted context and message', () => {
    const error = new AppError({ message: 'app error', status: 400 });
    loggerService.error(error, 'custom error', { foo: 'bar' });
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        foo: 'bar',
        errorId: error.errorId,
        errorType: error.type,
        status: error.status,
      }),
      'custom error'
    );
  });

  /**
   * Tests the error method logs standard Error with formatted context and message.
   */
  it('should log standard Error with formatted context and message', () => {
    const error = new Error('std error');
    loggerService.error(error, 'custom error', { foo: 'bar' });
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        foo: 'bar',
        error: expect.objectContaining({
          name: 'Error',
          stack: expect.any(String),
        }),
      }),
      'custom error'
    );
  });

  /**
   * Tests the error method logs unknown error with formatted context and message.
   */
  it('should log unknown error with formatted context and message', () => {
    loggerService.error('unknown', 'custom error', { foo: 'bar' });
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        foo: 'bar',
        error: 'unknown',
      }),
      'custom error'
    );
  });

  /**
   * Tests logStart logs a start event with correct context.
   */
  it('should log start event', () => {
    loggerService.logStart('operation', { foo: 'bar' });
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'start',
        operation: 'operation',
        foo: 'bar',
      }),
      'Starting operation'
    );
  });

  /**
   * Tests logSuccess logs a success event with duration.
   */
  it('should log success event with duration', () => {
    loggerService.logSuccess('operation', 123, { foo: 'bar' });
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'success',
        operation: 'operation',
        durationMs: 123,
        foo: 'bar',
      }),
      'Completed operation in 123ms'
    );
  });

  /**
   * Tests logSuccess logs a success event without duration.
   */
  it('should log success event without duration', () => {
    loggerService.logSuccess('operation', undefined, { foo: 'bar' });
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'success',
        operation: 'operation',
        foo: 'bar',
      }),
      'Completed operation'
    );
  });

  /**
   * Tests logFailure logs a failure event with error.
   */
  it('should log failure event with error', () => {
    const error = new Error('fail');
    loggerService.logFailure('operation', error, { foo: 'bar' });
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'failure',
        operation: 'operation',
        foo: 'bar',
        error: expect.objectContaining({ name: 'Error' }),
      }),
      expect.stringContaining('Failed operation: fail')
    );
  });

  /**
   * Tests createContext returns a new LoggerService with child context.
   */
  it('should create a child logger with context', () => {
    const childLogger = loggerService.createContext({ component: 'child' });
    expect(childLogger).toBeInstanceOf(LoggerService);
    expect((childLogger as any).logger).toBe(mockLogger);
  });

  /**
   * Tests forComponent returns a new LoggerService with component context.
   */
  it('should create a child logger for a component', () => {
    const childLogger = loggerService.forComponent('myComponent', {
      foo: 'bar',
    });
    expect(childLogger).toBeInstanceOf(LoggerService);
    expect((childLogger as any).logger).toBe(mockLogger);
  });
});
