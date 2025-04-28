import type { LoggerService } from '@shared/services/logger/logger.service';

/**
 * Returns a fully-featured mock LoggerService for use in tests.
 * All methods are jest.fn() mocks and child() returns itself for chaining.
 */
export function createMockLogger(): LoggerService {
  const mockLogger: Partial<LoggerService> = {
    log: jest.fn(),
    child: jest.fn().mockImplementation(() => mockLogger),
    getLogger: jest.fn().mockReturnThis(),
    cleanup: jest.fn(),
  };
  return mockLogger as LoggerService;
}
