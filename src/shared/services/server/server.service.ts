import { AppService } from '@shared/services/app/app.service';
import { ConfigService } from '@shared/services/config/config.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { Injectable } from '@shared/utils/ioc.util';
import http from 'http';
import type pino from 'pino';

/**
 * ServerService manages the server lifecycle, including startup and graceful shutdown.
 * All logging is performed via the injected LoggerService.
 */
@Injectable()
export class ServerService {
  private server?: http.Server;
  private cleanupTasks: ((logger: pino.Logger) => Promise<void>)[] = [];

  // eslint-disable-next-line max-params
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {}

  /**
   * Register an async cleanup function to be called before shutdown.
   * The function receives the logger instance for structured logging during cleanup.
   * @param fn Cleanup function accepting a logger
   */
  cleanup(fn: (logger: pino.Logger) => Promise<void>): void {
    this.cleanupTasks.push(fn);
  }

  /**
   * Start the HTTP server and handle graceful shutdown.
   */
  async start(): Promise<void> {
    const port = this.configService.get('PORT');
    const app = this.appService.getApp();
    const logger = this.loggerService.child({
      service: 'ServerService',
    });
    this.server = app.listen(port, () => {
      logger.info(`Server started on http://localhost:${port}`);
    });

    // Register config cleanup
    // this.cleanup(async (logger) => {
    //   await this.exampleService.cleanup();
    //   logger.info('ExampleService cleaned up');
    // });

    // Handle process signals for graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');
      if (this.server) {
        await new Promise<void>((resolve, reject) => {
          this.server!.close((err) => (err ? reject(err) : resolve()));
        });
      }
      await Promise.all(this.cleanupTasks.map((fn) => fn(logger)));
      logger.info('Cleanup complete. Exiting.');
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}
