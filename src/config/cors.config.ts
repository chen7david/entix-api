import { HTTPMethod, HTTPHeaders, CorsOrigin } from '@src/app/app.constant';

/**
 * The methods that are allowed to be used in the CORS configuration
 */
const corsMethods: HTTPMethod[] = [
  HTTPMethod.GET,
  HTTPMethod.POST,
  HTTPMethod.PUT,
  HTTPMethod.DELETE,
  HTTPMethod.PATCH,
  HTTPMethod.OPTIONS,
];

/**
 * The allowed origins that are allowed to be used in the CORS configuration
 */
const allowedOrigins: CorsOrigin[] = [CorsOrigin.ALL];

/**
 * The allowed headers that are allowed to be used in the CORS configuration
 */
const corsAllowedHeaders: HTTPHeaders[] = [HTTPHeaders.CONTENT_TYPE, HTTPHeaders.AUTHORIZATION];

/**
 * The CORS configuration
 */
export const corsConfig = {
  origin: allowedOrigins,
  methods: corsMethods,
  allowedHeaders: corsAllowedHeaders,
};
