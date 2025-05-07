import 'reflect-metadata';
import { UserService } from '@domains/user/user.service';
import type { UserRepository } from '@domains/user/user.repository';
import type { LoggerService } from '@shared/services/logger/logger.service';
import type { CognitoService } from '@shared/services/cognito/cognito.service';
import { CreateUserDto, UpdateUserDto } from '@domains/user/user.dto';
import { NotFoundError, ConflictError, BadRequestError } from '@shared/utils/error/error.util';
import type { User, UserId } from '@domains/user/user.model';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import { createMockCognitoService } from '@tests/mocks/cognito.service.mock';
import { faker } from '@faker-js/faker';
import { UserEntity } from '@domains/user/user.schema';
import { RoleEntity } from '@domains/role/role.schema';
import { RoleService } from '@domains/role/role.service';
import { RoleId, Role } from '@domains/role/role.model';

// --- Mocks for Cognito Errors --
// These would typically be in a shared mock/util or defined per test if specific error messages are needed
class UsernameExistsException extends Error {
  readonly name = 'UsernameExistsException';
  constructor(message = 'Username already exists') {
    super(message);
  }
}

class InvalidPasswordException extends Error {
  readonly name = 'InvalidPasswordException';
  constructor(message = 'Invalid password') {
    super(message);
  }
}
// --- End Mocks for Cognito Errors --

