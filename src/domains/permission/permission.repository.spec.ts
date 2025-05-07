import 'reflect-metadata';
import { Container } from 'typedi';
import { PermissionRepository } from '@domains/permission/permission.repository';
import { DatabaseService } from '@shared/services/database/database.service';
import {
  permissionsTable,
  PermissionEntity,
  CreatePermissionEntity,
} from '@domains/permission/permission.schema';
import { faker } from '@faker-js/faker';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import { eq, and, isNull } from 'drizzle-orm';

describe('PermissionRepository', () => {
  let permissionRepository: PermissionRepository;
  let mockDbService: DatabaseService;
  let mockDb: Record<string, jest.Mock>;
  const mockLoggerInstance = createMockLogger();

  const mockPermissionEntity: PermissionEntity = {
    id: faker.number.int({ min: 1, max: 1000 }),
    name: 'users:read',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    Container.reset();
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([mockPermissionEntity]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };
    mockDbService = { db: mockDb as any } as DatabaseService;
    Container.set(DatabaseService, mockDbService);
    permissionRepository = new PermissionRepository(mockDbService, mockLoggerInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should set table, idColumn, and deletedAtColumn correctly', () => {
      expect((permissionRepository as any).table).toBe(permissionsTable);
      expect((permissionRepository as any).idColumn).toBe(permissionsTable.id);
      expect((permissionRepository as any).deletedAtColumn).toBe(permissionsTable.deletedAt);
    });
  });

  describe('findByName', () => {
    it('should return permission by name when found and not soft-deleted', async () => {
      const permissionName = 'posts:create';
      const expectedPermission: PermissionEntity = {
        ...mockPermissionEntity,
        name: permissionName,
        id: faker.number.int(),
      };
      mockDb.limit.mockResolvedValueOnce([expectedPermission]);

      const result = await permissionRepository.findByName(permissionName);

      expect(mockDb.from).toHaveBeenCalledWith(permissionsTable);
      expect(mockDb.where).toHaveBeenCalledWith(
        and(eq(permissionsTable.name, permissionName), isNull(permissionsTable.deletedAt)),
      );
      expect(result).toEqual(expectedPermission);
    });

    it('should return null when permission by name not found', async () => {
      mockDb.limit.mockResolvedValueOnce([]);
      const result = await permissionRepository.findByName('nonexistent:action');
      expect(result).toBeNull();
    });
  });

  describe('create (inherited)', () => {
    it('should call db.insert with correct data', async () => {
      const createData: CreatePermissionEntity = { name: 'articles:delete' };
      const returnedPermission: PermissionEntity = {
        id: faker.number.int(),
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockDb.returning.mockResolvedValueOnce([returnedPermission]);

      const result = await permissionRepository.create(createData);

      expect(mockDb.insert).toHaveBeenCalledWith(permissionsTable);
      expect(mockDb.values).toHaveBeenCalledWith(createData);
      expect(result).toEqual(returnedPermission);
    });
  });
});
