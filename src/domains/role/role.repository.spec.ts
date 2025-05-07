import 'reflect-metadata';
import { Container } from 'typedi';
import { RoleRepository } from '@domains/role/role.repository';
import { DatabaseService } from '@shared/services/database/database.service';
import { rolesTable, RoleEntity, CreateRoleEntity } from '@domains/role/role.schema';
import { faker } from '@faker-js/faker';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import { eq, and, isNull } from 'drizzle-orm';

describe('RoleRepository', () => {
  let roleRepository: RoleRepository;
  let mockDbService: DatabaseService;
  let mockDb: Record<string, jest.Mock>; // For Drizzle query builder chain
  const mockLoggerInstance = createMockLogger();

  const mockRoleId = faker.number.int({ min: 1, max: 1000 });
  const mockRoleEntity: RoleEntity = {
    id: mockRoleId,
    name: 'Administrator',
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
      limit: jest.fn().mockResolvedValue([mockRoleEntity]), // For findByName success
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn(), // For create/update
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(), // For Drizzle delete method
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockDbService = { db: mockDb as any } as DatabaseService;
    Container.set(DatabaseService, mockDbService);

    roleRepository = new RoleRepository(mockDbService, mockLoggerInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should set table, idColumn, and deletedAtColumn correctly', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((roleRepository as any).table).toBe(rolesTable);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((roleRepository as any).idColumn).toBe(rolesTable.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((roleRepository as any).deletedAtColumn).toBe(rolesTable.deletedAt);
    });
  });

  describe('findByName', () => {
    it('should return role by name when found and not soft-deleted', async () => {
      const roleName = 'TestRole';
      const expectedRole: RoleEntity = {
        ...mockRoleEntity,
        name: roleName,
        id: faker.number.int(),
      };
      mockDb.limit.mockResolvedValueOnce([expectedRole]); // Ensure this mock is specific

      const result = await roleRepository.findByName(roleName);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(rolesTable);
      expect(mockDb.where).toHaveBeenCalledWith(
        and(eq(rolesTable.name, roleName), isNull(rolesTable.deletedAt)),
      );
      expect(mockDb.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedRole);
    });

    it('should return null when role by name not found', async () => {
      const roleName = 'NonExistentRole';
      mockDb.limit.mockResolvedValueOnce([]); // Simulate not found

      const result = await roleRepository.findByName(roleName);

      expect(result).toBeNull();
      expect(mockDb.where).toHaveBeenCalledWith(
        and(eq(rolesTable.name, roleName), isNull(rolesTable.deletedAt)),
      );
    });
  });

  // Tests for inherited CRUD methods (create, findById, findAll, update, delete)
  // These would be similar to user.repository.spec.ts, ensuring correct interaction
  // with BaseRepository logic or direct db calls if BaseRepository is very thin.
  // For brevity, only showing create as an example of how BaseRepository might be tested via concrete repo.

  describe('create (inherited via BaseRepository)', () => {
    it('should call db.insert with correct table and values, then returning', async () => {
      const createData: CreateRoleEntity = { name: 'NewRoleFromTest' };
      const returnedRole: RoleEntity = {
        id: faker.number.int(),
        name: createData.name,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockDb.returning.mockResolvedValueOnce([returnedRole]);

      const result = await roleRepository.create(createData);

      expect(mockDb.insert).toHaveBeenCalledWith(rolesTable);
      expect(mockDb.values).toHaveBeenCalledWith(createData);
      expect(mockDb.returning).toHaveBeenCalled();
      expect(result).toEqual(returnedRole);
    });

    it('should throw if db.returning is empty for create', async () => {
      const createData: CreateRoleEntity = { name: 'NewRoleFail' };
      mockDb.returning.mockResolvedValueOnce([]);
      await expect(roleRepository.create(createData)).rejects.toThrow(
        'An unexpected error occurred',
      );
    });
  });

  // Add similar tests for findById, findAll (with soft delete checks), update, and delete (soft delete)
  // ensuring BaseRepository logic is correctly applied for roles.
});
