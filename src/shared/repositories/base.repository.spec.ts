import { BaseRepository } from '@shared/repositories/base.repository';
import { NotFoundError } from '@shared/utils/error/error.util';
import { createMockLogger } from '@tests/mocks/logger.service.mock';
import type { DatabaseService } from '@shared/services/database/database.service';
import type { LoggerService } from '@shared/services/logger/logger.service';
import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// Mock the error utility module
// jest.mock('@shared/utils/error/error.util', () => {
//   const originalModule = jest.requireActual('@shared/utils/error/error.util');
//   return {
//     ...originalModule,
//     createAppError: jest.fn((err) => {
//       if (err instanceof Error && err.message.includes('not found')) {
//         return new originalModule.NotFoundError(err.message);
//       }
//       return new Error('Mocked error');
//     }),
//   };
// });

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

// Use the full mock logger
const mockLogger = createMockLogger();

// --- Test User Repository Class ---
// Define a type for the mock user structure
type MockUser = typeof mockUsersTable.$inferSelect;

// Use the MockUser type in the generic parameter
class TestUserRepository extends BaseRepository<typeof mockUsersTable, MockUser, number> {
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
const mockSelectFrom = jest.fn();
const mockDeleteWhere = jest.fn();

// --- Inline Mock Database Service ---
const mockDbService = {
  db: {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({ returning: mockInsertReturning }),
    }),
    select: jest.fn().mockReturnValue({ from: mockSelectFrom }),
    update: jest.fn().mockReturnValue({
      set: jest
        .fn()
        .mockReturnValue({ where: jest.fn().mockReturnValue({ returning: mockUpdateReturning }) }),
    }),
    delete: jest.fn().mockReturnValue({ where: mockDeleteWhere }),
  },
} as unknown as DatabaseService;

