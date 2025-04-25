import { IntegrationTestManager } from '@shared/utils/test-helpers/integration-test-manager.util';
import { faker } from '@faker-js/faker';

describe('User API - Integration', () => {
  let manager: IntegrationTestManager;

  beforeAll(() => {
    manager = new IntegrationTestManager();
  });

  afterAll(async () => {
    await manager.close();
  });

  describe('POST /v1/users', () => {
    it('should return 422 for missing name', async () => {
      const userData = { email: faker.internet.email() };
      const response = await manager.request.post('/v1/users').send(userData);
      expect(response.status).toBe(422);
    });
  });
});
