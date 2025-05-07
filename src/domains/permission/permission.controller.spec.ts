import 'reflect-metadata';
import { Container } from 'typedi';
import { PermissionsController } from '@domains/permission/permission.controller';
import { PermissionService } from '@domains/permission/permission.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionDto,
} from '@domains/permission/permission.dto';
import { NotFoundError, ConflictError } from '@shared/utils/error/error.util';
import { PermissionId, Permission } from '@domains/permission/permission.model';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import { faker } from '@faker-js/faker';

const createMockPermissionService = (): jest.Mocked<PermissionService> =>
  ({
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }) as unknown as jest.Mocked<PermissionService>;

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let mockService: jest.Mocked<PermissionService>;
  const mockId: PermissionId = faker.number.int({ min: 1, max: 100 });
  const mockPermissionEntity: Permission = {
    // Service returns Entity/Model type
    id: mockId,
    name: 'users:read',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
  // What the controller DTO output should look like
  const mockPermissionDto: PermissionDto = {
    id: mockId,
    name: 'users:read',
    createdAt: mockPermissionEntity.createdAt,
    updatedAt: mockPermissionEntity.updatedAt,
  };

  beforeEach(() => {
    Container.reset();
    const mockLogger = createMockLogger();
    mockService = createMockPermissionService();
    Container.set(LoggerService, mockLogger);
    Container.set(PermissionService, mockService);
    controller = Container.get(PermissionsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return DTOs', async () => {
      mockService.findAll.mockResolvedValue([mockPermissionEntity]);
      const result = await controller.getAll();
      expect(result).toEqual([mockPermissionDto]);
    });
  });

  describe('getById', () => {
    it('should return DTO if found', async () => {
      mockService.findById.mockResolvedValue(mockPermissionEntity);
      expect(await controller.getById(mockId)).toEqual(mockPermissionDto);
    });
    it('should propagate NotFoundError', async () => {
      mockService.findById.mockRejectedValue(new NotFoundError(''));
      await expect(controller.getById(mockId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    const dto: CreatePermissionDto = { name: 'posts:write' };
    const createdEntity: Permission = { ...mockPermissionEntity, id: mockId + 1, name: dto.name };
    const createdDto: PermissionDto = {
      id: createdEntity.id,
      name: createdEntity.name,
      createdAt: createdEntity.createdAt,
      updatedAt: createdEntity.updatedAt,
    };

    it('should return created DTO', async () => {
      mockService.create.mockResolvedValue(createdEntity);
      expect(await controller.create(dto)).toEqual(createdDto);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });
    it('should propagate ConflictError', async () => {
      mockService.create.mockRejectedValue(new ConflictError(''));
      await expect(controller.create(dto)).rejects.toThrow(ConflictError);
    });
  });

  describe('update', () => {
    const dto: UpdatePermissionDto = { name: 'posts:edit' };
    const updatedEntity: Permission = {
      ...mockPermissionEntity,
      name: dto.name!,
      updatedAt: new Date(),
    };
    const updatedDto: PermissionDto = {
      id: updatedEntity.id,
      name: updatedEntity.name,
      createdAt: updatedEntity.createdAt,
      updatedAt: updatedEntity.updatedAt,
    };

    it('should return updated DTO', async () => {
      mockService.update.mockResolvedValue(updatedEntity);
      expect(await controller.update(mockId, dto)).toEqual(updatedDto);
    });
    it('should propagate NotFoundError for update', async () => {
      mockService.update.mockRejectedValue(new NotFoundError(''));
      await expect(controller.update(mockId, dto)).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should call service delete', async () => {
      mockService.delete.mockResolvedValue(undefined);
      await controller.delete(mockId);
      expect(mockService.delete).toHaveBeenCalledWith(mockId);
    });
    it('should propagate NotFoundError for delete', async () => {
      mockService.delete.mockRejectedValue(new NotFoundError(''));
      await expect(controller.delete(mockId)).rejects.toThrow(NotFoundError);
    });
  });
});
