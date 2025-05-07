import 'reflect-metadata';
import { RoleService } from '@domains/role/role.service';
import type { RoleRepository } from '@domains/role/role.repository';
import type { LoggerService } from '@shared/services/logger/logger.service';
import { CreateRoleDto, UpdateRoleDto } from '@domains/role/role.dto';
import { NotFoundError, ConflictError } from '@shared/utils/error/error.util';
import type { RoleId, RoleUpdatePayload } from '@domains/role/role.model';
import { RoleEntity, CreateRoleEntity } from '@domains/role/role.schema';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import { faker } from '@faker-js/faker';
import { PermissionEntity } from '@domains/permission/permission.schema';
import { PermissionService } from '@domains/permission/permission.service';
import { PermissionId } from '@domains/permission/permission.model';

// Helper to create a mock RoleRepository
const createMockRoleRepository = (): jest.Mocked<RoleRepository> =>
  ({
    findAll: jest.fn<Promise<RoleEntity[]>, []>(),
    findById: jest.fn<Promise<RoleEntity | null>, [RoleId]>(),
    findByName: jest.fn<Promise<RoleEntity | null>, [string]>(),
    create: jest.fn<Promise<RoleEntity>, [CreateRoleEntity]>(),
    update: jest.fn<Promise<RoleEntity>, [RoleId, RoleUpdatePayload | Partial<RoleEntity>]>(),
    delete: jest.fn<Promise<boolean>, [RoleId]>(),
    getPermissionsForRole: jest.fn<Promise<PermissionEntity[]>, [RoleId]>(),
    assignPermission: jest.fn<Promise<void>, [RoleId, PermissionId]>(),
    removePermission: jest.fn<Promise<void>, [RoleId, PermissionId]>(),
  }) as unknown as jest.Mocked<RoleRepository>;

// Mock PermissionService for dependency injection
const createMockPermissionService = (): jest.Mocked<PermissionService> =>
  ({
    findById: jest.fn(),
    // Add other methods if RoleService calls them, but findById is primary for validation here
  }) as unknown as jest.Mocked<PermissionService>;

