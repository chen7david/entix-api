import { CorsOptions } from 'cors';
import { logger } from '@/services/logger.service';
import { Environment, HTTPHeaders, HTTPMethod } from '@src/types/app.types';
import { env } from './env.config';

/**
 * CORS configuration following security best practices
 *
 * This configuration:
 * - Restricts allowed origins in production
 * - Allows specific HTTP methods
 * - Sets appropriate headers
 * - Handles credentials properly
 * - Configures preflight requests
 */
export const corsOptions: CorsOptions = {
  // In production, restrict origins to specific domains
  // In development/test, allow all origins for easier testing
  origin:
    env.NODE_ENV === Environment.Production
      ? [
          // Add your production frontend domains here
          'https://your-frontend-domain.com',
          // You can add multiple domains if needed
          // 'https://another-allowed-domain.com',
        ]
      : '*',

  // Allow only necessary HTTP methods
  methods: [
    HTTPMethod.Get,
    HTTPMethod.Post,
    HTTPMethod.Delete,
    HTTPMethod.Patch,
    HTTPMethod.Options,
  ],

  // Allow specific headers
  allowedHeaders: [
    HTTPHeaders.ContentType,
    HTTPHeaders.Authorization,
    HTTPHeaders.Accept,
    HTTPHeaders.XRequestedWith,
  ],

  // Allow browsers to send these headers with CORS requests
  exposedHeaders: ['Content-Disposition', 'X-Total-Count'],

  // Configure preflight requests cache duration (in seconds)
  maxAge: 86400, // 24 hours

  // Whether to allow credentials (cookies, authorization headers, etc.)
  // Set to true only if your API needs to support credentials
  credentials: false,

  // Pass the CORS preflight response to the next handler
  preflightContinue: false,

  // Return 204 for preflight requests
  optionsSuccessStatus: 204,
};

// Log CORS configuration on startup
logger.info('CORS configuration initialized', {
  environment: env.NODE_ENV,
  origin: corsOptions.origin,
  methods: corsOptions.methods,
  credentials: corsOptions.credentials,
});
