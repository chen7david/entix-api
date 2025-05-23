import { IntegrationTestManager } from '@tests/utils/integration-test-manager.util';
import { Container } from 'typedi';
describe('OpenAPI API - Integration', () => {
  describe('GET /api/openapi.json - Integration', () => {
    let manager: IntegrationTestManager;

    beforeAll(() => {
      manager = Container.get(IntegrationTestManager);
    });

    afterAll(async () => {
      await manager.close();
    });

    it('should return 200 OK with a valid OpenAPI spec structure', async () => {
      const response = await manager.request.get('/openapi.json');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('openapi');
      expect(response.body).toHaveProperty('info');
      expect(response.body).toHaveProperty('paths');
      expect(response.body).toHaveProperty('components');
      expect(response.body.info).toHaveProperty('title', 'Entix API');
    });
  });
});
