import 'reflect-metadata';
import { PermissionService } from '@domains/permission/permission.service';
import type { PermissionRepository } from '@domains/permission/permission.repository';
import type { LoggerService } from '@shared/services/logger/logger.service';
import { CreatePermissionDto, UpdatePermissionDto } from '@domains/permission/permission.dto';
import { NotFoundError, ConflictError } from '@shared/utils/error/error.util';
import type { PermissionId, PermissionUpdatePayload } from '@domains/permission/permission.model';
import { PermissionEntity, CreatePermissionEntity } from '@domains/permission/permission.schema';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import { faker } from '@faker-js/faker';

const createMockPermissionRepository = (): jest.Mocked<PermissionRepository> =>
  ({
    findAll: jest.fn<Promise<PermissionEntity[]>, []>(),
    findById: jest.fn<Promise<PermissionEntity | null>, [PermissionId]>(),
    findByName: jest.fn<Promise<PermissionEntity | null>, [string]>(),
    create: jest.fn<Promise<PermissionEntity>, [CreatePermissionEntity]>(),
    update: jest.fn<
      Promise<PermissionEntity>,
      [PermissionId, PermissionUpdatePayload | Partial<PermissionEntity>]
    >(),
    delete: jest.fn<Promise<boolean>, [PermissionId]>(),
  }) as unknown as jest.Mocked<PermissionRepository>;

describe('PermissionService', () => {
  let service: PermissionService;
  let mockRepo: jest.Mocked<PermissionRepository>;
  let mockLogger: jest.Mocked<LoggerService>;

  const mockId: PermissionId = faker.number.int({ min: 1, max: 100 });
  const mockEntity: PermissionEntity = {
    id: mockId,
    name: 'users:read',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    mockLogger = createMockLogger();
    mockRepo = createMockPermissionRepository();
    service = new PermissionService(mockLogger, mockRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      mockRepo.findAll.mockResolvedValue([mockEntity]);
      expect(await service.findAll()).toEqual([mockEntity]);
    });
  });

  describe('findById', () => {
    it('should return permission if found', async () => {
      mockRepo.findById.mockResolvedValue(mockEntity);
      expect(await service.findById(mockId)).toEqual(mockEntity);
    });
    it('should throw NotFoundError if not found', async () => {
      (mockRepo.findById as jest.Mock<Promise<PermissionEntity | null>>).mockResolvedValue(null);
      await expect(service.findById(mockId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    const dto: CreatePermissionDto = { name: 'posts:create' };
    const entityToCreate: CreatePermissionEntity = { name: dto.name };
    const createdEntity: PermissionEntity = {
      ...entityToCreate,
      id: mockId + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should create if name unique', async () => {
      mockRepo.findByName.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(createdEntity);
      expect(await service.create(dto)).toEqual(createdEntity);
      expect(mockRepo.create).toHaveBeenCalledWith(entityToCreate);
    });
    it('should throw ConflictError if name exists', async () => {
      mockRepo.findByName.mockResolvedValue(mockEntity);
      await expect(service.create(dto)).rejects.toThrow(ConflictError);
    });
  });

  describe('update', () => {
    const dto: UpdatePermissionDto = { name: 'posts:update' };
    const updatedEntity: PermissionEntity = {
      ...mockEntity,
      name: dto.name!,
      updatedAt: new Date(),
    };

    it('should update if found and name unique/unchanged', async () => {
      mockRepo.findById.mockResolvedValue(mockEntity);
      mockRepo.findByName.mockResolvedValue(null); // New name is unique
      mockRepo.update.mockResolvedValue(updatedEntity);
      expect(await service.update(mockId, dto)).toEqual(updatedEntity);
    });
    it('should throw NotFoundError if not found for update', async () => {
      (mockRepo.findById as jest.Mock<Promise<PermissionEntity | null>>).mockResolvedValue(null);
      await expect(service.update(mockId, dto)).rejects.toThrow(NotFoundError);
    });
    it('should throw ConflictError if new name conflicts', async () => {
      mockRepo.findById.mockResolvedValue(mockEntity);
      const conflictingEntity: PermissionEntity = {
        ...mockEntity,
        id: mockId + 1,
        name: dto.name!,
      };
      mockRepo.findByName.mockResolvedValue(conflictingEntity);
      await expect(service.update(mockId, dto)).rejects.toThrow(ConflictError);
    });
  });

  describe('delete', () => {
    it('should delete if found', async () => {
      mockRepo.findById.mockResolvedValue(mockEntity);
      mockRepo.delete.mockResolvedValue(true);
      await service.delete(mockId);
      expect(mockRepo.delete).toHaveBeenCalledWith(mockId);
    });
    it('should throw NotFoundError if not found for delete', async () => {
      (mockRepo.findById as jest.Mock<Promise<PermissionEntity | null>>).mockResolvedValue(null);
      await expect(service.delete(mockId)).rejects.toThrow(NotFoundError);
    });
  });
});
