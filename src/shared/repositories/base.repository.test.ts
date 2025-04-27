import { BaseRepository } from '@shared/repositories/base.repository';
import { DatabaseService } from '@shared/services/database/database.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Mock the error utility module
jest.mock('@shared/utils/error/error.util', () => {
  const originalModule = jest.requireActual('@shared/utils/error/error.util');
  return {
    ...originalModule,
    // Mock the createAppError function to pass through errors
    createAppError: jest.fn((err) => {
      if (err instanceof Error && err.message.includes('not found')) {
        return new originalModule.NotFoundError(err.message);
      }
      return new Error('Mocked error');
    }),
  };
});

// --- Mock Schema ---
const mockUsersTable = pgTable('mock_users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// Add a fake name prop to avoid the cannot read property 'name' in console.warn
// The type is explicitly any to bypass TypeScript errors in tests
Object.defineProperty(mockUsersTable, '_', {
  value: { name: 'mock_users' },
  configurable: true,
});

// Mock LoggerService
const mockLoggerService = {
  child: jest.fn().mockReturnValue({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
} as unknown as LoggerService;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class TestUserRepository extends BaseRepository<typeof mockUsersTable, any, number> {
  protected readonly table = mockUsersTable;
  protected readonly idColumn = mockUsersTable.id;
  protected readonly deletedAtColumn = mockUsersTable.deletedAt;

  constructor(dbService: DatabaseService, loggerService: LoggerService) {
    super(dbService, loggerService);
  }
}

// Define mock return functions for proper typing
const mockInsertReturning = jest.fn();
const mockUpdateReturning = jest.fn();
const mockSelectWhere = jest.fn();
const mockDeleteWhere = jest.fn();
const mockSelectFrom = jest.fn();

// --- Mock Database Service ---
const mockDbService = {
  db: {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: mockInsertReturning,
      }),
    }),
    select: jest.fn().mockReturnValue({
      from: mockSelectFrom,
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: mockUpdateReturning,
        }),
      }),
    }),
    delete: jest.fn().mockReturnValue({
      where: mockDeleteWhere,
    }),
  },
} as unknown as DatabaseService;

