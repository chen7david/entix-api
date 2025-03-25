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

  describe('Example Endpoints', () => {
    it('should return a welcome message from the examples endpoint', async () => {
      const response = await request(app).get('/api/v1/examples');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Example service is working!');
    });

    it('should return the provided ID and metadata from the examples/:id endpoint', async () => {
      const exampleId = '123';
      const response = await request(app).get(`/api/v1/examples/${exampleId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', exampleId);
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('type', 'example');
    });

    it('should return a personalized greeting when name parameter is provided', async () => {
      const name = 'John';
      const response = await request(app).get(`/api/v1/examples/greeting?name=${name}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('greeting', `Welcome to the example API, ${name}!`);
    });

    it('should return a default greeting when no name parameter is provided', async () => {
      const response = await request(app).get('/api/v1/examples/greeting');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('greeting', 'Welcome to the example API!');
    });

    it('should handle invalid IDs gracefully', async () => {
      const response = await request(app).get('/api/v1/examples/invalid-id');

      expect(response.status).toBe(200); // or 400 depending on your error handling
      expect(response.body).toHaveProperty('id', 'invalid-id');
      expect(response.body).toHaveProperty('type', 'example');
    });
  });

  describe('CORS', () => {
    it('should have CORS headers enabled', async () => {
      const response = await request(app)
        .options('/api/v1/examples')
        .set('Origin', 'http://example.com')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/v1/non-existent-endpoint');

      expect(response.status).toBe(404);
      expect(response.body.message).toEqual('Not found');
    });
  });

  describe('API Version Handling', () => {
    it('should reject requests to invalid API versions', async () => {
      const response = await request(app).get('/api/v2/examples');

      expect(response.status).toBe(404);
      expect(response.body.message).toEqual('Not found');
    });
  });
});
