import 'reflect-metadata';
import { Container } from 'typedi';
import { UsersController } from '@domains/user/user.controller';
import { UserService } from '@domains/user/user.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { Logger } from '@shared/types/logger.type';
import { CreateUserDto, UpdateUserDto } from '@domains/user/user.dto';
import { User } from '@domains/user/user.model';
import { NotFoundError } from '@shared/utils/error/error.util';
import express from 'express';
import { useExpressServer } from 'routing-controllers';

/**
 * Tests for the UsersController class, verifying proper API endpoint behavior
 * and correct interaction with the UserService.
 */
describe('UsersController', () => {
  let usersController: UsersController;
  let userService: jest.Mocked<UserService>;
  let loggerService: jest.Mocked<LoggerService>;
  let mockLogger: jest.Mocked<Logger>;
  let app: express.Application;

  // Mock UUID for tests
  const mockUserId = 'b3e1c2d4-5678-1234-9abc-1234567890ab';

  const mockUser: User = {
    id: mockUserId,
    username: 'testuser',
    email: 'test@example.com',
    cognitoSub: 'cognito-123456',
    isDisabled: false,
    isAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  // Initialize test dependencies before each test
  beforeEach(() => {
    // Reset the TypeDI container
    Container.reset();

    // Create mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    // Create mock services
    loggerService = {
      child: jest.fn().mockReturnValue(mockLogger),
      component: jest.fn().mockReturnValue(mockLogger),
    } as unknown as jest.Mocked<LoggerService>;

    userService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    // Register mocks with the container
    Container.set(LoggerService, loggerService);
    Container.set(UserService, userService);

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
      // Arrange
      const users = [mockUser];
      userService.findAll.mockResolvedValue(users);

      // Act
      const result = await usersController.getAll();

      // Assert
      expect(result).toEqual(users);
      expect(userService.findAll).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith('Fetching all users');
    });
  });

  describe('Method: getById', () => {
    it('should return user by ID when found', async () => {
      // Arrange
      userService.findById.mockResolvedValue(mockUser);

      // Act
      const result = await usersController.getById(mockUserId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userService.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockLogger.info).toHaveBeenCalledWith('Fetching user by ID', { id: mockUserId });
    });

    it('should propagate error when user not found', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id';
      userService.findById.mockRejectedValue(new NotFoundError('User not found'));

      // Act & Assert
      await expect(usersController.getById(nonExistentId)).rejects.toThrow(NotFoundError);
      expect(userService.findById).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('Method: create', () => {
    it('should create and return a new user', async () => {
      // Arrange
      const createDto: CreateUserDto = {
        username: 'newuser',
        email: 'new@example.com',
        cognitoSub: 'cognito-123456',
        isDisabled: false,
        isAdmin: false,
      };

      const newUser = {
        id: 'c4f2d3e5-6789-2345-0abc-2345678901bc',
        username: createDto.username,
        email: createDto.email,
        cognitoSub: createDto.cognitoSub,
        isDisabled: false,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      userService.create.mockResolvedValue(newUser);

      // Act
      const result = await usersController.create(createDto);

      // Assert
      expect(result).toEqual(newUser);
      expect(userService.create).toHaveBeenCalledWith(createDto);
      expect(mockLogger.info).toHaveBeenCalledWith('Creating user', {
        email: createDto.email,
        username: createDto.username,
      });
    });
  });

  describe('Method: update', () => {
    it('should update and return user when found', async () => {
      // Arrange
      const updateDto: UpdateUserDto = {
        username: 'updateduser',
      };

      const updatedUser = {
        ...mockUser,
        username: 'updateduser',
      };

      userService.update.mockResolvedValue(updatedUser);

      // Act
      const result = await usersController.update(mockUserId, updateDto);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(userService.update).toHaveBeenCalledWith(mockUserId, updateDto);
      expect(mockLogger.info).toHaveBeenCalledWith('Updating user', { id: mockUserId });
    });

    it('should propagate error when user not found', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id';
      const updateDto: UpdateUserDto = {
        username: 'updateduser',
      };

      userService.update.mockRejectedValue(new NotFoundError('User not found'));

      // Act & Assert
      await expect(usersController.update(nonExistentId, updateDto)).rejects.toThrow(NotFoundError);
      expect(userService.update).toHaveBeenCalledWith(nonExistentId, updateDto);
    });
  });

  describe('Method: delete', () => {
    it('should delete user when found', async () => {
      // Arrange
      userService.delete.mockResolvedValue(undefined);

      // Act
      await usersController.delete(mockUserId);

      // Assert
      expect(userService.delete).toHaveBeenCalledWith(mockUserId);
      expect(mockLogger.info).toHaveBeenCalledWith('Deleting user', { id: mockUserId });
    });

    it('should propagate error when user not found', async () => {
      // Arrange
      const nonExistentId = 'non-existent-id';
      userService.delete.mockRejectedValue(new NotFoundError('User not found'));

      // Act & Assert
      await expect(usersController.delete(nonExistentId)).rejects.toThrow(NotFoundError);
      expect(userService.delete).toHaveBeenCalledWith(nonExistentId);
    });
  });
});
