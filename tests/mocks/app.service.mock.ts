import type { AppService } from '@shared/services/app/app.service';
import type { Express } from 'express';

/**
 * Creates a simple mock AppService.
 */
export function createMockAppService(): jest.Mocked<AppService> {
  // Create a very basic mock Express app object
  const mockExpressApp = {
    listen: jest.fn(),
    use: jest.fn(),
    get: jest.fn(),
    // Add other Express methods if needed by tests
  } as unknown as jest.Mocked<Express>;

  return {
    getApp: jest.fn().mockReturnValue(mockExpressApp),
    initialize: jest.fn(), // Add other methods if AppService has them
  } as unknown as jest.Mocked<AppService>;
}
