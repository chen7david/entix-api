import rateLimit from 'express-rate-limit';
import type { Express } from 'express';
import { RateLimitError } from '@shared/utils/error/error.util';
import type { LoggerService } from '@shared/services/logger/logger.service';

/**
 * Options for the rate limiting middleware.
 */
export type RateLimitOptions = {
  /**
   * Maximum number of requests allowed per window per IP.
   * @default 100
   */
  max?: number;

  /**
   * Time window in milliseconds.
   * @default 900000 (15 minutes)
   */
  windowMs?: number;

  /**
   * Optional logger for recording rate limit events.
   */
  logger?: LoggerService;
};

/**
 * Registers rate limiting middleware on the provided Express app instance.
 * Uses the RateLimitError class for consistent error handling.
 *
 * @example
 * ```ts
 * // Basic usage with defaults (100 requests per 15 minutes)
 * useRateLimiting(app);
 *
 * // Custom window and limit
 * useRateLimiting(app, { max: 50, windowMs: 60000 });  // 50 requests per minute
 *
 * // With logging
 * useRateLimiting(app, { max: 100, windowMs: 900000, logger });
 * ```
 *
 * @param app - The Express app instance
 * @param options - Rate limiting options
 * @returns void
 */
export function useRateLimiting(app: Express, options: RateLimitOptions = {}): void {
  const { windowMs = 900000, max = 100, logger } = options;

  app.use(
    rateLimit({
      windowMs,
      limit: max,
      standardHeaders: 'draft-8', // Use RFC 8050 standard headers
      legacyHeaders: false, // Disable legacy X-RateLimit headers
      handler: (req, res) => {
        const error = new RateLimitError({
          message: 'Too many requests, please try again later.',
        });

        // Log rate limit events if logger is provided
        if (logger) {
          logger.log({
            level: 'warn',
            msg: 'Rate limit exceeded',
            meta: {
              ip: req.ip,
              path: req.originalUrl,
              method: req.method,
              error: error.toResponse(),
            },
          });
        }

        // Return consistent JSON error response
        res.status(error.status).json(error.toResponse());
      },
    }),
  );
}
