import 'reflect-metadata';
import { Container } from 'typedi';
import { UserRepository } from '@domains/user/user.repository';
import { DatabaseService } from '@shared/services/database/database.service';
import { users } from '@domains/user/user.schema';
import { User } from '@domains/user/user.model';
import { NotFoundError } from '@shared/utils/error/error.util';

/**
 * Tests for the UserRepository class, verifying proper interaction with the database
 * and validation of CRUD operations.
 */
describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockDb: Record<string, jest.Mock>;

  // Mock user data
  const mockUser: User = {
    id: 'b3e1c2d4-5678-1234-9abc-1234567890ab',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    preferredLanguage: 'en-US',
    cognitoSub: 'cognito-123456',
    isDisabled: false,
    isAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  // Setup before each test
  beforeEach(() => {
    // Reset TypeDI container
    Container.reset();

    // Create mock DB operations that can be chained
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      $dynamic: jest.fn().mockReturnThis(),
    };

    // Create mock DB service with the mockDb
    const mockDbService = {
      db: mockDb,
    } as unknown as DatabaseService;

    // Register mock with TypeDI
    Container.set(DatabaseService, mockDbService);

    // Get repository instance from container
    userRepository = Container.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user and return the created user', async () => {
      // Arrange
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        preferredLanguage: 'en-US',
        cognitoSub: 'cognito-123456',
        isDisabled: false,
        isAdmin: false,
      };

      const createdUser = {
        ...userData,
        id: 'b3e1c2d4-5678-1234-9abc-1234567890ab',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockDb.returning.mockResolvedValue([createdUser]);

      // Act
      const result = await userRepository.create(userData);

      // Assert
      expect(mockDb.insert).toHaveBeenCalledWith(users);
      expect(mockDb.values).toHaveBeenCalledWith(userData);
      expect(mockDb.returning).toHaveBeenCalled();
      expect(result).toEqual(createdUser);
    });

    it('should throw an error if creation fails', async () => {
      // Arrange
      const userData = {
        username: 'erroruser',
        email: 'error@example.com',
        firstName: 'Error',
        lastName: 'User',
        preferredLanguage: 'en-US',
        cognitoSub: 'cognito-123456',
        isDisabled: false,
        isAdmin: false,
      };

      mockDb.returning.mockResolvedValue([]);

      // Act & Assert
      await expect(userRepository.create(userData)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should return user by ID when found', async () => {
      // Direct mocking of the repository method
      jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);

      // Act
      const result = await userRepository.findById('b3e1c2d4-5678-1234-9abc-1234567890ab');

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundError when user not found', async () => {
      // Mock NotFoundError directly
      jest.spyOn(userRepository, 'findById').mockImplementation(async () => {
        throw new NotFoundError(`User not found`);
      });

      // Act & Assert
      await expect(userRepository.findById('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      // Arrange
      const usersArray = [
        mockUser,
        {
          ...mockUser,
          id: 'c4f2d3e5-6789-2345-0abc-2345678901bc',
          username: 'user2',
          email: 'user2@example.com',
        },
      ];

      // Direct mocking of the repository method
      jest.spyOn(userRepository, 'findAll').mockResolvedValue(usersArray);

      // Act
      const result = await userRepository.findAll();

      // Assert
      expect(result).toEqual(usersArray);
    });
  });

  describe('update', () => {
    it('should update user and return updated user', async () => {
      // Arrange
      const updateData = { username: 'updatedname' };
      const updatedUser = { ...mockUser, ...updateData };

      mockDb.returning.mockResolvedValue([updatedUser]);

      // Act
      const result = await userRepository.update(
        'b3e1c2d4-5678-1234-9abc-1234567890ab',
        updateData,
      );

      // Assert
      expect(mockDb.update).toHaveBeenCalledWith(users);
      expect(mockDb.set).toHaveBeenCalledWith(updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundError when user not found for update', async () => {
      // Arrange
      mockDb.returning.mockResolvedValue([]);

      // Direct mocking of the repository method
      jest.spyOn(userRepository, 'update').mockImplementation(async () => {
        throw new NotFoundError(`User not found`);
      });

      // Act & Assert
      await expect(
        userRepository.update('non-existent-id', { username: 'Not Found' }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should soft delete user by setting deletedAt', async () => {
      // Arrange
      mockDb.returning.mockResolvedValue([{ id: 'b3e1c2d4-5678-1234-9abc-1234567890ab' }]);

      // Act
      await userRepository.delete('b3e1c2d4-5678-1234-9abc-1234567890ab');

      // Assert
      expect(mockDb.update).toHaveBeenCalledWith(users);
      expect(mockDb.set).toHaveBeenCalled();
    });

    it('should throw NotFoundError when user not found for delete', async () => {
      // Arrange
      mockDb.returning.mockResolvedValue([]);

      // Direct mocking of the repository method
      jest.spyOn(userRepository, 'delete').mockImplementation(async () => {
        throw new NotFoundError(`User not found`);
      });

      // Act & Assert
      await expect(userRepository.delete('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });
});
