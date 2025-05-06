import 'reflect-metadata';
import { OpenapiController } from '@domains/openapi/openapi.controller';
import { OpenApiService } from '@domains/openapi/openapi.service';
import { Container } from 'typedi';
import { createMockRes } from '@tests/mocks/express.mock'; // Assuming express mock exists
import { createMockOpenApiService } from '@tests/mocks/openapi.service.mock'; // Import factory

describe('OpenapiController', () => {
  let controller: OpenapiController;
  let mockOpenApiService: jest.Mocked<OpenApiService>;

  beforeEach(() => {
    Container.reset();

    // Create mock using factory
    mockOpenApiService = createMockOpenApiService();

    // Register mock service with the container
    Container.set(OpenApiService, mockOpenApiService);

    // Get controller instance from container
    controller = Container.get(OpenapiController);
  });

  it('should return spec via res.json and return the response', () => {
    const mockRes = createMockRes();
    const mockSpec = { openapi: '3.1.0', info: { title: 'Test' } };
    mockOpenApiService.generateSpec.mockReturnValue(mockSpec);

    const result = controller.getSpec(mockRes);

    expect(mockOpenApiService.generateSpec).toHaveBeenCalledTimes(1);
    expect(mockRes.json).toHaveBeenCalledWith(mockSpec);
    expect(result).toBe(mockRes); // Controller should return the response object
  });
});
