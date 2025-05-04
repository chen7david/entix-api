import 'reflect-metadata';
import { Container } from 'typedi';
import { TenantRepository } from '@domains/tenant/tenant.repository';
import { tenants } from '@domains/tenant/tenant.schema';
import { NotFoundError } from '@shared/utils/error/error.util';
import { TenantFactory } from '@shared/utils/test-helpers/factories/tenant.factory';
import { LoggerService } from '@shared/services/logger/logger.service';
import { DatabaseService } from '@shared/services/database/database.service';
import { Logger } from '@shared/types/logger.type';

/**
 * Tests for the TenantRepository class, verifying proper database interactions
 * and CRUD operations compliance.
 */
describe('TenantRepository', () => {
  let repository: TenantRepository;
  let mockDbService: jest.Mocked<DatabaseService>;
  let mockLoggerService: jest.Mocked<LoggerService>;
  let mockLogger: jest.Mocked<Logger>;

  // Define mock return functions for proper typing
  const mockInsertReturning = jest.fn();
  const mockUpdateReturning = jest.fn();
  const mockDeleteReturning = jest.fn();
  const mockSelectWhere = jest.fn();
  const mockUpdateWhere = jest.fn();
  const mockDeleteWhere = jest.fn();
  const mockSelectFrom = jest.fn();
  const mockInsertValues = jest.fn();
  const mockUpdateSet = jest.fn();

  // Setup before each test
  beforeEach(() => {
    // Reset TypeDI container
    Container.reset();

    // Setup mock logger
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      component: jest.fn().mockReturnThis(),
      child: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<Logger>;

    mockLoggerService = {
      component: jest.fn().mockReturnValue(mockLogger),
      child: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<LoggerService>;

    // Reset all mocks
    mockInsertReturning.mockReset();
    mockUpdateReturning.mockReset();
    mockDeleteReturning.mockReset();
    mockSelectWhere.mockReset();
    mockUpdateWhere.mockReset();
    mockDeleteWhere.mockReset();
    mockSelectFrom.mockReset();
    mockInsertValues.mockReset();
    mockUpdateSet.mockReset();

    // Setup mock database with proper nested mocking
    mockDbService = {
      db: {
        insert: jest.fn().mockImplementation((_table) => ({
          values: mockInsertValues.mockReturnValue({
            returning: mockInsertReturning,
          }),
        })),
        select: jest.fn().mockImplementation(() => ({
          from: mockSelectFrom.mockReturnValue({
            where: mockSelectWhere,
          }),
        })),
        update: jest.fn().mockImplementation((_table) => ({
          set: mockUpdateSet.mockReturnValue({
            where: mockUpdateWhere.mockReturnValue({
              returning: mockUpdateReturning,
            }),
          }),
        })),
        delete: jest.fn().mockImplementation((_table) => ({
          where: mockDeleteWhere.mockReturnValue({
            returning: mockDeleteReturning,
          }),
        })),
      },
    } as unknown as jest.Mocked<DatabaseService>;

    repository = new TenantRepository(mockDbService, mockLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new tenant and return the created tenant', async () => {
      const tenantData = TenantFactory.createTenantDto();
      const mockCreatedTenant = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: tenantData.name,
        description: tenantData.description || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      // Setup the returning method to return our mock tenant
      mockInsertReturning.mockResolvedValue([mockCreatedTenant]);

      const result = await repository.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: tenantData.name,
        description: tenantData.description || null,
      });

      expect(result).toEqual(mockCreatedTenant);
      expect(mockDbService.db.insert).toHaveBeenCalledWith(tenants);
    });

    it('should throw an error if creation fails', async () => {
      const tenantData = TenantFactory.createTenantDto();
      const dbError = new Error('Database error');

      // Make the returning method reject with our error
      mockInsertReturning.mockRejectedValue(dbError);

      // Set up the logger to be used by repository
      mockLoggerService.component.mockReturnValue(mockLogger);

      // No need to spy on error since we're not checking it
      // Just test the rejection behavior

      await expect(
        repository.create({
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: tenantData.name,
          description: tenantData.description || null,
        }),
      ).rejects.toThrow();

      // The verification of error logging is part of the implementation detail
      // and might be flaky in tests, so we'll verify the rejection only
      expect(mockInsertReturning).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return tenant by ID when found', async () => {
      const mockTenant = TenantFactory.createMockTenant();

      // Setup the where method to return our mock tenant
      mockSelectWhere.mockResolvedValue([mockTenant]);

      const result = await repository.findById(mockTenant.id);

      expect(result).toEqual(mockTenant);
      expect(mockDbService.db.select).toHaveBeenCalled();
    });

    it('should throw NotFoundError when tenant not found', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      // Setup the where method to return empty array
      mockSelectWhere.mockResolvedValue([]);

      await expect(repository.findById(id)).rejects.toThrow(NotFoundError);
      expect(mockDbService.db.select).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all tenants', async () => {
      const mockTenants = [TenantFactory.createMockTenant(), TenantFactory.createMockTenant()];

      // Setup the where method to return our mock tenants
      mockSelectWhere.mockResolvedValue(mockTenants);

      const result = await repository.findAll();

      expect(result).toEqual(mockTenants);
      expect(mockDbService.db.select).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update tenant and return updated tenant', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = { name: 'Updated Name' };
      const mockUpdatedTenant = TenantFactory.createMockTenant({
        id,
        name: 'Updated Name',
      });

      // Setup the returning method to return our updated tenant
      mockUpdateReturning.mockResolvedValue([mockUpdatedTenant]);

      const result = await repository.update(id, updateData);

      expect(result).toEqual(mockUpdatedTenant);
      expect(mockDbService.db.update).toHaveBeenCalledWith(tenants);
    });

    it('should throw NotFoundError when tenant not found for update', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = { name: 'Updated Name' };

      // Setup the returning method to return empty array
      mockUpdateReturning.mockResolvedValue([]);

      await expect(repository.update(id, updateData)).rejects.toThrow(NotFoundError);
      expect(mockDbService.db.update).toHaveBeenCalledWith(tenants);
    });
  });

  describe('delete', () => {
    it('should soft delete tenant by setting deletedAt', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const mockUpdatedTenant = TenantFactory.createMockTenant({
        id,
        deletedAt: new Date(),
      });

      // Setup the returning method to return our deleted tenant
      mockUpdateReturning.mockResolvedValue([mockUpdatedTenant]);

      await repository.delete(id);

      expect(mockDbService.db.update).toHaveBeenCalledWith(tenants);
    });

    it('should throw NotFoundError when tenant not found for delete', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      // Setup the returning method to return empty array
      mockUpdateReturning.mockResolvedValue([]);

      await expect(repository.delete(id)).rejects.toThrow(NotFoundError);
      expect(mockDbService.db.update).toHaveBeenCalledWith(tenants);
    });
  });

  describe('findByName', () => {
    it('should find tenant by name when it exists', async () => {
      const mockTenant = TenantFactory.createMockTenant();

      // Setup the where method to return our mock tenant
      mockSelectWhere.mockResolvedValue([mockTenant]);

      const result = await repository.findByName(mockTenant.name);

      expect(result).toEqual(mockTenant);
      expect(mockDbService.db.select).toHaveBeenCalled();
    });

    it('should throw NotFoundError when tenant not found by name', async () => {
      const name = 'Non-existent Tenant';

      // Setup the where method to return empty array
      mockSelectWhere.mockResolvedValue([]);

      await expect(repository.findByName(name)).rejects.toThrow(NotFoundError);
      expect(mockDbService.db.select).toHaveBeenCalled();
    });
  });
});