// --- Test Suite ---
describe('BaseRepository', () => {
  let repository: TestUserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockInsertReturning.mockClear();
    mockUpdateReturning.mockClear();
    mockSelectWhere.mockClear();
    mockSelectFrom.mockClear();
    mockDeleteWhere.mockClear();

    // Reset main db method mocks (fix formatting)
    (mockDbService.db.insert as jest.Mock)
      .mockClear()
      .mockReturnValue({ values: jest.fn().mockReturnValue({ returning: mockInsertReturning }) });
    (mockDbService.db.select as jest.Mock).mockClear().mockReturnValue({ from: mockSelectFrom });
    (mockDbService.db.update as jest.Mock).mockClear().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({ returning: mockUpdateReturning }),
      }),
    });
    (mockDbService.db.delete as jest.Mock).mockClear().mockReturnValue({ where: mockDeleteWhere });

    repository = new TestUserRepository(mockDbService, mockLogger);
  });

  describe('create', () => {
    it('should call insert and returning, returning the created entity', async () => {
      const inputData = { email: 'test@example.com', name: 'Test User', isActive: true };
      const expectedUser = {
        id: 1,
        createdAt: expect.any(Date),
        deletedAt: null,
        email: 'test@example.com',
        name: 'Test User',
        isActive: true,
      };
      mockInsertReturning.mockResolvedValue([expectedUser]);

      const result = await repository.create(inputData);

      expect(mockDbService.db.insert).toHaveBeenCalledWith(mockUsersTable);
      expect(mockInsertReturning).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedUser);
    });

    it('should throw if returning data is empty', async () => {
      const inputData = { email: 'test@example.com' };
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
      createdAt: expect.any(Date),
      deletedAt: null,
    };
    const mockDeletedUser = { ...mockUser, deletedAt: new Date() };

    beforeEach(() => {
      // Reset select chain for findById tests
      mockSelectFrom.mockReturnValue({ where: mockSelectWhere });
    });

    it('should call select/from/where and return the user', async () => {
      mockSelectWhere.mockResolvedValue([mockUser]); // Mock final result of the chain
      const result = await repository.findById(userId);
      expect(mockDbService.db.select).toHaveBeenCalled();
      expect(mockSelectFrom).toHaveBeenCalledWith(mockUsersTable);
      expect(mockSelectWhere).toHaveBeenCalled(); // Check if where was called
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundError if select returns empty', async () => {
      mockSelectWhere.mockResolvedValue([]);
      await expect(repository.findById(userId)).rejects.toThrow(NotFoundError);
    });

    it('should return deleted user if includeDeleted is true', async () => {
      mockSelectWhere.mockResolvedValue([mockDeletedUser]);
      const result = await repository.findById(userId, true);
      expect(result).toEqual(mockDeletedUser);
      // Check where clause difference if possible/needed
      expect(mockSelectWhere).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const mockUser1 = {
      id: 1,
      email: 'u1@x.com',
      name: 'U1',
      isActive: true,
      createdAt: expect.any(Date),
      deletedAt: null,
    };
    const mockUser2 = {
      id: 2,
      email: 'u2@x.com',
      name: 'U2',
      isActive: false,
      createdAt: expect.any(Date),
      deletedAt: null,
    };
    const mockDeletedUser = {
      id: 3,
      email: 'u3@x.com',
      name: 'U3',
      isActive: true,
      createdAt: expect.any(Date),
      deletedAt: new Date(),
    };

    it('should return only non-deleted users by default', async () => {
      const mockQueryResult = [mockUser1, mockUser2];
      // Simplify mock: Mock the final promise resolution directly
      const mockWhere = jest.fn().mockReturnThis(); // .where() should return the chainable object
      const mockFrom = jest.fn().mockReturnThis(); // .from() should return the chainable object
      const mockSelectPromise = Promise.resolve(mockQueryResult);
      const mockSelect = jest.fn().mockReturnValue({
        // The object returned by db.select()
        from: mockFrom,
        where: mockWhere,
        // Make the object itself thenable (awaitable)
        then: (resolve: (value: MockUser[]) => void, reject: (reason?: unknown) => void) =>
          mockSelectPromise.then(resolve, reject),
        catch: (reject: (reason?: unknown) => void) => mockSelectPromise.catch(reject),
      });
      (mockDbService.db.select as jest.Mock) = mockSelect;

      const result = await repository.findAll();

      expect(result).toEqual(mockQueryResult);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(mockUsersTable);
      expect(mockWhere).toHaveBeenCalled(); // Check where was called
    });

    it('should return all users if includeDeleted is true', async () => {
      const mockQueryResult = [mockUser1, mockUser2, mockDeletedUser];
      // Simplify mock for this case too
      const mockFrom = jest.fn().mockReturnThis(); // .from() returns chainable
      const mockSelectPromise = Promise.resolve(mockQueryResult);
      const mockSelect = jest.fn().mockReturnValue({
        // The object returned by db.select()
        from: mockFrom,
        // No where method needed/called in this path
        then: (resolve: (value: MockUser[]) => void, reject: (reason?: unknown) => void) =>
          mockSelectPromise.then(resolve, reject),
        catch: (reject: (reason?: unknown) => void) => mockSelectPromise.catch(reject),
      });
      (mockDbService.db.select as jest.Mock) = mockSelect;

      const result = await repository.findAll(true);

      expect(result).toEqual(mockQueryResult);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(mockUsersTable);
      // No where clause expected when includeDeleted is true
    });
  });

  describe('update', () => {
    const userId = 1;
    const updateData = { name: 'Updated Name' };
    const expectedUser = {
      id: userId,
      email: 'test@example.com',
      name: 'Updated Name',
      isActive: true,
      createdAt: expect.any(Date),
      deletedAt: null,
    };

    it('should call update/set/where/returning and return updated user', async () => {
      mockUpdateReturning.mockResolvedValue([expectedUser]);
      // mockFindById.mockResolvedValue({ id: userId }); // No findById call in update

      const result = await repository.update(userId, updateData);

      // expect(mockFindById).toHaveBeenCalledWith(userId); // No findById call
      expect(mockDbService.db.update).toHaveBeenCalledWith(mockUsersTable);
      // Check the specific call to the mock function used by update
      expect(
        mockDbService.db.update(mockUsersTable).set(updateData).where(expect.anything()).returning,
      ).toHaveBeenCalled();
      expect(result).toEqual(expectedUser);
    });

    it('should throw NotFoundError if update returns empty', async () => {
      mockUpdateReturning.mockResolvedValue([]);
      // mockFindById.mockResolvedValue({ id: userId }); // No findById call
      await expect(repository.update(userId, updateData)).rejects.toThrow(NotFoundError);
      // Ensure update was actually called
      expect(
        mockDbService.db.update(mockUsersTable).set(updateData).where(expect.anything()).returning,
      ).toHaveBeenCalled();
    });

    // This test is no longer valid as update doesn't call findById first.
    // A failure scenario is covered by the 'update returns empty' test.
    // eslint-disable-next-line jest/no-commented-out-tests
    // Original commented out test/code around line 288 was here
  });

  describe('delete (soft delete)', () => {
    const userId = 1;
    const expectedUser = {
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      isActive: true,
      createdAt: expect.any(Date),
      deletedAt: expect.any(Date),
    };

    it('should call update/set/where/returning for soft delete', async () => {
      // Soft delete calls update internally, so mock update's returning value
      mockUpdateReturning.mockResolvedValue([expectedUser]);
      // mockFindById.mockResolvedValue({ id: userId, deletedAt: null }); // Not called directly by delete

      const result = await repository.delete(userId);

      // expect(mockFindById).toHaveBeenCalledWith(userId); // Not called directly by delete
      // Check that update was called (by the delete method)
      expect(mockDbService.db.update).toHaveBeenCalledWith(mockUsersTable);
      // Check the specific call chain for the soft delete update
      expect(
        mockDbService.db
          .update(mockUsersTable)
          .set(expect.objectContaining({ deletedAt: expect.any(Date) }))
          .where(expect.anything()).returning,
      ).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw NotFoundError if the internal update returns empty', async () => {
      mockUpdateReturning.mockResolvedValue([]); // Simulate update affecting 0 rows
      // mockFindById.mockResolvedValue({ id: userId, deletedAt: null }); // Not called directly

      // Expect delete to throw NotFoundError because the internal update failed
      await expect(repository.delete(userId)).rejects.toThrow(NotFoundError);
      expect(
        mockDbService.db
          .update(mockUsersTable)
          .set(expect.objectContaining({ deletedAt: expect.any(Date) }))
          .where(expect.anything()).returning,
      ).toHaveBeenCalled();
    });

    it('should propagate errors from the internal update operation', async () => {
      const error = new Error('DB update failed during soft delete');
      mockUpdateReturning.mockRejectedValue(error); // Simulate error in update
      // mockFindById.mockResolvedValue({ id: userId, deletedAt: null }); // Not called directly

      // Expect the error wrapped by createAppError (likely InternalError)
      await expect(repository.delete(userId)).rejects.toThrow('An unexpected error occurred');
      // await expect(repository.delete(userId)).rejects.toThrow(error.message); // Check message as it might be wrapped
      expect(
        mockDbService.db
          .update(mockUsersTable)
          .set(expect.objectContaining({ deletedAt: expect.any(Date) }))
          .where(expect.anything()).returning,
      ).toHaveBeenCalled();
    });

    // This scenario is covered by 'should throw NotFoundError if the internal update returns empty'
    // eslint-disable-next-line jest/no-commented-out-tests
    // Original commented out test/code around line 357 was here
  });

  describe('delete (hard delete)', () => {
    it('should call db.delete().where() for hard delete', async () => {
      // Use MockUser type here as well
      class TestHardDeleteRepo extends BaseRepository<typeof mockUsersTable, MockUser, number> {
        protected readonly table = mockUsersTable;
        protected readonly idColumn = mockUsersTable.id;
        protected readonly deletedAtColumn = undefined;
        constructor(dbService: DatabaseService, loggerService: LoggerService) {
          super(dbService, loggerService);
        }
      }
      const currentMockLoggerHard = createMockLogger();
      // Use the inline mockDbService for this specific repo instance
      const hardDeleteRepo = new TestHardDeleteRepo(mockDbService, currentMockLoggerHard);
      const userId = 5;

      // Mock the execute() call directly on the mockDeleteWhere function
      // Hard delete no longer returns an array, just needs a non-nullish result for success
      mockDeleteWhere.mockResolvedValue({ affectedRows: 1 }); // Simulate successful delete

      const result = await hardDeleteRepo.delete(userId);

      expect(mockDbService.db.delete).toHaveBeenCalledWith(mockUsersTable);
      expect(mockDeleteWhere).toHaveBeenCalled(); // Check if where was called
      expect(result).toBe(true);
    });
  });
});
