import { corsConfig } from '@src/config/cors.config';
import cors from 'cors';

/**
 * CORS Middleware
 *
 * This middleware is intentionally implemented as a traditional Express middleware
 * rather than using routing-controllers. This approach ensures that CORS headers are
 * applied to all requests, including those that are handled before routing-controllers
 * processes them.
 *
 * Important:
 * - routing-controllers middlewares only apply to routes managed by the framework
 * - For middlewares that need to run early in the request lifecycle (like CORS),
 *   it's recommended to use traditional Express middleware for broader coverage
 * - This middleware should be loaded before routing-controllers is initialized
 *
 * This middleware will apply the CORS configuration defined in corsConfig
 * to allow cross-origin requests according to the configured rules.
 */
export const corsMiddleware = cors(corsConfig);
