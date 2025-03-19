// Mock modules before importing the tested module
const mockPinoInstance = {
  trace: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn(),
  child: jest.fn(),
};

// Create a mock function that will be used as the default export
const mockPino = jest.fn().mockReturnValue(mockPinoInstance);

// Mock the entire pino module
jest.mock('pino', () => mockPino);

// Mock environment configuration
jest.mock('@src/config/env.config', () => ({
  env: {
    LOG_LEVEL: 'info',
    APP_NAME: 'test-app',
    NODE_ENV: 'test',
  },
}));

// Mock crypto for UUID generation
jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('mock-uuid'),
}));

// Import the module under test
import { LoggerService, LoggerConfig, LogContext, createLogger } from './logger.service';
import { LogLevel } from '@src/constants/logger.constant';
import { Environment } from '@src/constants/app.constant';
import { Writable } from 'stream';

describe('LoggerService', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset mocks to return consistent values
    mockPinoInstance.child.mockReturnValue(mockPinoInstance);
    mockPino.mockReturnValue(mockPinoInstance);
  });

  describe('Constructor and Configuration', () => {
    it('should create a logger with default configuration', () => {
      const logger = new LoggerService();
      expect(logger).toBeInstanceOf(LoggerService);
      expect(mockPino).toHaveBeenCalled();
    });

    it('should create a logger with custom configuration', () => {
      const config: LoggerConfig = {
        level: LogLevel.DEBUG,
        appName: 'custom-app',
        env: Environment.DEVELOPMENT,
        prettyPrint: false,
        timestamp: true,
        baseFields: { custom: 'field' },
      };

      const logger = new LoggerService(config);
      expect(logger).toBeInstanceOf(LoggerService);

      // Verify pino was called with expected options
      const pinoOptions = mockPino.mock.calls[0][0];
      expect(pinoOptions.level).toBe(LogLevel.DEBUG);
      expect(pinoOptions.base.app).toBe('custom-app');
      expect(pinoOptions.base.env).toBe(Environment.DEVELOPMENT);
      expect(pinoOptions.base.custom).toBe('field');
    });

    it('should use a custom destination if provided', () => {
      const mockDestination = new Writable({
        write(chunk, encoding, callback) {
          callback();
        },
      });

      const logger = new LoggerService({
        destination: mockDestination,
      });

      expect(mockPino).toHaveBeenCalled();
      expect(mockPino.mock.calls[0][1]).toBe(mockDestination);
    });

    it('should create a pretty transport for development environment', () => {
      const logger = new LoggerService({
        env: Environment.DEVELOPMENT,
        prettyPrint: true,
      });

      expect(mockPino).toHaveBeenCalled();
      const options = mockPino.mock.calls[0][0];

      // Check for pretty transport configuration
      expect(options.transport).toBeDefined();
      expect(options.transport.target).toBe('pino-pretty');
      expect(options.transport.options.colorize).toBe(true);
    });
  });

  describe('Logging Methods', () => {
    let logger: LoggerService;

    beforeEach(() => {
      logger = new LoggerService();
    });

    it('should log at TRACE level', () => {
      logger.trace('trace message');
      expect(mockPinoInstance.trace).toHaveBeenCalled();
      expect(mockPinoInstance.trace.mock.calls[0][1]).toBe('trace message');
    });

    it('should log at DEBUG level', () => {
      logger.debug('debug message');
      expect(mockPinoInstance.debug).toHaveBeenCalled();
      expect(mockPinoInstance.debug.mock.calls[0][1]).toBe('debug message');
    });

    it('should log at INFO level', () => {
      logger.info('info message');
      expect(mockPinoInstance.info).toHaveBeenCalled();
      expect(mockPinoInstance.info.mock.calls[0][1]).toBe('info message');
    });

    it('should log at WARN level', () => {
      logger.warn('warn message');
      expect(mockPinoInstance.warn).toHaveBeenCalled();
      expect(mockPinoInstance.warn.mock.calls[0][1]).toBe('warn message');
    });

    it('should log at ERROR level', () => {
      logger.error('error message');
      expect(mockPinoInstance.error).toHaveBeenCalled();
      expect(mockPinoInstance.error.mock.calls[0][1]).toBe('error message');
    });

    it('should log at FATAL level', () => {
      logger.fatal('fatal message');
      expect(mockPinoInstance.fatal).toHaveBeenCalled();
      expect(mockPinoInstance.fatal.mock.calls[0][1]).toBe('fatal message');
    });

    it('should include context in log messages', () => {
      const context: LogContext = {
        correlationId: 'correlation-123',
        userId: 'user-123',
        tenantId: 'tenant-123',
      };

      logger.info('info with context', context);

      expect(mockPinoInstance.info).toHaveBeenCalled();
      expect(mockPinoInstance.info.mock.calls[0][0]).toMatchObject(context);
      expect(mockPinoInstance.info.mock.calls[0][1]).toBe('info with context');
    });

    it('should properly serialize errors', () => {
      const error = new Error('Test error');
      logger.error('error with error object', { error });

      expect(mockPinoInstance.error).toHaveBeenCalled();
      const loggedContext = mockPinoInstance.error.mock.calls[0][0];
      expect(loggedContext.err).toBeDefined();
      expect(loggedContext.err.message).toBe('Test error');
      expect(loggedContext.err.name).toBe('Error');
      expect(loggedContext.err.stack).toBeDefined();
    });

    it('should include custom error properties', () => {
      const error = new Error('Test error') as any;
      error.code = 'TEST_ERROR';
      error.statusCode = 500;

      logger.error('error with custom properties', { error });

      expect(mockPinoInstance.error).toHaveBeenCalled();
      const loggedContext = mockPinoInstance.error.mock.calls[0][0];
      expect(loggedContext.err.code).toBe('TEST_ERROR');
      expect(loggedContext.err.statusCode).toBe(500);
    });
  });

  describe('Child Loggers', () => {
    let parentLogger: LoggerService;
    let childLoggerInstance: any;

    beforeEach(() => {
      childLoggerInstance = {
        trace: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
        child: jest.fn(),
      };

      mockPinoInstance.child.mockReturnValue(childLoggerInstance);
      parentLogger = new LoggerService();
    });

    it('should create a child logger with context', () => {
      const childLogger = parentLogger.child({ component: 'TestComponent' });

      expect(childLogger).toBeInstanceOf(LoggerService);
      expect(mockPinoInstance.child).toHaveBeenCalledWith({ component: 'TestComponent' });
    });

    it('should call the correct logger methods on child loggers', () => {
      const childLogger = parentLogger.child({ component: 'TestComponent' });
      childLogger.info('child message');

      // Since we're mocking the child function to return our childLoggerInstance
      // and replacing the logger inside the LoggerService, the info call should
      // go to the childLoggerInstance
      expect(childLoggerInstance.info).toHaveBeenCalled();
    });
  });

  describe('Request Context', () => {
    let logger: LoggerService;

    beforeEach(() => {
      logger = new LoggerService();
    });

    it('should create request context with existing correlation ID', () => {
      const req = {
        method: 'GET',
        url: '/test',
        headers: {
          'x-correlation-id': 'existing-correlation-id',
          'user-agent': 'test-agent',
        },
        ip: '127.0.0.1',
      };

      const context = logger.createRequestContext(req);

      expect(context.correlationId).toBe('existing-correlation-id');
      expect(context.method).toBe('GET');
      expect(context.url).toBe('/test');
      expect(context.userAgent).toBe('test-agent');
      expect(context.ip).toBe('127.0.0.1');
    });

    it('should create request context with x-request-id as fallback', () => {
      const req = {
        method: 'POST',
        url: '/api',
        headers: {
          'x-request-id': 'request-id-123',
        },
      };

      const context = logger.createRequestContext(req);

      expect(context.correlationId).toBe('request-id-123');
    });

    it('should generate a correlation ID if none exists', () => {
      const req = {
        method: 'PUT',
        url: '/resource',
        headers: {},
      };

      const context = logger.createRequestContext(req);

      expect(context.correlationId).toBe('mock-uuid'); // From our mocked randomUUID
    });

    it('should handle missing request properties gracefully', () => {
      const req = {};

      const context = logger.createRequestContext(req);

      expect(context.correlationId).toBe('mock-uuid');
      expect(context.method).toBeUndefined();
      expect(context.url).toBeUndefined();
      expect(context.userAgent).toBeUndefined();
      expect(context.ip).toBeUndefined();
    });
  });

  describe('Utility Methods', () => {
    it('should generate a correlation ID', () => {
      const logger = new LoggerService();
      const correlationId = logger.generateCorrelationId();

      expect(correlationId).toBe('mock-uuid');
    });

    it('should return the raw pino logger', () => {
      const logger = new LoggerService();
      const rawLogger = logger.getRawLogger();

      expect(rawLogger).toBe(mockPinoInstance);
    });
  });

  describe('Factory Functions', () => {
    it('should create a logger with default factory function', () => {
      const logger = createLogger();

      expect(logger).toBeInstanceOf(LoggerService);
      expect(mockPino).toHaveBeenCalled();
    });

    it('should create a logger with custom config via factory function', () => {
      const logger = createLogger({
        level: LogLevel.DEBUG,
        appName: 'factory-app',
      });

      expect(logger).toBeInstanceOf(LoggerService);
      const pinoOptions = mockPino.mock.calls[0][0];
      expect(pinoOptions.level).toBe(LogLevel.DEBUG);
      expect(pinoOptions.base.app).toBe('factory-app');
    });
  });
});
