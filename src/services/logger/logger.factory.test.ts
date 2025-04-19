import { LoggerFactory } from './logger.factory';
import { LoggerService } from './logger.service';
import { HttpLoggerService } from './http-logger.service';
import pino from 'pino';
import createPinoEnricher from '@newrelic/pino-enricher';

jest.mock('pino');

/**
 * Mock pino-http to prevent TypeError in HttpLoggerService tests.
 */
jest.mock('pino-http', () => {
  return jest.fn(() => jest.fn());
});

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

/**
 * Mocks the @newrelic/pino-enricher module.
 */
jest.mock('@newrelic/pino-enricher', () => jest.fn((opts) => opts));

describe('LoggerFactory', () => {
  let loggerFactory: LoggerFactory;

  beforeEach(() => {
    jest.clearAllMocks();
    loggerFactory = new LoggerFactory();
  });

  /**
   * Tests that createLogger returns a LoggerService instance with default options.
   */
  it('should create a LoggerService instance with default options', () => {
    const logger = loggerFactory.createLogger();
    expect(logger).toBeInstanceOf(LoggerService);
    // pino should be called with correct options
    expect(pino).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'test-app',
        level: 'info',
        base: expect.objectContaining({ env: 'test' }),
      })
    );
  });

  /**
   * Tests that createLogger returns a LoggerService with pretty print enabled.
   */
  it('should create a LoggerService with pretty print enabled', () => {
    const logger = loggerFactory.createLogger({ pretty: true });
    expect(logger).toBeInstanceOf(LoggerService);
    expect(pino).toHaveBeenCalledWith(
      expect.objectContaining({
        transport: expect.objectContaining({
          target: 'pino-pretty',
        }),
      })
    );
  });

  /**
   * Tests that createLogger does not call the New Relic enricher if newRelicEnabled is false.
   */
  it('should not call the New Relic enricher if newRelicEnabled is false', () => {
    loggerFactory.createLogger({ newRelicEnabled: false });
    expect(createPinoEnricher).not.toHaveBeenCalled();
  });

  /**
   * Tests that createHttpLogger returns an HttpLoggerService instance.
   */
  it('should create an HttpLoggerService instance', () => {
    const logger = loggerFactory.createLogger();
    const httpLogger = loggerFactory.createHttpLogger(logger);
    expect(httpLogger).toBeInstanceOf(HttpLoggerService);
  });
});