describe('RoleService', () => {
  let roleService: RoleService;
  let mockRoleRepository: jest.Mocked<RoleRepository>;
  let mockPermissionService: jest.Mocked<PermissionService>;
  let mockLoggerService: jest.Mocked<LoggerService>;

  const mockRoleId: RoleId = faker.number.int({ min: 1, max: 100 });
  const mockPermissionId: PermissionId = faker.number.int({ min: 1, max: 100 });
  const mockRole: RoleEntity = {
    id: mockRoleId,
    name: 'Admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
  const mockPermission: PermissionEntity = {
    id: mockPermissionId,
    name: 'articles:edit',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    mockLoggerService = createMockLogger();
    mockRoleRepository = createMockRoleRepository();
    mockPermissionService = createMockPermissionService();
    roleService = new RoleService(mockLoggerService, mockRoleRepository, mockPermissionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all roles from repository', async () => {
      const roles = [mockRole];
      mockRoleRepository.findAll.mockResolvedValue(roles);
      const result = await roleService.findAll();
      expect(result).toEqual(roles);
      expect(mockRoleRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return role when found', async () => {
      mockRoleRepository.findById.mockResolvedValue(mockRole);
      const result = await roleService.findById(mockRoleId);
      expect(result).toEqual(mockRole);
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(mockRoleId);
    });

    it('should throw NotFoundError when role not found', async () => {
      (mockRoleRepository.findById as jest.Mock<Promise<RoleEntity | null>>).mockResolvedValue(
        null,
      );
      await expect(roleService.findById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    const createDto: CreateRoleDto = { name: 'NewRole' };
    const roleToCreate: CreateRoleEntity = { name: createDto.name };
    const createdRole: RoleEntity = {
      ...roleToCreate,
      id: 123,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should create and return role if name is unique', async () => {
      mockRoleRepository.findByName.mockResolvedValue(null); // Name is unique
      mockRoleRepository.create.mockResolvedValue(createdRole);

      const result = await roleService.create(createDto);

      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(createDto.name);
      expect(mockRoleRepository.create).toHaveBeenCalledWith(roleToCreate);
      expect(result).toEqual(createdRole);
    });

    it('should throw ConflictError if role name already exists', async () => {
      mockRoleRepository.findByName.mockResolvedValue(mockRole); // Name exists

      await expect(roleService.create(createDto)).rejects.toThrow(ConflictError);
      expect(mockRoleRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateRoleDto = { name: 'UpdatedRoleName' };
    const existingRole: RoleEntity = { ...mockRole, id: mockRoleId, name: 'OldRoleName' };
    const updatedRoleEntity: RoleEntity = { ...existingRole, ...updateDto, updatedAt: new Date() };

    it('should update and return role if name is unique or unchanged', async () => {
      mockRoleRepository.findById.mockResolvedValue(existingRole);
      mockRoleRepository.findByName.mockResolvedValue(null); // New name is unique
      mockRoleRepository.update.mockResolvedValue(updatedRoleEntity);

      const result = await roleService.update(mockRoleId, updateDto);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(mockRoleId);
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(updateDto.name);
      expect(mockRoleRepository.update).toHaveBeenCalledWith(mockRoleId, updateDto);
      expect(result).toEqual(updatedRoleEntity);
    });

    it('should allow update if name is unchanged, without findByName check for conflict', async () => {
      const sameNameUpdateDto: UpdateRoleDto = { name: existingRole.name };
      const roleAfterUpdateNoNameChange: RoleEntity = { ...existingRole, updatedAt: new Date() };
      mockRoleRepository.findById.mockResolvedValue(existingRole);
      mockRoleRepository.update.mockResolvedValue(roleAfterUpdateNoNameChange);

      await roleService.update(mockRoleId, sameNameUpdateDto);

      expect(mockRoleRepository.findByName).not.toHaveBeenCalled(); // Crucial: no check if name is same
      expect(mockRoleRepository.update).toHaveBeenCalledWith(mockRoleId, sameNameUpdateDto);
    });

    it('should throw ConflictError if new name conflicts with another existing role', async () => {
      const conflictingRole: RoleEntity = {
        ...mockRole,
        id: mockRoleId + 1,
        name: updateDto.name!,
      }; // Different ID, same new name
      mockRoleRepository.findById.mockResolvedValue(existingRole);
      mockRoleRepository.findByName.mockResolvedValue(conflictingRole);

      await expect(roleService.update(mockRoleId, updateDto)).rejects.toThrow(ConflictError);
      expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });

    it('should allow update if new name conflicts with the *same* role being updated (should not happen with current findByName)', async () => {
      // This tests if findByName accidentally finds the role being updated and causes a false conflict.
      // Current findByName in service for update should prevent this via "existingRoleWithNewName.id !== id"
      mockRoleRepository.findById.mockResolvedValue(existingRole);
      mockRoleRepository.findByName.mockResolvedValue(existingRole); // findByName returns the role being updated itself
      mockRoleRepository.update.mockResolvedValue(updatedRoleEntity);

      const result = await roleService.update(mockRoleId, updateDto); // Update to its own current name (or a new one)
      expect(result).toEqual(updatedRoleEntity);
      expect(mockRoleRepository.update).toHaveBeenCalled();
    });

    it('should throw NotFoundError if role to update is not found', async () => {
      (mockRoleRepository.findById as jest.Mock<Promise<RoleEntity | null>>).mockResolvedValue(
        null,
      );
      await expect(roleService.update(999, updateDto)).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should call repository delete when role found', async () => {
      mockRoleRepository.findById.mockResolvedValue(mockRole);
      mockRoleRepository.delete.mockResolvedValue(true);

      await roleService.delete(mockRoleId);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(mockRoleId);
      expect(mockRoleRepository.delete).toHaveBeenCalledWith(mockRoleId);
    });

    it('should throw NotFoundError when role to delete is not found', async () => {
      (mockRoleRepository.findById as jest.Mock<Promise<RoleEntity | null>>).mockResolvedValue(
        null,
      );
      await expect(roleService.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getPermissionsForRole', () => {
    it('should return permissions for a role after ensuring role exists', async () => {
      (mockRoleRepository.findById as jest.Mock<Promise<RoleEntity | null>>).mockResolvedValue(
        mockRole,
      ); // Role exists
      mockRoleRepository.getPermissionsForRole.mockResolvedValue([mockPermission]);

      const result = await roleService.getPermissionsForRole(mockRoleId);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(mockRoleId);
      expect(mockRoleRepository.getPermissionsForRole).toHaveBeenCalledWith(mockRoleId);
      // Expect result to be mapped to PermissionDto[]
      expect(result).toEqual([
        {
          id: mockPermission.id,
          name: mockPermission.name,
          createdAt: mockPermission.createdAt,
          updatedAt: mockPermission.updatedAt,
        },
      ]);
    });

    it('should throw NotFoundError if role does not exist', async () => {
      (mockRoleRepository.findById as jest.Mock<Promise<RoleEntity | null>>).mockResolvedValue(
        null,
      ); // Role does not exist
      await expect(roleService.getPermissionsForRole(mockRoleId)).rejects.toThrow(NotFoundError);
      expect(mockRoleRepository.getPermissionsForRole).not.toHaveBeenCalled();
    });
  });

  describe('assignPermissionToRole', () => {
    it('should assign permission if role and permission exist', async () => {
      (mockRoleRepository.findById as jest.Mock<Promise<RoleEntity | null>>).mockResolvedValue(
        mockRole,
      );
      (
        mockPermissionService.findById as jest.Mock<Promise<PermissionEntity | null>>
      ).mockResolvedValue(mockPermission as PermissionEntity);
      mockRoleRepository.assignPermission.mockResolvedValue(undefined);

      await roleService.assignPermissionToRole(mockRoleId, mockPermissionId);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(mockRoleId);
      expect(mockPermissionService.findById).toHaveBeenCalledWith(mockPermissionId);
      expect(mockRoleRepository.assignPermission).toHaveBeenCalledWith(
        mockRoleId,
        mockPermissionId,
      );
    });

    it('should throw NotFoundError if role does not exist', async () => {
      (mockRoleRepository.findById as jest.Mock<Promise<RoleEntity | null>>).mockResolvedValue(
        null,
      );
      await expect(
        roleService.assignPermissionToRole(mockRoleId, mockPermissionId),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if permission does not exist', async () => {
      (mockRoleRepository.findById as jest.Mock<Promise<RoleEntity | null>>).mockResolvedValue(
        mockRole,
      );
      (
        mockPermissionService.findById as jest.Mock<Promise<PermissionEntity | null>>
      ).mockRejectedValue(new NotFoundError('Permission not found'));
      await expect(
        roleService.assignPermissionToRole(mockRoleId, mockPermissionId),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('removePermissionFromRole', () => {
    it('should remove permission if role exists', async () => {
      (mockRoleRepository.findById as jest.Mock<Promise<RoleEntity | null>>).mockResolvedValue(
        mockRole,
      );
      mockRoleRepository.removePermission.mockResolvedValue(undefined);

      await roleService.removePermissionFromRole(mockRoleId, mockPermissionId);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(mockRoleId);
      expect(mockRoleRepository.removePermission).toHaveBeenCalledWith(
        mockRoleId,
        mockPermissionId,
      );
    });

    it('should throw NotFoundError if role does not exist for removal', async () => {
      (mockRoleRepository.findById as jest.Mock<Promise<RoleEntity | null>>).mockResolvedValue(
        null,
      );
      await expect(
        roleService.removePermissionFromRole(mockRoleId, mockPermissionId),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
