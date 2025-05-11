import 'reflect-metadata';
import { Container } from 'typedi';
import { JwtService } from '@shared/services/jwt/jwt.service';
import { ConfigService } from '@shared/services/config/config.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { UnauthorizedError } from '@shared/utils/error/error.util';
import { createMockLogger } from '@tests/mocks/logger.service.mock';

// Mock dependencies
jest.mock('aws-jwt-verify');

describe('JwtService', () => {
  let jwtService: JwtService;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockVerifyFn: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock verify function
    mockVerifyFn = jest.fn();

    // Mock CognitoJwtVerifier
    (CognitoJwtVerifier.create as jest.Mock).mockReturnValue({
      verify: mockVerifyFn,
    });

    // Mock ConfigService
    mockConfigService = {
      get: jest.fn((key) => {
        if (key === 'COGNITO_USER_POOL_ID') return 'test-pool-id';
        if (key === 'COGNITO_CLIENT_ID') return 'test-client-id';
        return '';
      }),
    } as unknown as jest.Mocked<ConfigService>;

    // Mock LoggerService
    const mockLogger = createMockLogger();

    // Set up container
    Container.set(ConfigService, mockConfigService);
    Container.set(LoggerService, mockLogger);

    // Create JwtService instance
    jwtService = new JwtService(mockConfigService, Container.get(LoggerService));
  });

  describe('constructor', () => {
    it('should create a verifier with correct configuration', () => {
      expect(CognitoJwtVerifier.create).toHaveBeenCalledWith({
        userPoolId: 'test-pool-id',
        tokenUse: 'access',
        clientId: 'test-client-id',
      });
    });
  });

  describe('extractToken', () => {
    it('should extract token from a Bearer header', () => {
      const token = jwtService.extractToken('Bearer mytokenvalue');
      expect(token).toBe('mytokenvalue');
    });

    it('should return the header as-is when no Bearer prefix', () => {
      const token = jwtService.extractToken('mytokenvalue');
      expect(token).toBe('mytokenvalue');
    });

    it('should return empty string when header is empty', () => {
      const token = jwtService.extractToken('');
      expect(token).toBe('');
    });

    it('should return empty string when header is undefined', () => {
      const token = jwtService.extractToken(undefined as unknown as string);
      expect(token).toBe('');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const mockPayload = {
        sub: 'user-123',
        username: 'testuser',
        token_use: 'access',
        client_id: 'test-client-id',
        scope: 'email',
        version: 1,
        iss: 'test-issuer',
        exp: 1234567890,
        iat: 1234567890,
        auth_time: 1234567890,
        jti: 'test-jti',
        origin_jti: 'test-origin-jti',
      };
      mockVerifyFn.mockResolvedValue(mockPayload);

      const result = await jwtService.verifyToken('valid-token');
      expect(result).toEqual(mockPayload);
      expect(mockVerifyFn).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedError when token is empty', async () => {
      await expect(jwtService.verifyToken('')).rejects.toThrow(UnauthorizedError);
      expect(mockVerifyFn).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError when verification fails', async () => {
      mockVerifyFn.mockRejectedValue(new Error('Invalid token'));
      await expect(jwtService.verifyToken('invalid-token')).rejects.toThrow(UnauthorizedError);
      expect(mockVerifyFn).toHaveBeenCalledWith('invalid-token');
    });
  });
});
