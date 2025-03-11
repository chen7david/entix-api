import request from 'supertest';
import { createApp } from '../app';

describe('API Server', () => {
  const app = createApp();

  describe('Health Check', () => {
    it('should return 200 OK with status information', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Non-existent route', () => {
    it('should return 404 with JSON response for non-existent routes', async () => {
      const response = await request(app).get('/api/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.type).toBe('application/json');
      expect(response.body).toHaveProperty('status', 404);
      expect(response.body).toHaveProperty('message', 'Resource not found');
      expect(response.body).toHaveProperty('path', '/api/non-existent-route');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
