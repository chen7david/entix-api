import 'reflect-metadata';
import { Container } from 'typedi';
import { RolesController } from '@domains/role/role.controller';
import { RoleService } from '@domains/role/role.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionToRoleDto } from '@domains/role/role.dto';
import { PermissionDto } from '@domains/permission/permission.dto';
import { NotFoundError, ConflictError } from '@shared/utils/error/error.util';
import { RoleId, Role } from '@domains/role/role.model';
import { PermissionId } from '@domains/permission/permission.model';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import { faker } from '@faker-js/faker';

// Mock RoleService
const createMockRoleService = (): jest.Mocked<RoleService> =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getPermissionsForRole: jest.fn(),
    assignPermissionToRole: jest.fn(),
    removePermissionFromRole: jest.fn(),
  }) as unknown as jest.Mocked<RoleService>;

describe('RolesController', () => {
  let rolesController: RolesController;
  let mockRoleService: jest.Mocked<RoleService>;
  let mockLoggerService: jest.Mocked<LoggerService>;

  const mockRoleId: RoleId = faker.number.int({ min: 1, max: 1000 });
  const mockPermissionId: PermissionId = faker.number.int({ min: 1, max: 1000 });
  // This mock is for what the SERVICE returns (RoleEntity)
  const mockRoleEntityForService: Role = {
    // Role is RoleEntity
    id: mockRoleId,
    name: 'Administrator',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null, // RoleEntity includes deletedAt
  };
  const mockPermissionDto: PermissionDto = {
    id: mockPermissionId,
    name: 'test:permission',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    Container.reset();
    mockLoggerService = createMockLogger();
    mockRoleService = createMockRoleService();
    Container.set(LoggerService, mockLoggerService);
    Container.set(RoleService, mockRoleService);
    rolesController = Container.get(RolesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all roles (as DTOs)', async () => {
      const serviceResponse = [mockRoleEntityForService];
      mockRoleService.findAll.mockResolvedValue(serviceResponse);
      const result = await rolesController.getAll();
      // Controller transforms to DTO, so result should match DTO shape
      expect(result).toEqual([
        {
          id: mockRoleEntityForService.id,
          name: mockRoleEntityForService.name,
          createdAt: mockRoleEntityForService.createdAt,
          updatedAt: mockRoleEntityForService.updatedAt,
        },
      ]);
      expect(mockRoleService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('should return role by ID (as DTO)', async () => {
      mockRoleService.findById.mockResolvedValue(mockRoleEntityForService);
      const result = await rolesController.getById(mockRoleId);
      expect(result).toEqual({
        id: mockRoleEntityForService.id,
        name: mockRoleEntityForService.name,
        createdAt: mockRoleEntityForService.createdAt,
        updatedAt: mockRoleEntityForService.updatedAt,
      });
      expect(mockRoleService.findById).toHaveBeenCalledWith(mockRoleId);
    });

    it('should propagate NotFoundError from service', async () => {
      mockRoleService.findById.mockRejectedValue(new NotFoundError('Role not found'));
      await expect(rolesController.getById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    const createDto: CreateRoleDto = { name: 'NewRole' };
    const createdRoleEntityForService: Role = {
      // Service returns RoleEntity
      id: faker.number.int(),
      name: createDto.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should create and return a new role (as DTO)', async () => {
      mockRoleService.create.mockResolvedValue(createdRoleEntityForService);
      const result = await rolesController.create(createDto);
      expect(result).toEqual({
        id: createdRoleEntityForService.id,
        name: createdRoleEntityForService.name,
        createdAt: createdRoleEntityForService.createdAt,
        updatedAt: createdRoleEntityForService.updatedAt,
      });
      expect(mockRoleService.create).toHaveBeenCalledWith(createDto);
    });

    it('should propagate ConflictError from service if role name exists', async () => {
      mockRoleService.create.mockRejectedValue(new ConflictError('Role exists'));
      await expect(rolesController.create(createDto)).rejects.toThrow(ConflictError);
    });
  });

  describe('update', () => {
    const updateDto: UpdateRoleDto = { name: 'UpdatedRoleName' };
    const updatedRoleEntityForService: Role = {
      // Service returns RoleEntity
      id: mockRoleId,
      name: updateDto.name!,
      createdAt: mockRoleEntityForService.createdAt,
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should update and return role (as DTO)', async () => {
      mockRoleService.update.mockResolvedValue(updatedRoleEntityForService);
      const result = await rolesController.update(mockRoleId, updateDto);
      expect(result).toEqual({
        id: updatedRoleEntityForService.id,
        name: updatedRoleEntityForService.name,
        createdAt: updatedRoleEntityForService.createdAt,
        updatedAt: updatedRoleEntityForService.updatedAt,
      });
      expect(mockRoleService.update).toHaveBeenCalledWith(mockRoleId, updateDto);
    });

    it('should propagate NotFoundError from service for update', async () => {
      mockRoleService.update.mockRejectedValue(new NotFoundError('Role not found'));
      await expect(rolesController.update(999, updateDto)).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should call service delete and return void (204 status implicitly handled by @OnUndefined)', async () => {
      mockRoleService.delete.mockResolvedValue(undefined);
      await rolesController.delete(mockRoleId);
      expect(mockRoleService.delete).toHaveBeenCalledWith(mockRoleId);
    });

    it('should propagate NotFoundError from service for delete', async () => {
      mockRoleService.delete.mockRejectedValue(new NotFoundError('Role not found'));
      await expect(rolesController.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getPermissionsForRole', () => {
    it('should return permissions for a role', async () => {
      mockRoleService.getPermissionsForRole.mockResolvedValue([mockPermissionDto]);
      const result = await rolesController.getPermissionsForRole(mockRoleId);
      expect(result).toEqual([mockPermissionDto]);
      expect(mockRoleService.getPermissionsForRole).toHaveBeenCalledWith(mockRoleId);
    });

    it('should propagate NotFoundError from service', async () => {
      mockRoleService.getPermissionsForRole.mockRejectedValue(new NotFoundError('Role not found'));
      await expect(rolesController.getPermissionsForRole(mockRoleId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('assignPermission', () => {
    const assignDto: AssignPermissionToRoleDto = { permissionId: mockPermissionId };
    it('should call service assignPermissionToRole and return void (204)', async () => {
      mockRoleService.assignPermissionToRole.mockResolvedValue(undefined);
      await rolesController.assignPermission(mockRoleId, assignDto);
      expect(mockRoleService.assignPermissionToRole).toHaveBeenCalledWith(
        mockRoleId,
        mockPermissionId,
      );
    });

    it('should propagate errors from service (e.g., NotFoundError)', async () => {
      mockRoleService.assignPermissionToRole.mockRejectedValue(
        new NotFoundError('Role or Permission not found'),
      );
      await expect(rolesController.assignPermission(mockRoleId, assignDto)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('removePermission', () => {
    it('should call service removePermissionFromRole and return void (204)', async () => {
      mockRoleService.removePermissionFromRole.mockResolvedValue(undefined);
      await rolesController.removePermission(mockRoleId, mockPermissionId);
      expect(mockRoleService.removePermissionFromRole).toHaveBeenCalledWith(
        mockRoleId,
        mockPermissionId,
      );
    });

    it('should propagate NotFoundError from service', async () => {
      mockRoleService.removePermissionFromRole.mockRejectedValue(
        new NotFoundError('Role not found'),
      );
      await expect(rolesController.removePermission(mockRoleId, mockPermissionId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
