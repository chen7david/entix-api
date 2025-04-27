import { IntegrationTestManager } from '@shared/utils/test-helpers/integration-test-manager.util';
import { Container } from 'typedi';

describe('GET /health - Integration', () => {
  let manager: IntegrationTestManager;

  beforeAll(() => {
    manager = Container.get(IntegrationTestManager);
  });

  afterAll(async () => {
    await manager.close();
  });

  it('should return 200 OK with status, message, and timestamp', async () => {
    const response = await manager.request.get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('message', 'API is running');
    expect(response.body).toHaveProperty('timestamp');
    expect(typeof response.body.timestamp).toBe('string');
    // Check if timestamp is a valid ISO string
    expect(!isNaN(Date.parse(response.body.timestamp))).toBe(true);
  });
});
