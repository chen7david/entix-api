import 'reflect-metadata';
import { Container } from 'typedi';
import { OpenapiController } from '@domains/openapi/openapi.controller';
import { OpenApiService } from '@domains/openapi/openapi.service';
import { Response } from 'express';

describe('OpenapiController', () => {
  let controller: OpenapiController;
  let mockOpenApiService: jest.Mocked<OpenApiService>;
  let mockRes: Response;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock response
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;

    // Mock OpenApiService
    mockOpenApiService = {
      generateSpec: jest.fn(),
    } as unknown as jest.Mocked<OpenApiService>;

    // Set up the mock spec
    const mockSpec = {
      openapi: '3.0.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      paths: {}, // Add required paths property
    };
    mockOpenApiService.generateSpec.mockReturnValue(mockSpec);

    // Register mocks in container
    Container.set(OpenApiService, mockOpenApiService);

    // Create controller
    controller = new OpenapiController(mockOpenApiService);
  });

  it('should return spec via res.json and return the response', () => {
    const result = controller.getSpec(mockRes);

    expect(mockOpenApiService.generateSpec).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        openapi: '3.0.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
        },
        paths: {},
      }),
    );
    expect(result).toBe(mockRes);
  });
});
