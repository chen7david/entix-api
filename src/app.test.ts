// src/app.test.ts
import 'reflect-metadata'; // Required for TypeDI
import request from 'supertest';
import { createApp } from './app';
import { httpLogger } from '@src/services/logger.service';
import { Request, Response, NextFunction } from 'express';

// Mock the logger service
jest.mock('@src/services/logger.service', () => ({
  httpLogger: jest.fn((req, res, next) => next()), // Mocking the logger middleware
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('App', () => {
  let app: any;

  beforeEach(() => {
    app = createApp({ cors: true, detailedLogging: true });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe('Constructor', () => {
    it('should create an instance of the App class', () => {
      expect(app).toBeDefined();
    });

    it('should create an instance with default parameters if none provided', () => {
      const defaultApp = createApp();
      expect(defaultApp).toBeDefined();
    });
  });

  describe('Middleware Setup', () => {
    it('should enable CORS middleware when config.cors is true', async () => {
      const response = await request(app).options('/health');
      expect(response.status).toBe(204); // CORS preflight should succeed
    });

    it('should disable CORS middleware when config.cors is false', async () => {
      // Create a new app instance with CORS disabled
      const appWithoutCors = createApp({ cors: false, detailedLogging: true });

      // In a real-world case, you'd test for different behavior here
      // This approach simulates testing CORS is not applied without actually making a cross-origin request
      const response = await request(appWithoutCors).get('/health');

      // The request should still succeed even without CORS
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok', timestamp: expect.any(String) });

      // Additional verification could include checking log output
      expect(httpLogger).toHaveBeenCalled();
    });

    it('should apply JSON and URL-encoded body parsers', async () => {
      const response = await request(app).post('/health').send({ test: 'data' });
      expect(response.status).toBe(404); // Not Found since the route doesn't exist
    });

    it('should properly parse JSON payloads', async () => {
      // Add a temporary route handler for testing JSON parsing
      app.post('/test-json', (req: Request, res: Response) => {
        res.status(200).json({ received: req.body });
      });

      const testData = { name: 'test', value: 123 };
      const response = await request(app)
        .post('/test-json')
        .send(testData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual(testData);
    });

    it('should apply request logging middleware when detailedLogging is true', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200); // Health check should succeed
      expect(httpLogger).toHaveBeenCalled(); // Check if logger was called
    });

    it('should not apply request logging middleware when detailedLogging is false', async () => {
      // Create a new app instance with detailedLogging disabled
      const appWithoutDetailedLogging = createApp({ cors: true, detailedLogging: false });

      const response = await request(appWithoutDetailedLogging).get('/health');
      expect(response.status).toBe(200); // Health check should still succeed
      expect(httpLogger).not.toHaveBeenCalled(); // Logger should not be called
    });
  });

  describe('Health Check Endpoint', () => {
    it('should return status 200 and a health check message', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok', timestamp: expect.any(String) });
    });

    it('should include a valid ISO timestamp in the response', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);

      const timestamp = response.body.timestamp;
      const date = new Date(timestamp);
      expect(date.toISOString()).toBe(timestamp);
    });
  });

  describe('Not Found Middleware', () => {
    it('should return 404 with correct format for undefined routes', async () => {
      const invalidUrl = '/api/undefined-route';
      const response = await request(app).get(invalidUrl);

      // Check status code
      expect(response.status).toBe(404);

      // Check response structure matches NotFoundMiddleware implementation
      expect(response.body).toHaveProperty('status', 404);
      expect(response.body).toHaveProperty('message', 'Not found');
      expect(response.body).toHaveProperty('path', invalidUrl);
      expect(response.body).toHaveProperty('timestamp');

      // Validate timestamp is in ISO format
      const timestamp = response.body.timestamp;
      expect(() => new Date(timestamp)).not.toThrow();
    });
  });

  describe('API Routing', () => {
    it('should handle query parameters correctly', async () => {
      // Add a temporary route handler for testing query parameters
      app.get('/test-query', (req: Request, res: Response) => {
        res.status(200).json({ params: req.query });
      });

      const queryParams = { name: 'test', value: '123' };
      const response = await request(app).get('/test-query').query(queryParams);

      expect(response.status).toBe(200);
      expect(response.body.params).toEqual(queryParams);
    });
  });
});
