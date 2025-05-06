import 'reflect-metadata';
import { UserService } from '@domains/user/user.service';
import type { UserRepository } from '@domains/user/user.repository';
import type { LoggerService } from '@shared/services/logger/logger.service';
import type { CreateUserDto, UpdateUserDto } from '@domains/user/user.dto';
import { NotFoundError } from '@shared/utils/error/error.util';
import type { User } from '@domains/user/user.model';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import { createMockUserRepository } from '@tests/mocks/user.repository.mock';
import { faker } from '@faker-js/faker';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockLogger: jest.Mocked<LoggerService>;

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

  beforeEach(() => {
    // Container.reset();

    // Create mocks
    mockLogger = createMockLogger();
    mockUserRepository = createMockUserRepository();

    // Instantiate service directly - constructor expects (LoggerService, UserRepository)
    userService = new UserService(mockLogger, mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      mockUserRepository.findAll.mockResolvedValue(users);

      const result = await userService.findAll();

      expect(result).toEqual(users);
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.findById(mockUserId);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw NotFoundError when user not found', async () => {
      mockUserRepository.findById.mockRejectedValue(new NotFoundError('User not found'));

      await expect(userService.findById(faker.string.uuid())).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createDto: CreateUserDto = {
        email: 'new@example.com',
        username: 'newuser',
        isActive: true,
      };
      const expectedUser: User = {
        id: expect.any(String),
        email: createDto.email,
        username: createDto.username,
        isActive: createDto.isActive,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,
        password: null,
        cognito_sub: null,
      };
      mockUserRepository.create.mockResolvedValue(expectedUser);

      const result = await userService.create(createDto);

      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update and return user when found', async () => {
      const updateDto: UpdateUserDto = {
        username: 'updateduser',
      };
      const expectedUpdatedUser: User = {
        ...mockUser,
        username: updateDto.username!,
        updatedAt: expect.any(Date),
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(expectedUpdatedUser);

      const result = await userService.update(mockUserId, updateDto);

      expect(result).toEqual(expectedUpdatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUserId, updateDto);
    });

    it('should throw NotFoundError when user not found for update', async () => {
      const updateDto: UpdateUserDto = {
        username: 'updateduser',
      };
      mockUserRepository.findById.mockRejectedValue(new NotFoundError('User not found'));

      await expect(userService.update(faker.string.uuid(), updateDto)).rejects.toThrow(
        NotFoundError,
      );
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete user when found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(true);

      await userService.delete(mockUserId);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw NotFoundError when user not found for delete', async () => {
      mockUserRepository.findById.mockRejectedValue(new NotFoundError('User not found'));

      await expect(userService.delete(faker.string.uuid())).rejects.toThrow(NotFoundError);
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });
});
