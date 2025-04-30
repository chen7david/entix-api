import type { LoggerService } from '@shared/services/logger/logger.service';

/**
 * Returns a fully-featured mock LoggerService for use in tests.
 * All methods are jest.fn() mocks and child() returns itself for chaining.
 */
export function createMockLogger(): LoggerService {
  const mockLogger: Partial<LoggerService> = {
    fatal: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    child: jest.fn().mockImplementation(() => mockLogger),
    component: jest.fn().mockImplementation(() => mockLogger),
    cleanup: jest.fn(),
  };
  return mockLogger as LoggerService;
}
