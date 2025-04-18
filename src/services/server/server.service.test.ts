import express, { RequestHandler } from 'express';
import { ServerService } from './server.service';
import request from 'supertest';

// Increase timeout for shutdown tests
jest.setTimeout(10000);

describe('ServerService', () => {
  let app: express.Application;
  let serverService: ServerService;
  const TEST_PORT = 4000;

  beforeEach(() => {
    app = express();
    const testHandler: RequestHandler = (_req, res) => {
      res.json({ message: 'test' });
    };
    app.get('/test', testHandler);

    // Mock process.exit before each test
    jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  afterEach(async () => {
    // Ensure we cleanup any running servers
    if (serverService) {
      await serverService.stop();
    }

    // Restore all mocks
    jest.restoreAllMocks();

    // Remove all process signal listeners
    process.removeAllListeners('SIGTERM');
    process.removeAllListeners('SIGINT');
  });

  describe('Constructor Validation', () => {
    it('should throw error when port is not provided', () => {
      expect(() => {
        // @ts-expect-error Testing invalid input
        serverService = new ServerService({ app });
      }).toThrow('Port number is required');
    });

    it('should throw error when app is not provided', () => {
      expect(() => {
        // @ts-expect-error Testing invalid input
        serverService = new ServerService({ port: TEST_PORT });
      }).toThrow('Express application instance is required');
    });

    it('should create instance with valid options', () => {
      expect(() => {
        serverService = new ServerService({ app, port: TEST_PORT });
      }).not.toThrow();
    });
  });

  describe('Server Lifecycle', () => {
    it('should start server and handle requests', async () => {
      serverService = new ServerService({ app, port: TEST_PORT });
      await serverService.start();

      const response = await request(app).get('/test').expect(200);

      expect(response.body).toEqual({ message: 'test' });
    });

    it('should not allow starting server twice', async () => {
      serverService = new ServerService({ app, port: TEST_PORT });
      await serverService.start();

      await expect(serverService.start()).rejects.toThrow(
        'Server is already running'
      );
    });

    it('should allow stopping server multiple times', async () => {
      serverService = new ServerService({ app, port: TEST_PORT });
      await serverService.start();
      await serverService.stop();
      await expect(serverService.stop()).resolves.not.toThrow();
    });

    it('should call onListening handler with correct info', async () => {
      const onListening = jest.fn();
      serverService = new ServerService({
        app,
        port: TEST_PORT,
        onListening,
      });

      await serverService.start();

      expect(onListening).toHaveBeenCalledWith({
        port: TEST_PORT,
        ip: expect.any(String),
      });
    });

    it('should call onError handler when error occurs', async () => {
      const onError = jest.fn();
      const conflictingServer = new ServerService({
        app: express(),
        port: TEST_PORT,
      });

      try {
        await conflictingServer.start();
        serverService = new ServerService({
          app,
          port: TEST_PORT,
          onError,
        });

        await expect(serverService.start()).rejects.toThrow();
        expect(onError).toHaveBeenCalled();
      } finally {
        await conflictingServer.stop();
      }
    }, 10000);
  });

  describe('Shutdown Sequence', () => {
    it('should execute shutdown sequence in correct order', async () => {
      const sequence: string[] = [];
      const beforeShutdown = jest.fn().mockImplementation(async () => {
        sequence.push('beforeShutdown');
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      serverService = new ServerService({
        app,
        port: TEST_PORT,
        beforeShutdown,
      });

      await serverService.start();
      sequence.push('started');

      // Trigger shutdown
      process.emit('SIGTERM');

      // Wait for shutdown sequence
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(sequence).toEqual(['started', 'beforeShutdown']);
      expect(beforeShutdown).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should handle errors in shutdown sequence', async () => {
      const error = new Error('Shutdown failed');
      const beforeShutdown = jest.fn().mockRejectedValue(error);
      const onError = jest.fn();

      serverService = new ServerService({
        app,
        port: TEST_PORT,
        beforeShutdown,
        onError,
      });

      await serverService.start();

      // Trigger shutdown
      process.emit('SIGTERM');

      // Wait for shutdown sequence
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(beforeShutdown).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(error);
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should prevent multiple shutdown attempts', async () => {
      const beforeShutdown = jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      serverService = new ServerService({
        app,
        port: TEST_PORT,
        beforeShutdown,
      });

      await serverService.start();

      // Trigger multiple shutdowns
      process.emit('SIGTERM');
      process.emit('SIGTERM');
      process.emit('SIGINT');

      // Wait for shutdown sequence
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(beforeShutdown).toHaveBeenCalledTimes(1);
      expect(process.exit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Utility Functions', () => {
    it('should get server IP address', () => {
      serverService = new ServerService({ app, port: TEST_PORT });
      const ip = serverService.getServerIp();

      expect(typeof ip).toBe('string');
      expect(ip).toMatch(/^(?:\d{1,3}\.){3}\d{1,3}$|^localhost$/);
    });
  });
});
