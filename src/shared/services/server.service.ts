import { AppService } from '@shared/services/app.service';
import { ConfigService } from '@shared/services/config.service';
import { Injectable } from '@shared/utils/ioc.util';
import http from 'http';

/**
 * ServerService manages the server lifecycle, including startup and graceful shutdown.
 */
@Injectable()
export class ServerService {
  private server?: http.Server;
  private cleanupTasks: (() => Promise<void>)[] = [];

  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register an async cleanup function to be called before shutdown.
   */
  cleanup(fn: () => Promise<void>): void {
    this.cleanupTasks.push(fn);
  }

  /**
   * Start the HTTP server and handle graceful shutdown.
   */
  async start(): Promise<void> {
    const port = this.configService.get('PORT');
    const app = this.appService.getApp();
    this.server = app.listen(port, () => {
      console.log(`Server started on http://localhost:${port}`);
    });

    // Register config cleanup
    // this.cleanup(async () => {
    //   await this.exampleService.cleanup();
    // });

    // Handle process signals for graceful shutdown
    const shutdown = async () => {
      // eslint-disable-next-line no-console
      console.log('Shutting down server...');
      if (this.server) {
        await new Promise<void>((resolve, reject) => {
          this.server!.close((err) => (err ? reject(err) : resolve()));
        });
      }
      await Promise.all(this.cleanupTasks.map((fn) => fn()));
      // eslint-disable-next-line no-console
      console.log('Cleanup complete. Exiting.');
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}
