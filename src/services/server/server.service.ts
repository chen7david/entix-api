/**
 * A service class that manages an HTTP server instance for Express applications.
 * @remarks
 * This service provides a wrapper around Express and Node's HTTP server with lifecycle management.
 * It can be used with any Express application but is designed to work seamlessly with AppService
 * in this application for complete lifecycle management.
 */
import { ServerServiceOptions, ServerListeningInfo } from './server.types';
import express from 'express';
import http from 'http';
import os from 'os';
// import { LoggerService } from '@src/services/logger/logger.service';
// import { Container } from '@src/shared/utils/typedi/typedi.util';

// const logger = Container.has(LoggerService);
// console.log({ logger });
// const serverLogger = logger.getChildLogger({ context: 'ServerService' });

export class ServerService {
  /** The Express application instance */
  private readonly app: express.Application;

  /** The HTTP server instance */
  private readonly server: http.Server;

  /** The port number the server listens on */
  private readonly port: number;

  /** Tracks if the server is currently running */
  private isRunning = false;

  /** Tracks if shutdown is in progress */
  private isShuttingDown = false;

  /**
   * Creates a new ServerService instance.
   * @param options - Configuration options for the server
   * @throws {Error} If required options are missing or server initialization fails
   *
   * @example
   * ```typescript
   * const app = express();
   * const serverService = new ServerService({
   *   app,
   *   port: 3000,
  //  *   onListening: ({ port, ip }) =>logger.info(`Server running at http://${ip}:${port}`),
   * });
   * ```
   */
  constructor(options: ServerServiceOptions) {
    if (!options?.app) {
      throw new Error('Express application instance is required');
    }
    if (typeof options.port !== 'number') {
      throw new Error('Port number is required');
    }

    this.app = options.app;
    this.port = options.port;
    this.server = http.createServer(this.app);
    this.setupEventHandlers(options);
  }

  /**
   * Starts the HTTP server on the configured port.
   * @returns {Promise<void>} Resolves when the server starts listening
   * @throws {Error} If the server fails to start or is already running
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Server is already running');
    }

    return new Promise((resolve, reject) => {
      this.server.listen(this.port, () => {
        this.isRunning = true;
        resolve();
      });

      this.server.once('error', reject);
    });
  }

  /**
   * Gracefully stops the HTTP server.
   * @returns {Promise<void>} Resolves when the server has stopped
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    return new Promise<void>((resolve) => {
      this.server.close(() => {
        this.isRunning = false;
        resolve();
      });
    });
  }

  /**
   * Gets the server's IP address.
   * @returns {string} The server's IPv4 address or 'localhost' if none found
   */
  public getServerIp(): string {
    const interfaces = os.networkInterfaces();
    for (const [, iface] of Object.entries(interfaces)) {
      if (!iface) continue;

      const ipv4Interface = iface.find(
        (alias) =>
          alias.family === 'IPv4' &&
          !alias.internal &&
          alias.address !== '127.0.0.1'
      );

      if (ipv4Interface) {
        return ipv4Interface.address;
      }
    }
    return 'localhost';
  }

  /**
   * Sets up event handlers for the server.
   * @param options - Server configuration options containing event handlers
   * @internal
   */
  private setupEventHandlers(options: ServerServiceOptions): void {
    const shutdownHandler = async () => {
      // Prevent multiple shutdown attempts
      if (this.isShuttingDown) {
        return;
      }
      this.isShuttingDown = true;

      // logger.info('Starting graceful shutdown...');

      try {
        if (options.beforeShutdown) {
          // logger.info('Running beforeShutdown handler...');
          await Promise.resolve(options.beforeShutdown());
        }

        if (this.isRunning) {
          // logger.info('Stopping server...');
          await this.stop();
          // logger.info('Server stopped successfully');
        }
      } catch (error) {
        console.error('Error during shutdown:', error);
        if (options.onError) {
          options.onError(error as Error);
        }
        process.exit(1);
      }

      process.exit(0);
    };

    // Use process.once to ensure handlers run only once
    process.once('SIGTERM', shutdownHandler);
    process.once('SIGINT', shutdownHandler);

    this.server.on('error', (error: Error) => {
      if (options.onError) {
        options.onError(error);
      }
    });

    this.server.on('listening', () => {
      if (options.onListening) {
        const info: ServerListeningInfo = {
          port: this.port,
          ip: this.getServerIp(),
        };
        options.onListening(info);
      }
    });
  }
}
