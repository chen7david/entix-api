import { IntegrationTestManager } from '@tests/utils/integration-test-manager.util';
import { Container } from 'typedi';
// Removed OpenApiService import as it's no longer used for direct generation in this simplified test

describe('OpenAPI API - Integration', () => {
  describe('GET /api/openapi.json - Integration', () => {
    let manager: IntegrationTestManager;

    beforeAll(() => {
      manager = Container.get(IntegrationTestManager);
      // Removed openApiService instantiation
    });

    afterAll(async () => {
      await manager.close();
    });

    it('should return 200 OK with a valid OpenAPI spec structure', async () => {
      const response = await manager.request.get('/api/openapi.json');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('openapi');
      expect(response.body.openapi).toMatch(/^3\.\d+\.\d+$/); // Check for OpenAPI 3.x.x version
      expect(response.body).toHaveProperty('info');
      expect(response.body.info).toHaveProperty('title', 'Entix API');
      expect(response.body.info).toHaveProperty('version'); // Version can vary, just check presence
      expect(response.body).toHaveProperty('paths');
      expect(response.body).toHaveProperty('components');
      expect(response.body.components).toHaveProperty('schemas');
    });
  });
});
