import { LoggerService } from '@core/services/logger.service';
import { Injectable } from '@core/utils/di.util';
import { AppService } from '@core/services/app.service';
import { CleanupHandler } from '@core/types/app.types';
import { ConfigService } from '@core/services/config.service';
import { Server } from 'http';

/**
 * Responsible for managing the HTTP server lifecycle
 *
 * This service handles server initialization, graceful shutdown,
 * and orchestrates cleanup of all registered services when the
 * application is terminating.
 */
@Injectable()
export class ServerService implements CleanupHandler {
  private readonly logger: LoggerService;
  private readonly cleanupHandlers: CleanupHandler[] = [];
  private httpServer: Server | null = null;

  /**
   * Creates a new ServerService instance
   *
   * @param appService - The application service that provides the Express app
   * @param loggerService - The logger service for logging
   * @param configService - The configuration service for retrieving app settings
   */
  // eslint-disable-next-line max-params
  constructor(
    private readonly appService: AppService,
    private readonly loggerService: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.logger = loggerService.setContext('Server');
    // Register services that need cleanup
    this.registerForCleanup(this.appService);
    this.registerForCleanup(this.loggerService);
  }

  /**
   * Initialize the server and report startup status
   *
   * @throws Error if server initialization fails
   */
  public async initialize(): Promise<void> {
    try {
      // Get the port from config
      const port = this.configService.get('APP_PORT');

      // Store the HTTP server instance for later cleanup
      this.httpServer = this.appService.getApp().listen(port, () => {
        this.logger.info(`Server started on port ${port}`);

        // Log additional application info
        this.logger.info('Server initialization complete', {
          environment: this.configService.get('NODE_ENV'),
          appName: this.configService.get('APP_NAME'),
        });
      });

      // Set up error handler for the HTTP server if supported
      if (this.httpServer && typeof this.httpServer.on === 'function') {
        this.httpServer.on('error', (error: Error) => {
          this.logger.error('HTTP server error', {
            error: error.message,
            stack: error.stack,
          });
        });
      }
    } catch (error) {
      this.logger.error('Failed to initialize server', error);
      throw error;
    }
  }

  /**
   * Register a service for cleanup when the server shuts down
   *
   * @param handler - Object implementing the CleanupHandler interface
   * @throws Error if handler is not valid
   */
  registerForCleanup(handler: CleanupHandler): void {
    if (!handler || typeof handler.cleanup !== 'function') {
      const error = new Error('Invalid cleanup handler provided');
      this.logger.error('Failed to register cleanup handler', error);
      throw error;
    }

    this.cleanupHandlers.push(handler);
    this.logger.debug(`Registered cleanup handler: ${handler.constructor?.name || 'Unknown'}`);
  }

  /**
   * Runs all registered cleanup handlers in parallel
   *
   * @throws Error if any cleanup handler fails
   */
  async cleanup(): Promise<void> {
    this.logger.info(`Starting cleanup of ${this.cleanupHandlers.length} registered services`);

    try {
      // Close the HTTP server first to stop accepting new connections
      if (this.httpServer) {
        this.logger.debug('Closing HTTP server');
        await new Promise<void>((resolve, reject) => {
          this.httpServer!.close((err) => {
            if (err) {
              this.logger.error('Error closing HTTP server', err);
              reject(err);
            } else {
              this.logger.debug('HTTP server closed successfully');
              resolve();
            }
          });
        });
      }

      // Then clean up all registered handlers
      await Promise.all(
        this.cleanupHandlers.map(async (handler) => {
          try {
            await handler.cleanup();
          } catch (error) {
            const handlerName = handler.constructor?.name || 'Unknown';
            this.logger.error(`Cleanup handler failed: ${handlerName}`, error);
            throw error;
          }
        }),
      );
      this.logger.info('All cleanup handlers completed successfully');
    } catch (error) {
      this.logger.error('Server cleanup failed', error);
      throw error;
    }
  }

  /**
   * Performs graceful shutdown of the server
   *
   * @param signal - The signal that triggered the shutdown
   * @returns Promise that resolves when shutdown is complete
   * @throws Error if shutdown fails
   */
  async gracefulShutdown(signal: string): Promise<void> {
    this.logger.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await this.cleanup();
      this.logger.info('All services cleaned up successfully');
      return Promise.resolve();
    } catch (error) {
      this.logger.error('Error during graceful shutdown', error);
      throw error;
    }
  }
}
