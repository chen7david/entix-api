import request from 'supertest';
import { createApp } from '@src/app';
import express from 'express';

describe('Example Controller', () => {
  let app: express.Application;

  beforeEach(() => {
    // Create a fresh app instance before each test
    app = createApp({ detailedLogging: false });
  });

  describe('Health Check', () => {
    it('should return 200 OK for the health endpoint', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Test Controller', () => {
    it('should return a welcome message from the test endpoint', async () => {
      const response = await request(app).get('/api/test');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Test controller is working!');
    });

    it('should return the provided ID from the test/:id endpoint', async () => {
      const testId = '123';
      const response = await request(app).get(`/api/test/${testId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testId);
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return a personalized greeting when name parameter is provided', async () => {
      const name = 'John';
      const response = await request(app).get(`/api/test/hello?name=${name}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('greeting', `Hello, ${name}!`);
    });

    it('should return a default greeting when no name parameter is provided', async () => {
      const response = await request(app).get('/api/test/hello');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('greeting', 'Hello, World!');
    });
  });

  describe('CORS', () => {
    it('should have CORS headers enabled', async () => {
      const response = await request(app)
        .options('/api/test')
        .set('Origin', 'http://example.com')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body.message).toEqual('Not found');
    });
  });
});
