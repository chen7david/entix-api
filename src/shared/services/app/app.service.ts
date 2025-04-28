import { ErrorHandlerMiddleware } from '@shared/middleware/app-error.middleware';
import { NotFoundMiddleware } from '@shared/middleware/not-found.middleware';
import { useRateLimiting } from '@shared/middleware/rate-limit.middleware';
import { ConfigService } from '@shared/services/config/config.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { useContainer, useExpressServer } from 'routing-controllers';
import { Injectable } from '@shared/utils/ioc.util';
import express, { Express } from 'express';
import { Container } from 'typedi';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
/**
 * AppService configures the Express app with routing-controllers and DI.
 */
@Injectable()
export class AppService {
  private app: Express;

  /**
   * Constructs and configures the Express app instance.
   *
   * @remarks
   * Adds security middleware (Helmet, CORS), rate limiting, and routing-controllers setup.
   *
   * @param _deps Dependency injection object (future-proof for logger, etc.)
   * @param configService The ConfigService instance for environment configuration
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    useContainer(Container);
    this.app = express();
    /**
     * Trust the first proxy (e.g., Cloudflare) to ensure correct client IP detection.
     * This is required for express-rate-limit and other IP-based middleware to work as expected behind a proxy.
     * @see https://expressjs.com/en/guide/behind-proxies.html
     * @see https://express-rate-limit.mintlify.app/quickstart/usage
     */
    this.app.set('trust proxy', 1);
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Rate limiting middleware
    useRateLimiting(this.app, {
      max: this.configService.get('RATE_LIMIT_MAX'),
      windowMs: this.configService.get('RATE_LIMIT_WINDOW_MS'),
      logger: this.logger,
    });

    // Configure routing-controllers with all controllers and middlewares
    useExpressServer(this.app, {
      controllers: [path.join(__dirname, '../../../domains/**/*.controller.{ts,js}')],
      validation: false, // Disable class-validator
      classTransformer: false, // Disable class-transformer
      middlewares: [ErrorHandlerMiddleware, NotFoundMiddleware],
      defaultErrorHandler: false,
    });
  }

  /**
   * Get the configured Express app instance.
   */
  getApp(): Express {
    return this.app;
  }
}
