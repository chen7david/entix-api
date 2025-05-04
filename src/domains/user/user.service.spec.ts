import 'reflect-metadata';
import { UserService } from '@domains/user/user.service';
import { UserRepository } from '@domains/user/user.repository';
import { LoggerService } from '@shared/services/logger/logger.service';
import { CreateUserDto, UpdateUserDto } from '@domains/user/user.dto';
import { NotFoundError } from '@shared/utils/error/error.util';
import { User } from '@domains/user/user.model';
import { Container } from 'typedi';
import { createMockLogger } from '@shared/utils/test-helpers/mocks/mock-logger.util';
import { faker } from '@faker-js/faker';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let loggerService: LoggerService;
  let mockLogger: LoggerService;

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
    // Reset the container before each test
    Container.reset();

    // Create mock logger
    mockLogger = createMockLogger();

    // Create mock services
    loggerService = {
      child: jest.fn().mockReturnValue(mockLogger),
      component: jest.fn().mockReturnValue(mockLogger),
    } as unknown as LoggerService;

    userRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    // Register mocks with the container
    Container.set(LoggerService, loggerService);
    Container.set(UserRepository, userRepository);

    // Get the service under test from the container
    userService = Container.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      userRepository.findAll.mockResolvedValue(users);

      const result = await userService.findAll();

      expect(result).toEqual(users);
      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.findById(mockUserId);

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw NotFoundError when user not found', async () => {
      userRepository.findById.mockRejectedValue(new NotFoundError('User not found'));

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

      const newUser: User = {
        ...createDto,
        id: faker.string.uuid(),
        password: null,
        cognito_sub: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      userRepository.create.mockResolvedValue(newUser);

      const result = await userService.create(createDto);

      expect(result).toEqual(newUser);
      expect(userRepository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update and return user when found', async () => {
      const updateDto: UpdateUserDto = {
        username: 'updateduser',
      };

      const updatedUser: User = {
        ...mockUser,
        username: 'updateduser',
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.update(mockUserId, updateDto);

      expect(result).toEqual(updatedUser);
      expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(userRepository.update).toHaveBeenCalledWith(mockUserId, updateDto);
    });

    it('should throw NotFoundError when user not found', async () => {
      const updateDto: UpdateUserDto = {
        username: 'updateduser',
      };

      userRepository.findById.mockRejectedValue(new NotFoundError('User not found'));

      await expect(userService.update(faker.string.uuid(), updateDto)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('delete', () => {
    it('should delete user when found', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(true);

      await userService.delete(mockUserId);

      expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(userRepository.delete).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw NotFoundError when user not found', async () => {
      userRepository.findById.mockRejectedValue(new NotFoundError('User not found'));

      await expect(userService.delete(faker.string.uuid())).rejects.toThrow(NotFoundError);
    });
  });
});
