import {
  NewRelicService,
  EnrichLoggerOptionsParams,
} from '@shared/services/newrelic/newrelic.service';

describe('NewRelicService', () => {
  let service: NewRelicService;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    service = new NewRelicService();
    originalConsoleError = console.error;
  });

  afterEach(() => {
    console.error = originalConsoleError;
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should return enriched options when enabled is true and nrPino works', () => {
    const mockNrPino = jest.fn((opts) => ({ ...opts, enriched: true }));
    jest.mock('@newrelic/pino-enricher', () => mockNrPino, { virtual: true });
    // Force require cache update
    jest.isolateModules(() => {
      const params: EnrichLoggerOptionsParams = {
        options: { level: 'info' },
        enabled: true,
      };
      const result = service.enrichLoggerOptions(params);
      expect(result).toEqual({ level: 'info', enriched: true });
      expect(mockNrPino).toHaveBeenCalledWith({ level: 'info' });
    });
  });

  it('should return original options when enabled is false', () => {
    const params: EnrichLoggerOptionsParams = {
      options: { level: 'debug' },
      enabled: false,
    };
    const result = service.enrichLoggerOptions(params);
    expect(result).toEqual({ level: 'debug' });
  });

  it('should log error and return original options if require fails', () => {
    // Simulate require throwing
    const error = new Error('require failed');
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.mock(
      '@newrelic/pino-enricher',
      () => {
        throw error;
      },
      { virtual: true },
    );
    jest.isolateModules(() => {
      const params: EnrichLoggerOptionsParams = {
        options: { level: 'warn' },
        enabled: true,
      };
      const result = service.enrichLoggerOptions(params);
      expect(result).toEqual({ level: 'warn' });
      expect(console.error).toHaveBeenCalledWith(
        '[NewRelicService] Failed to initialize New Relic enricher:',
        error,
      );
    });
  });
});
