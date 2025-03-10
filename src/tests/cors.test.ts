import request from 'supertest';
import { createApp } from '../app';

describe('CORS Configuration', () => {
  const app = createApp();

  it('should handle preflight requests correctly', async () => {
    const response = await request(app)
      .options('/api/health')
      .set('Origin', 'http://example.com')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'Content-Type,Authorization');

    expect(response.status).toBe(204);
    expect(response.header['access-control-allow-origin']).toBeDefined();
    expect(response.header['access-control-allow-methods']).toBeDefined();
    expect(response.header['access-control-allow-headers']).toBeDefined();
  });

  it('should include CORS headers in regular responses', async () => {
    const response = await request(app).get('/api/health').set('Origin', 'http://example.com');

    expect(response.status).toBe(200);
    expect(response.header['access-control-allow-origin']).toBeDefined();
  });
});
