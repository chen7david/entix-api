import pino from 'pino';
import { Logger, logger } from './logger.service';

// Define mock types
interface MockPinoLogger {
  fatal: jest.Mock;
  error: jest.Mock;
  warn: jest.Mock;
  info: jest.Mock;
  debug: jest.Mock;
  trace: jest.Mock;
  child: jest.Mock;
}

interface MockPinoFunction extends jest.Mock {
  stdTimeFunctions: {
    isoTime: () => string;
  };
}

// Mock pino module
jest.mock('pino', () => {
  // Create the mock logger
  const mockPinoLogger: MockPinoLogger = {
    fatal: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };

  // Create and configure mock pino function
  const mockPino = jest.fn(() => mockPinoLogger) as MockPinoFunction;
  mockPino.stdTimeFunctions = {
    isoTime: jest.fn(() => '2024-03-14T12:00:00.000Z'),
  };

  return mockPino;
});

describe('Logger Service', () => {
  let mockPinoInstance: MockPinoLogger;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPinoInstance = pino() as unknown as MockPinoLogger;
  });

  describe('Default Logger Instance', () => {
    it('should create a default logger instance', () => {
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should log messages at different levels', () => {
      const testMessage = 'test message';
      const testMeta = { key: 'value' };

      logger.fatal(testMessage, testMeta);
      expect(mockPinoInstance.fatal).toHaveBeenCalledWith(testMeta, testMessage);

      logger.error(testMessage, undefined, testMeta);
      expect(mockPinoInstance.error).toHaveBeenCalledWith(
        { ...testMeta, error: undefined },
        testMessage,
      );

      logger.warn(testMessage, testMeta);
      expect(mockPinoInstance.warn).toHaveBeenCalledWith(testMeta, testMessage);

      logger.info(testMessage, testMeta);
      expect(mockPinoInstance.info).toHaveBeenCalledWith(testMeta, testMessage);

      logger.debug(testMessage, testMeta);
      expect(mockPinoInstance.debug).toHaveBeenCalledWith(testMeta, testMessage);

      logger.trace(testMessage, testMeta);
      expect(mockPinoInstance.trace).toHaveBeenCalledWith(testMeta, testMessage);
    });
  });

  describe('Contextual Logger', () => {
    it('should create a logger with context', () => {
      const contextLogger = new Logger('TestContext');
      expect(mockPinoInstance.child).toHaveBeenCalledWith({ context: 'TestContext' });
    });

    it('should create a new context using setContext', () => {
      const contextLogger = new Logger();
      const newContextLogger = contextLogger.setContext('NewContext');

      expect(newContextLogger).toBeInstanceOf(Logger);
      expect(mockPinoInstance.child).toHaveBeenCalledWith({ context: 'NewContext' });
    });
  });

  describe('Error Logging', () => {
    it('should properly format error objects', () => {
      const testError = new Error('Test error');
      const testMeta = { additionalInfo: 'test' };

      logger.error('Error occurred', testError, testMeta);

      expect(mockPinoInstance.error).toHaveBeenCalledWith(
        {
          ...testMeta,
          error: {
            message: testError.message,
            stack: testError.stack,
            name: testError.name,
          },
        },
        'Error occurred',
      );
    });

    it('should handle undefined errors', () => {
      const testMeta = { additionalInfo: 'test' };

      logger.error('Error occurred', undefined, testMeta);

      expect(mockPinoInstance.error).toHaveBeenCalledWith(
        {
          ...testMeta,
          error: undefined,
        },
        'Error occurred',
      );
    });
  });

  describe('Metadata Handling', () => {
    it('should handle undefined metadata', () => {
      logger.info('Test message');
      expect(mockPinoInstance.info).toHaveBeenCalledWith({}, 'Test message');
    });

    it('should merge metadata with error information', () => {
      const testError = new Error('Test error');
      const testMeta = { userId: '123' };

      logger.error('Error occurred', testError, testMeta);

      expect(mockPinoInstance.error).toHaveBeenCalledWith(
        {
          userId: '123',
          error: {
            message: testError.message,
            stack: testError.stack,
            name: testError.name,
          },
        },
        'Error occurred',
      );
    });
  });
});
