import 'reflect-metadata';
import { Container } from 'typedi';
import { UsersController } from '@domains/user/user.controller';
import { UserService } from '@domains/user/user.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { NotFoundError } from '@shared/utils/error/error.util';
import { User } from '@domains/user/user.model';
import express from 'express';
import { useExpressServer } from 'routing-controllers';
import { faker } from '@faker-js/faker';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import { createMockUserService } from '@tests/mocks/user.service.mock';
import { CreateUserDto, UpdateUserDto } from '@domains/user/user.dto';
import { RoleDto } from '@domains/role/role.dto';
import { RoleId } from '@domains/role/role.model';
import { AssignRoleToUserDto } from '@domains/user/user.dto';

/**
 * Tests for the UsersController class, verifying proper API endpoint behavior
 * and correct interaction with the UserService.
 */
describe('UsersController', () => {
  let usersController: UsersController;
  let mockUserService: jest.Mocked<UserService>;
  let mockLoggerService: jest.Mocked<LoggerService>;
  let app: express.Application;

  const mockUserId = faker.string.uuid();
  const mockRoleId: RoleId = faker.number.int({ min: 1, max: 1000 });
  const mockUserFromService: User = {
    id: mockUserId,
    email: 'test@example.com',
    username: 'testuser',
    password: null,
    cognito_sub: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  // Expected DTO shape for mockUserFromService
  const mockUserDtoShape = {
    id: mockUserFromService.id,
    email: mockUserFromService.email,
    username: mockUserFromService.username,
    cognito_sub: mockUserFromService.cognito_sub,
    isActive: mockUserFromService.isActive,
    createdAt: mockUserFromService.createdAt,
    updatedAt: mockUserFromService.updatedAt,
    // password and deletedAt are NOT in DTO
  };

  const mockRoleDto: RoleDto = {
    id: mockRoleId,
    name: 'Test Role',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Initialize test dependencies before each test
  beforeEach(() => {
    // Reset the TypeDI container
    Container.reset();

    // Create mocks using factories
    mockLoggerService = createMockLogger();
    mockUserService = createMockUserService();

    // Register mocks with the container
    Container.set(LoggerService, mockLoggerService);
    Container.set(UserService, mockUserService);

    // Get controller instance from container
    usersController = Container.get(UsersController);

    // Initialize Express app for testing
    app = express();
    useExpressServer(app, {
      controllers: [UsersController],
      defaultErrorHandler: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Direct method tests
  describe('Method: getAll', () => {
    it('should return all users', async () => {
      const usersFromService = [mockUserFromService];
      mockUserService.findAll.mockResolvedValue(usersFromService);

      const result = await usersController.getAll();

      expect(result).toEqual([mockUserDtoShape]); // Compare with DTO shape
      expect(mockUserService.findAll).toHaveBeenCalledTimes(1);
      expect(mockLoggerService.component).toHaveBeenCalledWith('UsersController');
      expect(mockLoggerService.info).toHaveBeenCalledWith('Fetching all users');
    });
  });

  describe('Method: getById', () => {
    it('should return user by ID when found', async () => {
      mockUserService.findById.mockResolvedValue(mockUserFromService);
      const result = await usersController.getById(mockUserId);
      expect(result).toEqual(mockUserDtoShape); // Compare with DTO shape
      expect(mockUserService.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockLoggerService.component).toHaveBeenCalledWith('UsersController');
      expect(mockLoggerService.info).toHaveBeenCalledWith('Fetching user by ID', {
        id: mockUserId,
      });
    });

    it('should propagate error when user not found', async () => {
      // Arrange
      const error = new NotFoundError('User not found');
      mockUserService.findById.mockRejectedValue(error);
      const nonExistentId = faker.string.uuid();
      // Act & Assert
      await expect(usersController.getById(nonExistentId)).rejects.toThrow(NotFoundError);
      expect(mockUserService.findById).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('Method: create', () => {
    const createDtoWithPassword: CreateUserDto = {
      email: 'new@example.com',
      username: 'newuser',
      password: 'ValidPassword123!',
    };
    const createdUserFromService: User = {
      id: faker.string.uuid(),
      email: createDtoWithPassword.email,
      username: createDtoWithPassword.username,
      password: null,
      cognito_sub: faker.string.uuid(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    const expectedCreatedUserDtoShape = {
      id: createdUserFromService.id,
      email: createdUserFromService.email,
      username: createdUserFromService.username,
      cognito_sub: createdUserFromService.cognito_sub,
      isActive: createdUserFromService.isActive,
      createdAt: createdUserFromService.createdAt,
      updatedAt: createdUserFromService.updatedAt,
    };

    it('should create and return a new user', async () => {
      mockUserService.create.mockResolvedValue(createdUserFromService);
      const result = await usersController.create(createDtoWithPassword);
      expect(result).toEqual(expectedCreatedUserDtoShape); // Compare with DTO shape
      expect(mockUserService.create).toHaveBeenCalledWith(createDtoWithPassword);
    });
  });

  describe('Method: update', () => {
    const updateDto: UpdateUserDto = { isActive: false };
    const baseUserForUpdate: User = { ...mockUserFromService }; // Use a copy
    const updatedUserFromService: User = {
      ...baseUserForUpdate,
      isActive: updateDto.isActive!,
      updatedAt: new Date(), // Ensure updatedAt is fresh
    };
    const expectedUpdatedUserDtoShape = {
      id: updatedUserFromService.id,
      email: updatedUserFromService.email,
      username: updatedUserFromService.username,
      cognito_sub: updatedUserFromService.cognito_sub,
      isActive: updatedUserFromService.isActive,
      createdAt: updatedUserFromService.createdAt,
      updatedAt: updatedUserFromService.updatedAt, // This will be a new Date object
    };

    it('should update and return user', async () => {
      mockUserService.update.mockResolvedValue(updatedUserFromService);
      const result = await usersController.update(mockUserId, updateDto);
      // For updatedAt, allow any Date object as it's set by the service mock
      expect(result).toEqual(
        expect.objectContaining({
          ...expectedUpdatedUserDtoShape,
          updatedAt: expect.any(Date),
        }),
      );
      // Check if the date is reasonably close if exact match is too flaky
      expect(result.updatedAt.getTime()).toBeCloseTo(
        expectedUpdatedUserDtoShape.updatedAt.getTime(),
        -2,
      );
      expect(mockUserService.update).toHaveBeenCalledWith(mockUserId, updateDto);
    });

    it('should propagate NotFoundError from service for update', async () => {
      mockUserService.update.mockRejectedValue(new NotFoundError('User not found'));
      const nonExistentId = faker.string.uuid(); // Ensure a non-existent ID is used
      // Use a valid UpdateUserDto for the call, even if expecting an error
      await expect(usersController.update(nonExistentId, updateDto)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Method: delete', () => {
    it('should delete user when found', async () => {
      // Arrange
      mockUserService.delete.mockResolvedValue(undefined);

      // Act
      await usersController.delete(mockUserId);

      // Assert
      expect(mockUserService.delete).toHaveBeenCalledWith(mockUserId);
      expect(mockLoggerService.component).toHaveBeenCalledWith('UsersController');
      expect(mockLoggerService.info).toHaveBeenCalledWith('Deleting user', {
        id: mockUserId,
      });
    });

    it('should propagate error when user not found', async () => {
      // Arrange
      const error = new NotFoundError('User not found');
      mockUserService.delete.mockRejectedValue(error);
      const nonExistentId = faker.string.uuid();
      // Act & Assert
      await expect(usersController.delete(nonExistentId)).rejects.toThrow(NotFoundError);
      expect(mockUserService.delete).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('Method: getRolesForUser', () => {
    it('should return roles for a user', async () => {
      mockUserService.getRolesForUser.mockResolvedValue([mockRoleDto]);
      const result = await usersController.getRolesForUser(mockUserId);
      expect(result).toEqual([mockRoleDto]);
      expect(mockUserService.getRolesForUser).toHaveBeenCalledWith(mockUserId);
    });

    it('should propagate NotFoundError if user not found', async () => {
      mockUserService.getRolesForUser.mockRejectedValue(new NotFoundError('User not found'));
      await expect(usersController.getRolesForUser(mockUserId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Method: assignRoleToUser', () => {
    const assignDto: AssignRoleToUserDto = { roleId: mockRoleId };
    it('should call service assignRoleToUser and return void (204)', async () => {
      mockUserService.assignRoleToUser.mockResolvedValue(undefined);
      await usersController.assignRoleToUser(mockUserId, assignDto);
      expect(mockUserService.assignRoleToUser).toHaveBeenCalledWith(mockUserId, mockRoleId);
    });

    it('should propagate errors from service (e.g., NotFoundError for user or role)', async () => {
      mockUserService.assignRoleToUser.mockRejectedValue(
        new NotFoundError('User or Role not found'),
      );
      await expect(usersController.assignRoleToUser(mockUserId, assignDto)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('Method: removeRoleFromUser', () => {
    it('should call service removeRoleFromUser and return void (204)', async () => {
      mockUserService.removeRoleFromUser.mockResolvedValue(undefined);
      await usersController.removeRoleFromUser(mockUserId, mockRoleId);
      expect(mockUserService.removeRoleFromUser).toHaveBeenCalledWith(mockUserId, mockRoleId);
    });

    it('should propagate NotFoundError if user not found', async () => {
      mockUserService.removeRoleFromUser.mockRejectedValue(new NotFoundError('User not found'));
      await expect(usersController.removeRoleFromUser(mockUserId, mockRoleId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