// Updated mock UserRepository to include new methods
const createMockUserRepositoryLocal = (): jest.Mocked<UserRepository> =>
  ({
    // ... existing mocks ...
    findAll: jest.fn(),
    findById: jest.fn<Promise<UserEntity | null>, [UserId]>(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getRolesForUser: jest.fn<Promise<RoleEntity[]>, [UserId]>(),
    assignRole: jest.fn<Promise<void>, [UserId, RoleId]>(),
    removeRole: jest.fn<Promise<void>, [UserId, RoleId]>(),
  }) as unknown as jest.Mocked<UserRepository>;

// Mock RoleService for dependency injection
const createMockRoleService = (): jest.Mocked<RoleService> =>
  ({
    findById: jest.fn<Promise<Role | null>, [RoleId]>(),
  }) as unknown as jest.Mocked<RoleService>;

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockCognitoService: jest.Mocked<CognitoService>;
  let mockRoleService: jest.Mocked<RoleService>;
  let mockLogger: jest.Mocked<LoggerService>;

  const mockUserId = faker.string.uuid();
  const mockCognitoSub = faker.string.uuid();
  const mockRoleId: RoleId = faker.number.int({ min: 1, max: 100 });
  const mockRole: RoleEntity = {
    id: mockRoleId,
    name: 'Test Role',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  // Updated mockUser to reflect expected state after creation via Cognito
  const mockUser: User = {
    id: mockUserId,
    email: 'test@example.com',
    username: 'testuser',
    password: null, // Password is not stored locally
    cognito_sub: mockCognitoSub, // Populated from Cognito
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    // Container.reset();

    // Create mocks
    mockLogger = createMockLogger();
    mockUserRepository = createMockUserRepositoryLocal();
    mockCognitoService = createMockCognitoService();
    mockRoleService = createMockRoleService();

    // Instantiate service directly - constructor expects (LoggerService, UserRepository, CognitoService, RoleService)
    userService = new UserService(
      mockLogger,
      mockUserRepository,
      mockCognitoService,
      mockRoleService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      mockUserRepository.findAll.mockResolvedValue(users as UserEntity[]);

      const result = await userService.findAll();

      expect(result).toEqual(users);
      expect(mockUserRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser as UserEntity);
      const result = await userService.findById(mockUserId);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw NotFoundError when user not found', async () => {
      (mockUserRepository.findById as jest.Mock<Promise<UserEntity | null>>).mockResolvedValue(
        null,
      );
      await expect(userService.findById(faker.string.uuid())).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    const createDto: CreateUserDto = {
      email: 'new@example.com',
      username: 'newuser',
      password: 'Password123!', // Password is required
    };
    const cognitoSignUpResult = { sub: mockCognitoSub, userConfirmed: false };

    it('should create user in Cognito and then locally, and return the new user', async () => {
      mockCognitoService.signUp.mockResolvedValue(cognitoSignUpResult);

      const expectedUserPayloadToRepo: Omit<
        UserEntity,
        'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isActive' | 'password'
      > &
        Partial<Pick<UserEntity, 'password'>> = {
        email: createDto.email,
        username: createDto.username,
        cognito_sub: mockCognitoSub,
        // isActive defaults in schema, password is not passed
      };

      const createdUserFromRepo: UserEntity = {
        id: faker.string.uuid(),
        ...expectedUserPayloadToRepo,
        // Ensure all UserEntity fields are present for the mock return
        password: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockUserRepository.create.mockResolvedValue(createdUserFromRepo);

      const result = await userService.create(createDto);

      expect(mockCognitoService.signUp).toHaveBeenCalledWith({
        username: createDto.username,
        email: createDto.email,
        password: createDto.password,
        attributes: createDto.attributes, // Ensure attributes are checked if CreateUserDto has them
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(expectedUserPayloadToRepo),
      );
      expect(result).toEqual({
        user: createdUserFromRepo,
        cognitoUserConfirmed: cognitoSignUpResult.userConfirmed,
        cognitoSub: cognitoSignUpResult.sub,
      });
    });

    it('should throw ConflictError if Cognito signUp throws UsernameExistsException', async () => {
      mockCognitoService.signUp.mockRejectedValue(new UsernameExistsException());

      await expect(userService.create(createDto)).rejects.toThrow(ConflictError);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError if Cognito signUp throws InvalidPasswordException', async () => {
      mockCognitoService.signUp.mockRejectedValue(new InvalidPasswordException());

      await expect(userService.create(createDto)).rejects.toThrow(BadRequestError);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictError if local user creation fails with a unique constraint (e.g., code 23505)', async () => {
      mockCognitoService.signUp.mockResolvedValue(cognitoSignUpResult);
      const dbError = new Error('Unique constraint violation');
      (dbError as { code?: string }).code = '23505'; // Typed access to code
      mockUserRepository.create.mockRejectedValue(dbError);

      await expect(userService.create(createDto)).rejects.toThrow(ConflictError);
      expect(mockCognitoService.signUp).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should re-throw other errors from local user creation', async () => {
      mockCognitoService.signUp.mockResolvedValue(cognitoSignUpResult);
      const genericDbError = new Error('Generic DB Error');
      mockUserRepository.create.mockRejectedValue(genericDbError);

      await expect(userService.create(createDto)).rejects.toThrow(genericDbError);
    });

    it('should throw BadRequestError if cognitoUserSub is undefined after signUp', async () => {
      // Simulate Cognito returning undefined sub, though mapCognitoErrorToAppError should usually prevent this
      mockCognitoService.signUp.mockResolvedValue({ ...cognitoSignUpResult, sub: undefined });

      await expect(userService.create(createDto)).rejects.toThrow(BadRequestError);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = {
      isActive: false,
    };

    it('should update and return user when found', async () => {
      const expectedUpdatedUser: UserEntity = {
        ...mockUser,
        isActive: updateDto.isActive!,
        updatedAt: new Date(),
      };
      mockUserRepository.findById.mockResolvedValue(mockUser as UserEntity);
      mockUserRepository.update.mockResolvedValue(expectedUpdatedUser);

      const result = await userService.update(mockUserId, updateDto);

      // Ensure updatedAt is a Date and then compare the rest
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result).toEqual(
        expect.objectContaining({
          ...expectedUpdatedUser,
          updatedAt: expect.any(Date),
        }),
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUserId, updateDto);
    });

    it('should throw NotFoundError when user not found for update', async () => {
      (mockUserRepository.findById as jest.Mock<Promise<UserEntity | null>>).mockResolvedValue(
        null,
      );
      await expect(userService.update(faker.string.uuid(), updateDto)).rejects.toThrow(
        NotFoundError,
      );
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should soft delete user when found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser as UserEntity);
      mockUserRepository.delete.mockResolvedValue(true);

      await userService.delete(mockUserId);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw NotFoundError when user not found for delete', async () => {
      (mockUserRepository.findById as jest.Mock<Promise<UserEntity | null>>).mockResolvedValue(
        null,
      );
      await expect(userService.delete(faker.string.uuid())).rejects.toThrow(NotFoundError);
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getRolesForUser', () => {
    it('should return roles for a user after ensuring user exists', async () => {
      (mockUserRepository.findById as jest.Mock<Promise<UserEntity | null>>).mockResolvedValue(
        mockUser as UserEntity,
      );
      mockUserRepository.getRolesForUser.mockResolvedValue([mockRole]);

      const result = await userService.getRolesForUser(mockUserId);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockUserRepository.getRolesForUser).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual([
        {
          id: mockRole.id,
          name: mockRole.name,
          createdAt: mockRole.createdAt,
          updatedAt: mockRole.updatedAt,
        },
      ]); // Mapped to RoleDto
    });

    it('should throw NotFoundError if user does not exist for getRolesForUser', async () => {
      (mockUserRepository.findById as jest.Mock<Promise<UserEntity | null>>).mockResolvedValue(
        null,
      );
      await expect(userService.getRolesForUser(mockUserId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('assignRoleToUser', () => {
    it('should assign role if user and role exist', async () => {
      (mockUserRepository.findById as jest.Mock<Promise<UserEntity | null>>).mockResolvedValue(
        mockUser as UserEntity,
      );
      mockRoleService.findById.mockResolvedValue(mockRole as RoleEntity);
      mockUserRepository.assignRole.mockResolvedValue(undefined);

      await userService.assignRoleToUser(mockUserId, mockRoleId);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockRoleService.findById).toHaveBeenCalledWith(mockRoleId);
      expect(mockUserRepository.assignRole).toHaveBeenCalledWith(mockUserId, mockRoleId);
    });
    // Add failure cases for user not found, role not found
  });

  describe('removeRoleFromUser', () => {
    it('should remove role if user exists', async () => {
      (mockUserRepository.findById as jest.Mock<Promise<UserEntity | null>>).mockResolvedValue(
        mockUser as UserEntity,
      );
      mockUserRepository.removeRole.mockResolvedValue(undefined);
      await userService.removeRoleFromUser(mockUserId, mockRoleId);
      expect(mockUserRepository.removeRole).toHaveBeenCalledWith(mockUserId, mockRoleId);
    });
    // Add failure case for user not found
  });
});
