import { AdminController } from '@domains/admin/admin.controller';
import { AdminService } from '@domains/admin/admin.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { GroupType, UserType } from '@shared/types/cognito-admin.type';

describe('AdminController', () => {
  let controller: AdminController;
  let mockAdminService: jest.Mocked<AdminService>;
  let mockLoggerService: jest.Mocked<LoggerService>;

  // Sample test data
  const mockUser: UserType = {
    username: 'testUser',
    userStatus: 'CONFIRMED',
    enabled: true,
    userCreateDate: new Date('2023-01-01'),
    userLastModifiedDate: new Date('2023-01-02'),
    attributes: {
      email: 'test@example.com',
      'custom:role': 'user',
      sub: '123456',
      email_verified: 'true',
    },
  };

  const mockGroup: GroupType = {
    groupName: 'testGroup',
    description: 'Test group description',
    precedence: 1,
    creationDate: new Date('2023-01-01'),
    lastModifiedDate: new Date('2023-01-02'),
  };

  beforeEach(() => {
    // Create mock services
    mockAdminService = {
      listUsers: jest.fn(),
      createUser: jest.fn(),
      getUser: jest.fn(),
      updateUserAttributes: jest.fn(),
      deleteUser: jest.fn(),
      disableUser: jest.fn(),
      enableUser: jest.fn(),
      resetUserPassword: jest.fn(),
      setUserPassword: jest.fn(),
      confirmUserSignUp: jest.fn(),
      addUserToGroup: jest.fn(),
      removeUserFromGroup: jest.fn(),
      listGroupsForUser: jest.fn(),
      listUsersInGroup: jest.fn(),
      createGroup: jest.fn(),
      updateGroup: jest.fn(),
      deleteGroup: jest.fn(),
      listGroups: jest.fn(),
      adminLogin: jest.fn(),
    } as unknown as jest.Mocked<AdminService>;

    mockLoggerService = {
      component: jest.fn().mockReturnThis(),
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<LoggerService>;

    // Create controller instance with mock services
    controller = new AdminController(mockAdminService, mockLoggerService);
  });

  describe('listGroupsForUser', () => {
    it('should call adminService.listGroupsForUser and normalize response', async () => {
      // Arrange
      const username = 'testUser';
      const query = { limit: 10, nextToken: 'token123' };
      const serviceResult = {
        groups: [mockGroup],
        nextToken: 'nextToken123',
      };
      mockAdminService.listGroupsForUser.mockResolvedValueOnce(serviceResult);

      // Act
      const result = await controller.listGroupsForUser(username, query);

      // Assert
      expect(mockAdminService.listGroupsForUser).toHaveBeenCalledWith({
        username,
        limit: query.limit,
        nextToken: query.nextToken,
      });
      expect(result).toEqual({
        groups: [
          {
            name: mockGroup.groupName,
            description: mockGroup.description,
            precedence: mockGroup.precedence,
            createdAt: mockGroup.creationDate?.toISOString(),
            updatedAt: mockGroup.lastModifiedDate?.toISOString(),
          },
        ],
        nextToken: serviceResult.nextToken,
      });
    });

    it('should handle errors from service', async () => {
      // Arrange
      const username = 'testUser';
      const query = { limit: 10, nextToken: 'token123' };
      const error = new Error('Service error');
      mockAdminService.listGroupsForUser.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(controller.listGroupsForUser(username, query)).rejects.toThrow(error);
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  });

  describe('listUsersInGroup', () => {
    it('should call adminService.listUsersInGroup and normalize response', async () => {
      // Arrange
      const groupName = 'testGroup';
      const query = { limit: 10, nextToken: 'token123' };
      const serviceResult = {
        users: [mockUser],
        nextToken: 'nextToken123',
      };
      mockAdminService.listUsersInGroup.mockResolvedValueOnce(serviceResult);

      // Act
      const result = await controller.listUsersInGroup(groupName, query);

      // Assert
      expect(mockAdminService.listUsersInGroup).toHaveBeenCalledWith({
        groupName,
        limit: query.limit,
        nextToken: query.nextToken,
      });
      expect(result).toEqual({
        users: [
          expect.objectContaining({
            username: mockUser.username,
            email: mockUser.attributes.email,
            enabled: mockUser.enabled,
            status: mockUser.userStatus,
            createdAt: mockUser.userCreateDate?.toISOString(),
            updatedAt: mockUser.userLastModifiedDate?.toISOString(),
            role: 'user', // From custom:role attribute
          }),
        ],
        nextToken: serviceResult.nextToken,
      });
    });

    it('should handle errors from service', async () => {
      // Arrange
      const groupName = 'testGroup';
      const query = { limit: 10, nextToken: 'token123' };
      const error = new Error('Service error');
      mockAdminService.listUsersInGroup.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(controller.listUsersInGroup(groupName, query)).rejects.toThrow(error);
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  });

  describe('addUserToGroup', () => {
    it('should call adminService.addUserToGroup with correct parameters', async () => {
      // Arrange
      const body = {
        groupName: 'testGroup',
        username: 'testUser',
      };
      mockAdminService.addUserToGroup.mockResolvedValueOnce({ success: true });

      // Act
      const result = await controller.addUserToGroup(body);

      // Assert
      expect(mockAdminService.addUserToGroup).toHaveBeenCalledWith({
        groupName: body.groupName,
        username: body.username,
      });
      expect(result).toEqual({ success: true });
    });

    it('should handle errors from service', async () => {
      // Arrange
      const body = {
        groupName: 'testGroup',
        username: 'testUser',
      };
      const error = new Error('Service error');
      mockAdminService.addUserToGroup.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(controller.addUserToGroup(body)).rejects.toThrow(error);
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  });

  describe('removeUserFromGroup', () => {
    it('should call adminService.removeUserFromGroup with correct parameters', async () => {
      // Arrange
      const body = {
        groupName: 'testGroup',
        username: 'testUser',
      };
      mockAdminService.removeUserFromGroup.mockResolvedValueOnce({ success: true });

      // Act
      const result = await controller.removeUserFromGroup(body);

      // Assert
      expect(mockAdminService.removeUserFromGroup).toHaveBeenCalledWith({
        groupName: body.groupName,
        username: body.username,
      });
      expect(result).toEqual({ success: true });
    });

    it('should handle errors from service', async () => {
      // Arrange
      const body = {
        groupName: 'testGroup',
        username: 'testUser',
      };
      const error = new Error('Service error');
      mockAdminService.removeUserFromGroup.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(controller.removeUserFromGroup(body)).rejects.toThrow(error);
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  });

  describe('user data normalization', () => {
    it('should properly normalize user data removing Cognito specifics', () => {
      // Create a test user with various attribute types
      const testUser: UserType = {
        username: 'testUser',
        userStatus: 'CONFIRMED',
        enabled: true,
        userCreateDate: new Date('2023-01-01'),
        userLastModifiedDate: new Date('2023-01-02'),
        attributes: {
          email: 'test@example.com',
          'custom:role': 'admin',
          'custom:organization': 'testOrg',
          'cognito:user_status': 'CONFIRMED', // Should be removed
          sub: '123456', // Should be removed
          email_verified: 'true', // Should be removed
          phone_number: '+1234567890',
        },
      };

      // Access the public method directly - no type casting needed
      const normalizedUser = controller.normalizeUser(testUser);

      // Verify normalized structure
      expect(normalizedUser).toEqual({
        username: 'testUser',
        email: 'test@example.com',
        enabled: true,
        status: 'CONFIRMED',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        role: 'admin', // Should be included without 'custom:' prefix
        organization: 'testOrg', // Should be included without 'custom:' prefix
        phone_number: '+1234567890', // Regular attributes should pass through
        // Cognito specific attributes should be excluded
      });

      // Specific checks for excluded attributes
      expect(normalizedUser).not.toHaveProperty('sub');
      expect(normalizedUser).not.toHaveProperty('email_verified');
      expect(normalizedUser).not.toHaveProperty('cognito:user_status');
    });
  });
});
