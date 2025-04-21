import express, { RequestHandler } from 'express';
import { ServerService } from './server.service';
import request from 'supertest';

// Increase timeout for shutdown tests
jest.setTimeout(10000);

describe('ServerService', () => {
  let app: express.Application;
  let serverService: ServerService;
  const TEST_PORT = 4000;

  // Mocks for DI
  let mockAppService: any;
  let mockConfigService: any;
  let mockLoggerService: any;

  beforeEach(() => {
    app = express();
    const testHandler: RequestHandler = (_req, res) => {
      res.json({ message: 'test' });
    };
    app.get('/test', testHandler);

    mockAppService = { getApp: () => app };
    mockConfigService = { env: { PORT: TEST_PORT } };
    mockLoggerService = {
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      fatal: jest.fn(),
      getChildLogger: jest.fn(() => mockLoggerService),
    };

    // Mock process.exit before each test
    jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  afterEach(async () => {
    if (serverService) {
      await serverService.stop();
    }
    jest.restoreAllMocks();
    process.removeAllListeners('SIGTERM');
    process.removeAllListeners('SIGINT');
  });

  describe('Server Lifecycle', () => {
    it('should start server and handle requests', async () => {
      serverService = new ServerService(
        mockAppService,
        mockConfigService,
        mockLoggerService
      );
      serverService.setOptions({ app, port: TEST_PORT });
      await serverService.start();
      const response = await request(app).get('/test').expect(200);
      expect(response.body).toEqual({ message: 'test' });
    });

    it('should not allow starting server twice', async () => {
      serverService = new ServerService(
        mockAppService,
        mockConfigService,
        mockLoggerService
      );
      serverService.setOptions({ app, port: TEST_PORT });
      await serverService.start();
      await expect(serverService.start()).rejects.toThrow(
        'Server is already running'
      );
    });

    it('should allow stopping server multiple times', async () => {
      serverService = new ServerService(
        mockAppService,
        mockConfigService,
        mockLoggerService
      );
      serverService.setOptions({ app, port: TEST_PORT });
      await serverService.start();
      await serverService.stop();
      await expect(serverService.stop()).resolves.not.toThrow();
    });

    it('should call onListening handler with correct info', async () => {
      const onListening = jest.fn();
      serverService = new ServerService(
        mockAppService,
        mockConfigService,
        mockLoggerService
      );
      serverService.setOptions({ app, port: TEST_PORT, onListening });
      await serverService.start();
      expect(onListening).toHaveBeenCalledWith({
        port: TEST_PORT,
        ip: expect.any(String),
      });
    });

    it('should call onError handler when error occurs', async () => {
      const onError = jest.fn();
      const conflictingServer = new ServerService(
        mockAppService,
        mockConfigService,
        mockLoggerService
      );
      conflictingServer.setOptions({ app: express(), port: TEST_PORT });
      try {
        await conflictingServer.start();
        serverService = new ServerService(
          mockAppService,
          mockConfigService,
          mockLoggerService
        );
        serverService.setOptions({ app, port: TEST_PORT, onError });
        await expect(serverService.start()).rejects.toThrow();
        expect(onError).toHaveBeenCalled();
      } finally {
        await conflictingServer.stop();
      }
    });
  });

  describe('Shutdown Sequence', () => {
    it('should execute shutdown sequence in correct order', async () => {
      const sequence: string[] = [];
      const beforeShutdown = jest.fn().mockImplementation(async () => {
        sequence.push('beforeShutdown');
        await new Promise((resolve) => setTimeout(resolve, 100));
      });
      serverService = new ServerService(
        mockAppService,
        mockConfigService,
        mockLoggerService
      );
      serverService.setOptions({ app, port: TEST_PORT, beforeShutdown });
      await serverService.start();
      sequence.push('started');
      process.emit('SIGTERM');
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(sequence).toEqual(['started', 'beforeShutdown']);
      expect(beforeShutdown).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should handle errors in shutdown sequence', async () => {
      const error = new Error('Shutdown failed');
      const beforeShutdown = jest.fn().mockRejectedValue(error);
      const onError = jest.fn();
      serverService = new ServerService(
        mockAppService,
        mockConfigService,
        mockLoggerService
      );
      serverService.setOptions({
        app,
        port: TEST_PORT,
        beforeShutdown,
        onError,
      });
      await serverService.start();
      process.emit('SIGTERM');
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(beforeShutdown).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(error);
      expect(process.exit).toHaveBeenCalledWith(1);
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'Error during shutdown:',
        error
      );
    });

    it('should prevent multiple shutdown attempts', async () => {
      const beforeShutdown = jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });
      serverService = new ServerService(
        mockAppService,
        mockConfigService,
        mockLoggerService
      );
      serverService.setOptions({ app, port: TEST_PORT, beforeShutdown });
      await serverService.start();
      process.emit('SIGTERM');
      process.emit('SIGTERM');
      process.emit('SIGINT');
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(beforeShutdown).toHaveBeenCalledTimes(1);
      expect(process.exit).toHaveBeenCalledTimes(1);
    });
  });
});
