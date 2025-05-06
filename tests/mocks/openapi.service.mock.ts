import type { OpenApiService } from '@domains/openapi/openapi.service';

/**
 * Creates a simple mock OpenApiService.
 */
export function createMockOpenApiService(): jest.Mocked<OpenApiService> {
  return {
    generateSpec: jest.fn().mockReturnValue({ openapi: '3.0.0', info: { title: 'Mock API' } }),
    // Add other methods if OpenApiService has them
  } as unknown as jest.Mocked<OpenApiService>;
}
