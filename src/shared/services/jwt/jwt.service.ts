import { Injectable } from '@shared/utils/ioc.util';
import { ConfigService } from '@shared/services/config/config.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { Logger } from '@shared/types/logger.type';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { UnauthorizedError } from '@shared/utils/error/error.util';

// Import the correct type from the module's type definition
type CognitoAccessTokenPayload = {
  token_use: 'access';
  client_id: string;
  version: number;
  username: string;
  scope: string;
  sub: string;
  iss: string;
  exp: number;
  iat: number;
  auth_time: number;
  jti: string;
  origin_jti: string;
  'cognito:groups'?: string[];
};

/**
 * Extended JWT token payload from Cognito with additional application-specific fields
 */
export type JwtPayload = CognitoAccessTokenPayload & {
  email?: string;
  // Add any additional Cognito payload fields needed for your application
};

/**
 * Service for verifying JWTs from AWS Cognito
 */
@Injectable()
export class JwtService {
  private verifier: ReturnType<typeof CognitoJwtVerifier.create>;
  private readonly logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {
    this.logger = this.loggerService.component('JwtService');

    this.verifier = CognitoJwtVerifier.create({
      userPoolId: this.configService.get('COGNITO_USER_POOL_ID'),
      tokenUse: 'access',
      clientId: this.configService.get('COGNITO_CLIENT_ID'),
    });
  }

  /**
   * Extracts token from Authorization header
   * @param authHeader - Authorization header value
   * @returns The extracted token or empty string
   */
  extractToken(authHeader: string): string {
    if (!authHeader) return '';
    if (authHeader.startsWith('Bearer ')) return authHeader.slice(7);
    return authHeader;
  }

  /**
   * Verifies a JWT token and returns the decoded payload
   * @param token - JWT token to verify
   * @returns Decoded JWT payload
   * @throws UnauthorizedError if token is invalid
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      if (!token) {
        throw new UnauthorizedError('No token provided');
      }

      // The verify method returns a payload that matches our JwtPayload structure
      const payload = await this.verifier.verify(token);
      return payload as JwtPayload;
    } catch (error) {
      this.logger.warn('JWT verification failed', { error });
      throw new UnauthorizedError('Invalid token');
    }
  }
}
