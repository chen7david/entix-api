import 'reflect-metadata';
import { Container } from 'typedi';
import { OpenapiController } from '@domains/openapi/openapi.controller';
import { OpenApiService } from '@domains/openapi/openapi.service';
import { Response } from 'express';

describe('OpenapiController', () => {
  let controller: OpenapiController;
  let mockService: jest.Mocked<OpenApiService>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    Container.reset();
    mockService = {
      generateSpec: jest.fn().mockReturnValue({ foo: 'bar' }),
    } as unknown as jest.Mocked<OpenApiService>;
    Container.set(OpenApiService, mockService);
    controller = Container.get(OpenapiController);
    mockResponse = {
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should return spec via res.json and return the response', () => {
    const result = controller.getSpec(mockResponse as Response);
    expect(mockService.generateSpec).toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalledWith({ foo: 'bar' });
    expect(result).toBe(mockResponse);
  });
});
