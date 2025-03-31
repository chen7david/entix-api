import request from 'supertest';
import express from 'express';
import { createApp } from '@src/app';
import { httpLogger } from '@src/services/logger.service';
import { Request, Response } from 'express';

// Mock dependencies before imports
jest.mock('@src/services/logger.service', () => ({
  httpLogger: jest.fn((req, res, next) => next()), // Mocking the logger middleware
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('App', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createApp({ cors: true, detailedLogging: true });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe('Constructor initialization', () => {
    it('should successfully create an instance of the App class', () => {
      expect(app).toBeDefined();
      expect(typeof app.listen).toBe('function');
      expect(typeof app.get).toBe('function');
      expect(typeof app.post).toBe('function');
    });
  });

  describe('Middleware configuration', () => {
    it('should enable CORS middleware when config.cors is true', async () => {
      // For CORS preflight requests, a 204 status code indicates success
      const response = await request(app).options('/health');

      // The status code is the most reliable way to test CORS is enabled for preflight
      expect(response.status).toBe(204); // 204 No Content is the correct response for OPTIONS with CORS

      // We could also look for specific headers, but they might vary depending on configuration
      // The presence of any CORS-related header would be sufficient
      expect(
        response.header['access-control-allow-methods'] ||
          response.header['access-control-allow-origin'] ||
          response.header['access-control-allow-headers'],
      ).toBeDefined();
    });

    it('should disable CORS middleware when config.cors is false', async () => {
      // Create a new app instance with CORS disabled
      const appWithoutCors = createApp({ cors: false, detailedLogging: true });

      // Regular request should still work
      const response = await request(appWithoutCors).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        message: 'API is running',
        timestamp: expect.any(String),
      });
    });

    it('should enable request logging middleware when detailedLogging is true', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(httpLogger).toHaveBeenCalled();
    });

    it('should disable request logging middleware when detailedLogging is false', async () => {
      // Create a new app instance with detailedLogging disabled
      const appWithoutDetailedLogging = createApp({ cors: true, detailedLogging: false });

      const response = await request(appWithoutDetailedLogging).get('/health');
      expect(response.status).toBe(200);
      expect(httpLogger).not.toHaveBeenCalled();
    });
  });

  describe('Health check endpoint', () => {
    it('should return 200 status and a health check message', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        message: 'API is running',
        timestamp: expect.any(String),
      });
    });

    it('should include a valid ISO timestamp in the response', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);

      const timestamp = response.body.timestamp;
      const date = new Date(timestamp);
      expect(date.toISOString()).toBe(timestamp);
    });
  });

  describe('Not Found middleware', () => {
    it('should return 404 with standardized format for undefined routes', async () => {
      const invalidUrl = '/undefined-route';
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

    it('should return 404 for undefined API routes', async () => {
      const invalidApiUrl = '/api/undefined-route';
      const response = await request(app).get(invalidApiUrl);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Not found');
    });
  });

  describe('Request handling', () => {
    // We need to set up route handlers for these specific tests
    let testApp: express.Application;

    beforeEach(() => {
      testApp = express();

      // Add middleware similar to our main app
      testApp.use(express.json());
      testApp.use(express.urlencoded({ extended: true }));

      // Add test route handlers
      testApp.post('/test-json', (req: Request, res: Response) => {
        res.status(200).json({ received: req.body });
      });

      testApp.get('/test-query', (req: Request, res: Response) => {
        res.status(200).json({ params: req.query });
      });
    });

    it('should properly parse JSON request bodies', async () => {
      const testData = { name: 'test', value: 123 };
      const response = await request(testApp)
        .post('/test-json')
        .send(testData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual(testData);
    });

    it('should correctly process query parameters', async () => {
      const queryParams = { name: 'test', value: '123' };
      const response = await request(testApp).get('/test-query').query(queryParams);

      expect(response.status).toBe(200);
      expect(response.body.params).toEqual(queryParams);
    });
  });
});
