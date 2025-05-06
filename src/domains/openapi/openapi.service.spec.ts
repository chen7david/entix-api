import 'reflect-metadata';
import { OpenApiService } from '@domains/openapi/openapi.service';
import { Container } from 'typedi';
import { LoggerService } from '@shared/services/logger/logger.service';
import { createMockLogger } from '@tests/mocks/logger.service.mock';

describe('OpenApiService', () => {
  let openApiService: OpenApiService;
  let mockLogger: jest.Mocked<LoggerService>;

  beforeEach(() => {
    Container.reset();

    mockLogger = createMockLogger();
    Container.set(LoggerService, mockLogger);

    openApiService = Container.get(OpenApiService);
  });

  it('generateSpec should return a spec object with correct info and components', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spec = openApiService.generateSpec() as any;
    expect(spec).toHaveProperty('info');
    expect(spec.info).toMatchObject({
      title: 'Entix API',
      version: '1.0.0',
    });
    expect(spec).toHaveProperty('components');
    // Components object should exist (may be empty if no schemas registered)
    expect(typeof spec.components).toBe('object');
  });
});
