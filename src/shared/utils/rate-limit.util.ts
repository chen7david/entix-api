/**
 * Utility for creating an express-rate-limit middleware instance.
 *
 * @see https://express-rate-limit.mintlify.app/quickstart/usage
 *
 * @param windowMs - Time window in milliseconds
 * @param max - Maximum number of requests per window per client
 * @returns Configured express-rate-limit middleware
 */
import rateLimit from 'express-rate-limit';
import type { RateLimitRequestHandler } from 'express-rate-limit';

export function createRateLimitMiddleware({
  windowMs,
  max,
}: {
  windowMs: number;
  max: number;
}): RateLimitRequestHandler {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  });
}
