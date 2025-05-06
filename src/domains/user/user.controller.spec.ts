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
  const mockUser: User = {
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
      // Arrange
      const users = [mockUser];
      mockUserService.findAll.mockResolvedValue(users);

      // Act
      const result = await usersController.getAll();

      // Assert
      expect(result).toEqual(users);
      expect(mockUserService.findAll).toHaveBeenCalledTimes(1);
      expect(mockLoggerService.component).toHaveBeenCalledWith('UsersController');
      expect(mockLoggerService.info).toHaveBeenCalledWith('Fetching all users');
    });
  });

  describe('Method: getById', () => {
    it('should return user by ID when found', async () => {
      // Arrange
      mockUserService.findById.mockResolvedValue(mockUser);

      // Act
      const result = await usersController.getById(mockUserId);

      // Assert
      expect(result).toEqual(mockUser);
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
    it('should create and return a new user', async () => {
      // Arrange
      const createDto = {
        email: 'new@example.com',
        username: 'newuser',
        isActive: true,
      };

      const newUser: User = {
        ...createDto,
        id: faker.string.uuid(),
        password: null,
        cognito_sub: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockUserService.create.mockResolvedValue(newUser);

      // Act
      const result = await usersController.create(createDto);

      // Assert
      expect(result).toEqual(newUser);
      expect(mockUserService.create).toHaveBeenCalledWith(createDto);
      expect(mockLoggerService.component).toHaveBeenCalledWith('UsersController');
      expect(mockLoggerService.info).toHaveBeenCalledWith('Creating user', {
        email: createDto.email,
      });
    });
  });

  describe('Method: update', () => {
    it('should update and return user when found', async () => {
      // Arrange
      const updateDto = {
        username: 'updateduser',
      };

      const updatedUser: User = {
        ...mockUser,
        username: 'updateduser',
      };

      mockUserService.update.mockResolvedValue(updatedUser);

      // Act
      const result = await usersController.update(mockUserId, updateDto);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockUserService.update).toHaveBeenCalledWith(mockUserId, updateDto);
      expect(mockLoggerService.component).toHaveBeenCalledWith('UsersController');
      expect(mockLoggerService.info).toHaveBeenCalledWith('Updating user', {
        id: mockUserId,
      });
    });

    it('should propagate error when user not found', async () => {
      // Arrange
      const updateDto = {
        username: 'updateduser',
      };
      const error = new NotFoundError('User not found');
      mockUserService.update.mockRejectedValue(error);
      const nonExistentId = faker.string.uuid();
      // Act & Assert
      await expect(usersController.update(nonExistentId, updateDto)).rejects.toThrow(NotFoundError);
      expect(mockUserService.update).toHaveBeenCalledWith(nonExistentId, updateDto);
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
});
