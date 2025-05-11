import 'reflect-metadata';
import { Container } from 'typedi';
import { AuthVerificationService, AuthUser } from '@shared/services/auth/auth-verification.service';
import { JwtService, JwtPayload } from '@shared/services/jwt/jwt.service';
import { UserService } from '@domains/user/user.service';
import { UserRepository } from '@domains/user/user.repository';
import { RoleService } from '@domains/role/role.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import { Request } from 'express';
import { Action } from 'routing-controllers';

describe('AuthVerificationService', () => {
  let authService: AuthVerificationService;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockUserService: jest.Mocked<UserService>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRoleService: jest.Mocked<RoleService>;
  let mockLogger: jest.Mocked<LoggerService>;

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    cognito_sub: 'cognito-123',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    password: null,
    deletedAt: null,
  };

  const mockRoles = [
    { id: 1, name: 'admin', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'user', createdAt: new Date(), updatedAt: new Date() },
  ];

  const mockPermissions = [
    { id: 1, name: 'read:users', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: 'write:users', createdAt: new Date(), updatedAt: new Date() },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock JWT service
    mockJwtService = {
      extractToken: jest.fn(),
      verifyToken: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    // Mock User service
    mockUserService = {
      findByCognitoSub: jest.fn(),
      getRolesForUser: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    // Mock UserRepository
    mockUserRepository = {} as unknown as jest.Mocked<UserRepository>;

    // Mock RoleService
    mockRoleService = {
      getPermissionsForRole: jest.fn(),
    } as unknown as jest.Mocked<RoleService>;

    // Mock Logger
    mockLogger = createMockLogger();

    // Set up container
    Container.set(JwtService, mockJwtService);
    Container.set(UserService, mockUserService);
    Container.set(UserRepository, mockUserRepository);
    Container.set(RoleService, mockRoleService);
    Container.set(LoggerService, mockLogger);

    // Create service instance
    authService = new AuthVerificationService(
      mockJwtService,
      mockUserService,
      mockRoleService,
      mockLogger,
    );
  });

  describe('getTokenFromRequest', () => {
    it('should extract and verify token from request', async () => {
      const mockToken = 'valid-token';
      const mockPayload: JwtPayload = {
        sub: 'cognito-123',
        username: 'testuser',
        token_use: 'access',
        scope: 'email',
        version: 1,
        client_id: 'test-client',
        iss: 'https://cognito-idp.region.amazonaws.com/userpool',
        exp: 1234567890,
        iat: 1234567890,
        auth_time: 1234567890,
        jti: 'test-jti',
        origin_jti: 'test-origin-jti',
      };

      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      } as unknown as Request;

      mockJwtService.extractToken.mockReturnValue(mockToken);
      mockJwtService.verifyToken.mockResolvedValue(mockPayload);

      const result = await authService.getTokenFromRequest(mockRequest);

      expect(mockJwtService.extractToken).toHaveBeenCalledWith('Bearer valid-token');
      expect(mockJwtService.verifyToken).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual(mockPayload);
    });

    it('should return null when no authorization header', async () => {
      const mockRequest = {
        headers: {},
      } as unknown as Request;

      const result = await authService.getTokenFromRequest(mockRequest);

      expect(mockJwtService.extractToken).not.toHaveBeenCalled();
      expect(mockJwtService.verifyToken).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when token extraction fails', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer ',
        },
      } as unknown as Request;

      mockJwtService.extractToken.mockReturnValue('');

      const result = await authService.getTokenFromRequest(mockRequest);

      expect(mockJwtService.extractToken).toHaveBeenCalledWith('Bearer ');
      expect(mockJwtService.verifyToken).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when token verification fails', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      } as unknown as Request;

      mockJwtService.extractToken.mockReturnValue('invalid-token');
      mockJwtService.verifyToken.mockRejectedValue(new Error('Invalid token'));

      const result = await authService.getTokenFromRequest(mockRequest);

      expect(mockJwtService.extractToken).toHaveBeenCalledWith('Bearer invalid-token');
      expect(mockJwtService.verifyToken).toHaveBeenCalledWith('invalid-token');
      expect(result).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user with roles and permissions', async () => {
      const mockPayload: JwtPayload = {
        sub: 'cognito-123',
        username: 'testuser',
        token_use: 'access',
        scope: 'email',
        version: 1,
        client_id: 'test-client',
        iss: 'https://cognito-idp.region.amazonaws.com/userpool',
        exp: 1234567890,
        iat: 1234567890,
        auth_time: 1234567890,
        jti: 'test-jti',
        origin_jti: 'test-origin-jti',
      };

      const mockAction = {
        request: {
          headers: {
            authorization: 'Bearer valid-token',
          },
        },
      } as unknown as Action;

      // Setup mocks
      jest.spyOn(authService, 'getTokenFromRequest').mockResolvedValue(mockPayload);
      mockUserService.findByCognitoSub.mockResolvedValue(mockUser);
      mockUserService.getRolesForUser.mockResolvedValue(mockRoles);
      mockRoleService.getPermissionsForRole.mockResolvedValue(mockPermissions);

      const result = await authService.getCurrentUser(mockAction);

      expect(authService.getTokenFromRequest).toHaveBeenCalledWith(mockAction.request);
      expect(mockUserService.findByCognitoSub).toHaveBeenCalledWith(mockPayload.sub);
      expect(mockUserService.getRolesForUser).toHaveBeenCalledWith(mockUser.id);
      expect(mockRoleService.getPermissionsForRole).toHaveBeenCalledTimes(2);

      expect(result).toEqual({
        id: mockUser.id,
        sub: mockPayload.sub,
        username: mockPayload.username,
        email: mockPayload.email,
        roles: mockRoles.map((r) => r.name),
        permissions: mockPermissions.map((p) => p.name),
      });
    });

    it('should return cached user if available in request', async () => {
      const cachedUser: AuthUser = {
        id: 'user-123',
        sub: 'cognito-123',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['admin', 'user'],
        permissions: ['read:users', 'write:users'],
      };

      const mockAction = {
        request: {
          headers: {
            authorization: 'Bearer valid-token',
          },
          currentAuthUser: cachedUser,
        },
      } as unknown as Action;

      // Properly mock getTokenFromRequest as a spy
      const getTokenSpy = jest
        .spyOn(authService, 'getTokenFromRequest')
        .mockImplementation(() => Promise.resolve(null));

      const result = await authService.getCurrentUser(mockAction);

      // Should not call any services - it should use the cached user
      expect(getTokenSpy).not.toHaveBeenCalled();
      expect(mockUserService.findByCognitoSub).not.toHaveBeenCalled();
      expect(mockUserService.getRolesForUser).not.toHaveBeenCalled();
      expect(mockRoleService.getPermissionsForRole).not.toHaveBeenCalled();

      expect(result).toEqual(cachedUser);
    });

    it('should return null when token verification fails', async () => {
      const mockAction = {
        request: {
          headers: {
            authorization: 'Bearer invalid-token',
          },
        },
      } as unknown as Action;

      jest.spyOn(authService, 'getTokenFromRequest').mockResolvedValue(null);

      const result = await authService.getCurrentUser(mockAction);

      expect(authService.getTokenFromRequest).toHaveBeenCalledWith(mockAction.request);
      expect(mockUserService.findByCognitoSub).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when user not found in database', async () => {
      const mockPayload: JwtPayload = {
        sub: 'unknown-sub',
        username: 'testuser',
        token_use: 'access',
        scope: 'email',
        version: 1,
        client_id: 'test-client',
        iss: 'https://cognito-idp.region.amazonaws.com/userpool',
        exp: 1234567890,
        iat: 1234567890,
        auth_time: 1234567890,
        jti: 'test-jti',
        origin_jti: 'test-origin-jti',
      };

      const mockAction = {
        request: {
          headers: {
            authorization: 'Bearer valid-token',
          },
        },
      } as unknown as Action;

      jest.spyOn(authService, 'getTokenFromRequest').mockResolvedValue(mockPayload);
      mockUserService.findByCognitoSub.mockImplementation(() =>
        Promise.resolve(null as unknown as ReturnType<typeof mockUserService.findByCognitoSub>),
      );

      const result = await authService.getCurrentUser(mockAction);

      expect(authService.getTokenFromRequest).toHaveBeenCalledWith(mockAction.request);
      expect(mockUserService.findByCognitoSub).toHaveBeenCalledWith(mockPayload.sub);
      expect(result).toBeNull();
    });
  });

  describe('checkAuthorization', () => {
    let mockUser: AuthUser;

    beforeEach(() => {
      mockUser = {
        id: 'user-123',
        sub: 'cognito-123',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['admin', 'user'],
        permissions: ['read:users', 'write:users'],
      };
    });

    it('should return true when user has required role', async () => {
      const mockAction = {} as Action;
      const requiredRoles = ['admin'];

      jest.spyOn(authService, 'getCurrentUser').mockResolvedValue(mockUser);

      const result = await authService.checkAuthorization(mockAction, requiredRoles);

      expect(authService.getCurrentUser).toHaveBeenCalledWith(mockAction);
      expect(result).toBe(true);
    });

    it('should return true when no roles required (any authenticated user)', async () => {
      const mockAction = {} as Action;
      const requiredRoles: string[] = [];

      jest.spyOn(authService, 'getCurrentUser').mockResolvedValue(mockUser);

      const result = await authService.checkAuthorization(mockAction, requiredRoles);

      expect(authService.getCurrentUser).toHaveBeenCalledWith(mockAction);
      expect(result).toBe(true);
    });

    it('should return false when user does not have required role', async () => {
      const mockAction = {} as Action;
      const requiredRoles = ['super-admin'];

      jest.spyOn(authService, 'getCurrentUser').mockResolvedValue(mockUser);

      const result = await authService.checkAuthorization(mockAction, requiredRoles);

      expect(authService.getCurrentUser).toHaveBeenCalledWith(mockAction);
      expect(result).toBe(false);
    });

    it('should return false when user authentication fails', async () => {
      const mockAction = {} as Action;
      const requiredRoles = ['admin'];

      jest.spyOn(authService, 'getCurrentUser').mockResolvedValue(null);

      const result = await authService.checkAuthorization(mockAction, requiredRoles);

      expect(authService.getCurrentUser).toHaveBeenCalledWith(mockAction);
      expect(result).toBe(false);
    });
  });

  describe('permission checking', () => {
    const mockUser: AuthUser = {
      id: 'user-123',
      sub: 'cognito-123',
      username: 'testuser',
      email: 'test@example.com',
      roles: ['admin', 'user'],
      permissions: ['read:users', 'write:users', 'delete:users'],
    };

    describe('hasPermission', () => {
      it('should return true when user has the permission', () => {
        expect(authService.hasPermission(mockUser, 'read:users')).toBe(true);
      });

      it('should return false when user does not have the permission', () => {
        expect(authService.hasPermission(mockUser, 'admin:system')).toBe(false);
      });
    });

    describe('hasAllPermissions', () => {
      it('should return true when user has all required permissions', () => {
        expect(authService.hasAllPermissions(mockUser, ['read:users', 'write:users'])).toBe(true);
      });

      it('should return false when user does not have all required permissions', () => {
        expect(authService.hasAllPermissions(mockUser, ['read:users', 'admin:system'])).toBe(false);
      });

      it('should return true for an empty permissions array', () => {
        expect(authService.hasAllPermissions(mockUser, [])).toBe(true);
      });
    });

    describe('hasAnyPermission', () => {
      it('should return true when user has at least one required permission', () => {
        expect(authService.hasAnyPermission(mockUser, ['read:users', 'admin:system'])).toBe(true);
      });

      it('should return false when user has none of the required permissions', () => {
        expect(authService.hasAnyPermission(mockUser, ['admin:system', 'manage:settings'])).toBe(
          false,
        );
      });

      it('should return false for an empty permissions array', () => {
        expect(authService.hasAnyPermission(mockUser, [])).toBe(false);
      });
    });
  });
});
