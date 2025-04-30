import 'reflect-metadata';
import { OpenApiService } from '@domains/openapi/openapi.service';

describe('OpenApiService', () => {
  let service: OpenApiService;

  beforeEach(() => {
    service = new OpenApiService();
  });

  it('generateSpec should return a spec object with correct info and components', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spec = service.generateSpec() as any;
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
