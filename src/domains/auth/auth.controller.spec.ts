import 'reflect-metadata';
import { Container } from 'typedi';
import { AuthController } from '@domains/auth/auth.controller';
import { AuthService } from '@domains/auth/auth.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import { UserService } from '@domains/user/user.service';
import { AuthUser } from '@shared/services/auth/auth-verification.service';
import { UnauthorizedError } from '@shared/utils/error/error.util';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockUserService: jest.Mocked<UserService>;
  let mockLogger: LoggerService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mocks
    mockAuthService = {} as unknown as jest.Mocked<AuthService>;

    mockUserService = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    mockLogger = createMockLogger();

    // Register mocks in container
    Container.set(AuthService, mockAuthService);
    Container.set(LoggerService, mockLogger);
    Container.set(UserService, mockUserService);

    // Create controller instance
    controller = new AuthController(mockAuthService, mockLogger, mockUserService);
  });

  describe('getMe', () => {
    it('should return user details for authenticated user', async () => {
      // Prepare test data
      const mockAuthUser: AuthUser = {
        id: 'user-123',
        sub: 'cognito-123',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user'],
        permissions: ['read:profile'],
      };

      const mockUserData = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        cognito_sub: 'cognito-123',
        password: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      // Setup mock
      mockUserService.findById.mockResolvedValue(mockUserData);

      // Execute the method
      const result = await controller.getMe(mockAuthUser);

      // Assert the result
      expect(mockUserService.findById).toHaveBeenCalledWith(mockAuthUser.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(mockUserData.id);
      expect(result.username).toBe(mockUserData.username);
      expect(result.email).toBe(mockUserData.email);
    });

    it('should throw UnauthorizedError when no user is provided', async () => {
      await expect(controller.getMe(undefined as unknown as AuthUser)).rejects.toThrow(
        UnauthorizedError,
      );
      expect(mockUserService.findById).not.toHaveBeenCalled();
    });
  });
});
