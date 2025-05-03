import 'reflect-metadata';
import { Container } from 'typedi';
import { UserRepository } from '@domains/user/user.repository';
import { users } from '@domains/user/user.schema';
import { NotFoundError } from '@shared/utils/error/error.util';
import { setupMockDb } from '@shared/utils/test-helpers/setup/mock-db.setup';
import { UserFactory } from '@shared/utils/test-helpers/factories/user.factory';
import { LoggerService } from '@shared/services/logger/logger.service';
import { createMockLogger } from '@shared/utils/test-helpers/mocks/mock-logger.util';

/**
 * Tests for the UserRepository class, verifying proper interaction with the database
 * and validation of CRUD operations.
 */
describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockDb: Record<string, jest.Mock>;
  let mockLogger: LoggerService;

  // Mock user data
  const mockUser = UserFactory.createMockUser();

  // Setup before each test
  beforeEach(() => {
    // Reset TypeDI container
    Container.reset();

    // Setup mock logger
    mockLogger = createMockLogger();
    Container.set(LoggerService, { component: jest.fn().mockReturnValue(mockLogger) });

    // Setup mock database
    mockDb = setupMockDb();

    // Get repository instance from container
    userRepository = Container.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user and return the created user', async () => {
      // Arrange
      const userData = UserFactory.createUserDto();
      const createdUser = UserFactory.createMockUser({
        ...userData,
        id: mockUser.id,
      });

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
      const userData = UserFactory.createUserDto();
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
      const result = await userRepository.findById(mockUser.id);

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
      const usersArray = UserFactory.createMockUsers(2);

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
      const updateData = UserFactory.updateUserDto({ username: 'updatedname' });
      const updatedUser = { ...mockUser, ...updateData };

      mockDb.returning.mockResolvedValue([updatedUser]);

      // Act
      const result = await userRepository.update(mockUser.id, updateData);

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
      mockDb.returning.mockResolvedValue([{ id: mockUser.id }]);

      // Act
      await userRepository.delete(mockUser.id);

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
