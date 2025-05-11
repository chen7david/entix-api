import 'reflect-metadata';
import { Container } from 'typedi';
import { DemoController } from '@domains/demo/demo.controller';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import { LoggerService } from '@shared/services/logger/logger.service';
import { AuthUser } from '@shared/services/auth/auth-verification.service';
import { createMockAuthUser, createMockAdminUser } from '@tests/mocks/auth-user.mock';
import { ForbiddenError } from '@shared/utils/error/error.util';

describe('DemoController', () => {
  let controller: DemoController;
  let mockUser: AuthUser;
  let mockAdminUser: AuthUser;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock logger
    Container.set(LoggerService, createMockLogger());

    // Create controller
    controller = new DemoController(Container.get(LoggerService));

    // Setup mock users
    mockUser = createMockAuthUser();
    mockAdminUser = createMockAdminUser();
  });

  describe('getPublic', () => {
    it('should return a public message', () => {
      const result = controller.getPublic();
      expect(result.message).toBe('This is a public endpoint');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('getAuthenticated', () => {
    it('should return user info for authenticated user', () => {
      const result = controller.getAuthenticated(mockUser);
      expect(result.message).toBe('You are authenticated!');
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.username).toBe(mockUser.username);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('getAdminOnly', () => {
    it('should return roles for admin user', () => {
      const result = controller.getAdminOnly(mockAdminUser);
      expect(result.message).toBe('You have admin permission!');
      expect(result.roles).toContain('admin');
      expect(result.timestamp).toBeDefined();
    });

    // Note: The @Authorized decorator is tested at the framework level
    // This test only verifies the controller method's behavior
  });

  describe('getUsers', () => {
    it('should return permissions for user with users:read permission', () => {
      // Add the required permission
      const userWithPermission = {
        ...mockUser,
        permissions: [...mockUser.permissions, 'users:read'],
      };

      const result = controller.getUsers(userWithPermission);
      expect(result.message).toBe('You have permission to read users!');
      expect(result.permissions).toContain('users:read');
      expect(result.timestamp).toBeDefined();
    });

    // Note: The @RequirePermissions decorator is tested at the framework level
  });

  describe('getResource', () => {
    it('should return resource details when user has permission', () => {
      // Add the required permission
      const userWithPermission = {
        ...mockUser,
        permissions: [...mockUser.permissions, 'read:resources'],
      };

      const result = controller.getResource('123', userWithPermission);
      expect(result.message).toBe('Accessed resource 123');
      expect(result.timestamp).toBeDefined();
    });

    it('should throw ForbiddenError when user tries to access admin resource without admin role', () => {
      // Add the required permission but not admin permission
      const userWithPermission = {
        ...mockUser,
        permissions: [...mockUser.permissions, 'read:resources'],
      };

      expect(() => controller.getResource('admin', userWithPermission)).toThrow(ForbiddenError);
    });

    it('should throw ForbiddenError when user lacks read:resources permission', () => {
      // User without the required permission
      expect(() => controller.getResource('123', mockUser)).toThrow(ForbiddenError);
    });
  });
});
