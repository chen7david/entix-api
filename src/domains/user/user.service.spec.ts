import 'reflect-metadata';
import { UserService } from '@domains/user/user.service';
import { UserRepository } from '@domains/user/user.repository';
import { LoggerService } from '@shared/services/logger/logger.service';
import { CreateUserDto, UpdateUserDto } from '@domains/user/user.dto';
import { NotFoundError } from '@shared/utils/error/error.util';
import { User } from '@domains/user/user.model';
import { Container } from 'typedi';
import { createMockLogger } from '@shared/utils/test-helpers/mocks/mock-logger.util';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let loggerService: LoggerService;
  let mockLogger: LoggerService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    isActive: true,
    createdAt: new Date(),
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

      const result = await userService.findById(1);

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when user not found', async () => {
      userRepository.findById.mockResolvedValue(null as unknown as User);

      await expect(userService.findById(999)).rejects.toThrow(NotFoundError);
      expect(userRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createDto: CreateUserDto = {
        email: 'new@example.com',
        name: 'New User',
        isActive: true,
      };

      const newUser = {
        id: 2,
        ...createDto,
        createdAt: new Date(),
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
        name: 'Updated Name',
      };

      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.update(1, updateDto);

      expect(result).toEqual(updatedUser);
      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(userRepository.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw NotFoundError when user not found', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      userRepository.findById.mockResolvedValue(null as unknown as User);

      await expect(userService.update(999, updateDto)).rejects.toThrow(NotFoundError);
      expect(userRepository.findById).toHaveBeenCalledWith(999);
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete user when found', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(true);

      await userService.delete(1);

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(userRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when user not found', async () => {
      userRepository.findById.mockResolvedValue(null as unknown as User);

      await expect(userService.delete(999)).rejects.toThrow(NotFoundError);
      expect(userRepository.findById).toHaveBeenCalledWith(999);
      expect(userRepository.delete).not.toHaveBeenCalled();
    });
  });
});
