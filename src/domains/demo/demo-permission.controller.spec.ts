import 'reflect-metadata';
import { Container } from 'typedi';
import { DemoPermissionController } from '@domains/demo/demo-permission.controller';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import { LoggerService } from '@shared/services/logger/logger.service';
import { AuthUser } from '@shared/services/auth/auth-verification.service';

describe('DemoPermissionController', () => {
  let controller: DemoPermissionController;
  let mockUserWithReadPermission: AuthUser;
  let mockUserWithAdminPermission: AuthUser;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock logger
    Container.set(LoggerService, createMockLogger());

    // Create controller
    controller = new DemoPermissionController(Container.get(LoggerService));

    // Setup mock users
    mockUserWithReadPermission = {
      id: 'user-123',
      sub: 'cognito-123',
      username: 'reader',
      email: 'reader@example.com',
      roles: ['user'],
      permissions: ['users:read', 'resources:read'],
    };

    mockUserWithAdminPermission = {
      id: 'user-456',
      sub: 'cognito-456',
      username: 'power-user',
      email: 'power@example.com',
      roles: ['user'],
      permissions: ['users:read', 'resources:admin', 'admin:resource:read'],
    };
  });

  describe('getPublic', () => {
    it('should return a public message', () => {
      const result = controller.getPublic();
      expect(result.message).toBe('This is a public endpoint');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('getUsersWithPermission', () => {
    it('should return message for user with read permission', () => {
      const result = controller.getUsersWithPermission(mockUserWithReadPermission);
      expect(result.message).toBe('You have permission to read users!');
      expect(result.permissions).toContain('users:read');
    });
  });

  describe('getAdminResource', () => {
    it('should return data for user with admin resource permission', () => {
      const result = controller.getAdminResource(mockUserWithAdminPermission);
      expect(result.message).toBe('You accessed an admin resource!');
      expect(result.user.permissions).toContain('admin:resource:read');
    });
  });

  describe('getResource', () => {
    it('should return read-only access for user with read permission', () => {
      const result = controller.getResource('test-resource', mockUserWithReadPermission);
      expect(result.message).toBe('Access granted to resource test-resource');
      expect(result.accessType).toBe('read-only');
    });

    it('should return admin access for user with admin permission', () => {
      const result = controller.getResource('test-resource', mockUserWithAdminPermission);
      expect(result.message).toBe('Access granted to resource test-resource');
      expect(result.accessType).toBe('admin');
    });
  });
});