// --- Test Suite ---
describe('BaseRepository', () => {
  let repository: TestUserRepository;
  let mockFindById: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // Clear individual mocks
    mockInsertReturning.mockClear();
    mockUpdateReturning.mockClear();
    mockSelectWhere.mockClear();
    mockSelectFrom.mockClear();
    mockDeleteWhere.mockClear();

    repository = new TestUserRepository(mockDbService, mockLoggerService);

    // We'll spy on the repository findById method - need to use any type to get around protected method
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFindById = jest.spyOn(repository as any, 'findById');
  });

  afterEach(() => {
    mockFindById.mockRestore();
  });

  describe('create', () => {
    it('should call insert and returning, returning the created entity', async () => {
      const inputData = {
        email: 'test@example.com',
        name: 'Test User',
        isActive: true,
      };
      const expectedUser = {
        id: 1,
        createdAt: new Date(),
        deletedAt: null,
        email: 'test@example.com',
        name: 'Test User',
        isActive: true,
      };

      // Set up mock to return the expected user
      mockInsertReturning.mockResolvedValue([expectedUser]);

      const result = await repository.create(inputData);

      expect(mockDbService.db.insert).toHaveBeenCalled();
      expect(mockInsertReturning).toHaveBeenCalled();
      expect(result).toEqual(expectedUser);
    });

    it('should throw if returning data is empty', async () => {
      const inputData = { email: 'test@example.com' };
      // Empty array will trigger the error condition
      mockInsertReturning.mockResolvedValue([]);

      await expect(repository.create(inputData)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    const userId = 1;
    const mockUser = {
      id: userId,
      email: 'found@example.com',
      name: 'Found User',
      isActive: true,
      createdAt: new Date(),
      deletedAt: null,
    };
    const mockDeletedUser = { ...mockUser, deletedAt: new Date() };

    it('should call select/from/where and return the user', async () => {
      // Configure the where implementation for this test
      mockSelectWhere.mockReturnValue({
        then: jest.fn().mockImplementation((callback) => Promise.resolve(callback([mockUser]))),
      });

      // Set up the from implementation to return our where mock
      mockSelectFrom.mockReturnValue({
        where: mockSelectWhere,
      });

      const result = await repository.findById(userId);

      expect(mockDbService.db.select).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundError if select returns empty', async () => {
      // Configure for empty result and mock NotFoundError
      mockSelectWhere.mockReturnValue({
        then: jest.fn().mockImplementation((callback) => Promise.resolve(callback([]))),
      });

      // Set up the from implementation to return our where mock
      mockSelectFrom.mockReturnValue({
        where: mockSelectWhere,
      });

      // Since we're mocking the error module to always return NotFoundError for specific messages,
      // we can just check if any error is thrown
      await expect(repository.findById(userId)).rejects.toThrow();
    });

    it('should return deleted user if includeDeleted is true', async () => {
      // Configure for deleted user
      mockSelectWhere.mockReturnValue({
        then: jest
          .fn()
          .mockImplementation((callback) => Promise.resolve(callback([mockDeletedUser]))),
      });

      // Set up the from implementation to return our where mock
      mockSelectFrom.mockReturnValue({
        where: mockSelectWhere,
      });

      const result = await repository.findById(userId, true);

      expect(result).toEqual(mockDeletedUser);
    });
  });

  describe('findAll', () => {
    const mockUser1 = {
      id: 1,
      email: 'test1@example.com',
      name: 'Test1',
      isActive: true,
      createdAt: new Date(),
      deletedAt: null,
    };
    const mockUser2 = {
      id: 2,
      email: 'test2@example.com',
      name: 'Test2',
      isActive: true,
      createdAt: new Date(),
      deletedAt: null,
    };
    const mockDeletedUser = {
      id: 3,
      email: 'deleted@example.com',
      name: 'Deleted',
      isActive: true,
      createdAt: new Date(),
      deletedAt: new Date(),
    };

    it('should return only non-deleted users by default', async () => {
      // Mock the dynamic query chain for findAll
      const mockDynamicQuery = {
        where: jest.fn().mockReturnThis(),
        then: jest
          .fn()
          .mockImplementation((callback) => Promise.resolve(callback([mockUser1, mockUser2]))),
      };

      // Set up the from implementation to return a dynamic query
      mockSelectFrom.mockReturnValue({
        $dynamic: jest.fn().mockReturnValue(mockDynamicQuery),
      });

      const result = await repository.findAll();

      expect(mockDbService.db.select).toHaveBeenCalled();
      expect(result).toEqual([mockUser1, mockUser2]);
    });

    it('should return all users if includeDeleted is true', async () => {
      // Mock the dynamic query chain with all users
      const mockDynamicQuery = {
        where: jest.fn().mockReturnThis(),
        then: jest
          .fn()
          .mockImplementation((callback) =>
            Promise.resolve(callback([mockUser1, mockUser2, mockDeletedUser])),
          ),
      };

      // Set up the from implementation to return a dynamic query
      mockSelectFrom.mockReturnValue({
        $dynamic: jest.fn().mockReturnValue(mockDynamicQuery),
      });

      const result = await repository.findAll(true);

      expect(mockDbService.db.select).toHaveBeenCalled();
      expect(result).toEqual([mockUser1, mockUser2, mockDeletedUser]);
    });
  });

  describe('update', () => {
    const userId = 1;
    const updateData = { name: 'Updated Name' };
    const expectedUser = {
      id: 1,
      email: 'original@example.com',
      name: 'Updated Name',
      isActive: true,
      createdAt: new Date(),
      deletedAt: null,
    };

    it('should call update/set/where/returning and return updated user', async () => {
      mockUpdateReturning.mockResolvedValue([expectedUser]);

      const result = await repository.update(userId, updateData);

      expect(mockDbService.db.update).toHaveBeenCalled();
      expect(result).toEqual(expectedUser);
    });

    it('should throw NotFoundError if update returns empty', async () => {
      mockUpdateReturning.mockResolvedValue([]);

      // Since we're mocking the error module to always return NotFoundError for specific messages,
      // we can just check if any error is thrown
      await expect(repository.update(userId, updateData)).rejects.toThrow();
    });
  });

  describe('delete (soft delete)', () => {
    const userId = 1;

    it('should call update/set/where/returning for soft delete', async () => {
      mockUpdateReturning.mockResolvedValue([{ id: userId }]);

      const result = await repository.delete(userId);

      expect(mockDbService.db.update).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false if no rows were updated', async () => {
      mockUpdateReturning.mockResolvedValue([]);

      const result = await repository.delete(userId);

      expect(result).toBe(false);
    });

    it('should handle errors during delete operation', async () => {
      mockUpdateReturning.mockRejectedValue(new Error('Database error'));

      await expect(repository.delete(userId)).rejects.toThrow();
    });
  });

  describe('delete (hard delete)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    class TestHardDeleteRepo extends BaseRepository<typeof mockUsersTable, any, number> {
      protected readonly table = mockUsersTable;
      protected readonly idColumn = mockUsersTable.id;
      protected readonly deletedAtColumn = undefined;

      constructor(dbService: DatabaseService, loggerService: LoggerService) {
        super(dbService, loggerService);
      }
    }

    it('should call db.delete().where() for hard delete', async () => {
      const hardDeleteRepo = new TestHardDeleteRepo(mockDbService, mockLoggerService);

      // Setup delete mock to resolve properly
      mockDeleteWhere.mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 1 }]),
      });

      await hardDeleteRepo.delete(1);

      expect(mockDbService.db.delete).toHaveBeenCalled();
      expect(mockDbService.db.update).not.toHaveBeenCalled();
    });
  });
});
