import type { LoggerService } from '@shared/services/logger/logger.service';

/**
 * Creates a Jest mock for the LoggerService, focusing on public methods.
 *
 * @returns A mocked LoggerService instance.
 */
export function createMockLogger(): jest.Mocked<LoggerService> {
  const mock = {
    fatal: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    child: jest.fn(),
    component: jest.fn(),
    cleanup: jest.fn().mockResolvedValue(undefined),
    log: jest.fn(), // Include the generic log method if it's public
    // Add any other strictly *public* methods or properties if needed
  };

  // Mock implementation for child/component to return the same mock instance
  mock.child.mockImplementation(() => mock as unknown as jest.Mocked<LoggerService>);
  mock.component.mockImplementation(() => mock as unknown as jest.Mocked<LoggerService>);

  // Cast to unknown first to bypass strict private property checks
  return mock as unknown as jest.Mocked<LoggerService>;
}

// Optional: Export a default silent logger instance for convenience
export const mockLogger = createMockLogger();
