import { Injectable } from '@core/utils/di.util';
import { ConfigService } from '@core/services/config.service';
import { LoggerService } from '@core/services/logger.service';
import { Container } from 'typedi';
import { CleanupHandler } from '@core/types/app.types';
import { ServerService } from '@core/services/server.service';

@Injectable()
export class DbService implements CleanupHandler {
  private readonly logger: LoggerService;
  private isConnected = false;
  private isRegisteredForCleanup = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {
    this.logger = loggerService.setContext('DbService');
  }

  /**
   * Initialize the database connection
   * Implements InitializableService interface
   */
  public async initialize(): Promise<void> {
    return this.connect();
  }

  /**
   * Connects to the database
   */
  public async connect(): Promise<void> {
    // Register for cleanup if not already done
    this.registerForCleanupIfNeeded();

    const appName = this.configService.get('APP_NAME');
    this.logger.info(`Connecting to database for ${appName}`);

    // Simulate database connection
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.isConnected = true;
    this.logger.info('Database connected successfully');
  }

  /**
   * Cleans up database connections
   * Implements the CleanupHandler interface
   */
  public async cleanup(): Promise<void> {
    if (this.isConnected) {
      this.logger.info('Closing database connection');

      // Simulate closing database connection
      await new Promise((resolve) => setTimeout(resolve, 100));

      this.isConnected = false;
      this.logger.info('Database connection closed successfully');
    } else {
      this.logger.info('No active database connection to close');
    }
  }

  /**
   * Register this service for cleanup
   * This breaks the circular dependency between ServerService and DbService
   */
  private registerForCleanupIfNeeded(): void {
    if (!this.isRegisteredForCleanup) {
      try {
        // Dynamically get ServerService to avoid circular dependency
        const serverService = Container.get(ServerService);
        serverService.registerForCleanup(this);
        this.isRegisteredForCleanup = true;
        this.logger.debug('Registered for cleanup with ServerService');
      } catch (error) {
        this.logger.warn('Could not register for cleanup with ServerService', error);
      }
    }
  }
}
