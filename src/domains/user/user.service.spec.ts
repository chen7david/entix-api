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

      expect(result).toEqual(
        users.map((user) =>
          expect.objectContaining({
            id: user.id,
            username: user.username,
            email: user.email,
          }),
        ),
      );
      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.findById(mockUserId);

      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
        }),
      );
      expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw NotFoundError when user not found', async () => {
      userRepository.findById.mockResolvedValue(null as unknown as User);
      const nonExistentId = 'non-existent-id';

      await expect(userService.findById(nonExistentId)).rejects.toThrow(NotFoundError);
      expect(userRepository.findById).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createDto: CreateUserDto = {
        username: 'newuser',
        email: 'new@example.com',
        cognitoSub: 'cognito-123456',
        isDisabled: false,
        isAdmin: false,
      };

      const newUser: User = {
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

      userRepository.create.mockResolvedValue(newUser);

      const result = await userService.create(createDto);

      expect(result).toEqual(
        expect.objectContaining({
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        }),
      );
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

      expect(result).toEqual(
        expect.objectContaining({
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
        }),
      );
      expect(userRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(userRepository.update).toHaveBeenCalledWith(mockUserId, updateDto);
    });

    it('should throw NotFoundError when user not found', async () => {
      const updateDto: UpdateUserDto = {
        username: 'updateduser',
      };
      const nonExistentId = 'non-existent-id';

      userRepository.findById.mockResolvedValue(null as unknown as User);

      await expect(userService.update(nonExistentId, updateDto)).rejects.toThrow(NotFoundError);
      expect(userRepository.findById).toHaveBeenCalledWith(nonExistentId);
      expect(userRepository.update).not.toHaveBeenCalled();
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
      const nonExistentId = 'non-existent-id';
      userRepository.findById.mockResolvedValue(null as unknown as User);

      await expect(userService.delete(nonExistentId)).rejects.toThrow(NotFoundError);
      expect(userRepository.findById).toHaveBeenCalledWith(nonExistentId);
      expect(userRepository.delete).not.toHaveBeenCalled();
    });
  });
});
