import { AppService } from '@shared/services/app/app.service';
import { ConfigService } from '@shared/services/config/config.service';
import { Logger } from '@shared/types/logger.type';
import { LoggerService } from '@shared/services/logger/logger.service';
import { DatabaseService } from '@shared/services/database/database.service';
import { Injectable } from '@shared/utils/ioc.util';
import http from 'http';

/**
 * ServerService manages the server lifecycle, including startup and graceful shutdown.
 * All logging is performed via the injected LoggerService.
 */
@Injectable()
export class ServerService {
  private server?: http.Server;
  private cleanupTasks: ((logger: Logger) => Promise<void>)[] = [];
  private readonly logger: Logger;

  // eslint-disable-next-line max-params
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
    private readonly databaseService: DatabaseService,
  ) {
    this.logger = this.loggerService.component('ServerService');
  }

  /**
   * Register an async cleanup function to be called before shutdown.
   * The function receives the logger instance for structured logging during cleanup.
   * @param fn Cleanup function accepting a logger
   */
  cleanup(fn: (logger: Logger) => Promise<void>): void {
    this.cleanupTasks.push(fn);
  }

  /**
   * Start the HTTP server and handle graceful shutdown.
   */
  async start(): Promise<void> {
    const port = this.configService.get('PORT');
    const nodeEnv = this.configService.get('NODE_ENV');
    const app = this.appService.getApp();

    this.server = app.listen(port, () => {
      this.logger.info('Server started', {
        url: `http://localhost:${port}`,
        environment: nodeEnv,
      });
    });

    // Register database cleanup
    this.cleanup(async () => {
      await this.databaseService.cleanup();
      this.logger.info('DatabaseService cleaned up');
    });

    // Handle process signals for graceful shutdown
    const shutdown = async () => {
      this.logger.info('Shutting down server...');
      if (this.server) {
        await new Promise<void>((resolve, reject) => {
          this.server!.close((err) => (err ? reject(err) : resolve()));
        });
      }
      await Promise.all(this.cleanupTasks.map((fn) => fn(this.logger)));
      this.logger.info('Cleanup complete. Exiting.');
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}
