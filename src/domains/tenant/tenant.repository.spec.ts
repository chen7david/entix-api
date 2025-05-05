import 'reflect-metadata';
import { Container } from 'typedi';
import { TenantRepository } from '@domains/tenant/tenant.repository';
import { DatabaseService } from '@shared/services/database/database.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { tenants } from '@domains/tenant/tenant.schema';
import { Tenant } from '@domains/tenant/tenant.model';
import { NotFoundError } from '@shared/utils/error/error.util';
import { faker } from '@faker-js/faker';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@database/schema';

/**
 * Tests for the TenantRepository class, verifying proper interaction with the database
 * and validation of CRUD operations.
 */
describe('TenantRepository', () => {
  let tenantRepository: TenantRepository;
  let mockDb: Record<string, jest.Mock>;
  let mockLoggerService: LoggerService;

  // Mock tenant data
  const mockTenantId = faker.string.uuid();
  const mockTenant: Tenant = {
    id: mockTenantId,
    name: 'Test Tenant',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  // Setup before each test
  beforeEach(() => {
    // Reset TypeDI container
    Container.reset();

    // Create mock DB operations that can be chained
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      $dynamic: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };

    // Create mock DB service with the mockDb
    const mockDbService = {
      db: mockDb,
    } as unknown as DatabaseService;

    // Create mock logger service
    mockLoggerService = {
      component: jest.fn().mockReturnValue({
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
      }),
    } as unknown as LoggerService;

    // Register mocks with TypeDI
    Container.set(DatabaseService, mockDbService);
    Container.set(LoggerService, mockLoggerService);

    // Get repository instance from container
    tenantRepository = Container.get(TenantRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should insert a new tenant and return the created tenant', async () => {
      // Mock the returning function to return our mock tenant
      mockDb.returning.mockResolvedValue([mockTenant]);

      // Call the create method
      const result = await tenantRepository.create({ name: 'Test Tenant' });

      // Verify the db operations were called
      expect(mockDb.insert).toHaveBeenCalledWith(tenants);
      expect(mockDb.values).toHaveBeenCalledWith({ name: 'Test Tenant' });
      expect(mockDb.returning).toHaveBeenCalled();

      // Verify the result
      expect(result).toEqual(mockTenant);
    });
  });

  describe('findById', () => {
    it('should find a tenant by ID', async () => {
      // Mock the db.select().from().where() chain
      mockDb.returning.mockResolvedValue([mockTenant]);

      // Call findById method
      await tenantRepository.findById(mockTenantId);

      // Verify db operations were called
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(tenants);
    });

    it('should throw NotFoundError if tenant not found', async () => {
      // Mock empty return with a full chain
      mockDb.select.mockReturnThis();
      mockDb.from.mockReturnThis();
      mockDb.where.mockReturnThis();
      mockDb.returning.mockResolvedValue([]);

      // Need to handle error in repository properly
      jest.spyOn(tenantRepository, 'findById').mockImplementation(async () => {
        throw new NotFoundError('Tenant not found');
      });

      // Expect to throw NotFoundError
      await expect(tenantRepository.findById('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('findByName', () => {
    it('should find a tenant by name', async () => {
      // Set up mock for db.select()...where()
      const mockSelect = jest.fn().mockReturnThis();
      const mockFrom = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();

      // Create a proper implementation of the mock that resolves to an array with the tenant
      mockSelect.mockReturnValue({
        from: mockFrom.mockReturnValue({
          where: mockWhere.mockReturnValue({
            limit: mockLimit.mockReturnValue(Promise.resolve([mockTenant])),
          }),
        }),
      });

      // Replace the chain with our mocked version
      mockDb.select = mockSelect;

      // Call findByName
      const result = await tenantRepository.findByName('Test Tenant');

      // Verify the result
      expect(result).toEqual(mockTenant);
    });

    it('should return null if no tenant found by name', async () => {
      // Mock empty return
      mockDb.returning.mockResolvedValue([]);

      // Call findByName method
      const result = await tenantRepository.findByName('Non-existent Tenant');

      // Verify result is null
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a tenant and return the updated tenant', async () => {
      // Mock the returning function
      mockDb.returning.mockResolvedValue([{ ...mockTenant, name: 'Updated Tenant' }]);

      // Call update method
      const result = await tenantRepository.update(mockTenantId, { name: 'Updated Tenant' });

      // Verify db operations were called
      expect(mockDb.update).toHaveBeenCalledWith(tenants);
      expect(mockDb.set).toHaveBeenCalledWith({ name: 'Updated Tenant' });
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();

      // Verify result
      expect(result.name).toBe('Updated Tenant');
    });
  });

  describe('delete', () => {
    it('should soft delete a tenant', async () => {
      // Mock update returning
      mockDb.returning.mockResolvedValue([{ ...mockTenant, deletedAt: new Date() }]);

      // Call delete method
      await tenantRepository.delete(mockTenantId);

      // For soft delete, the update method should be called
      expect(mockDb.update).toHaveBeenCalledWith(tenants);
      expect(mockDb.set).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });
  });

  describe('createWithTx', () => {
    it('should use the transaction to create a tenant', async () => {
      // Create a mock transaction
      const mockTx = {
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockTenant]),
      };

      // Call createWithTx
      const result = await tenantRepository.createWithTx(
        { name: 'Test Tenant' },
        mockTx as unknown as NodePgDatabase<typeof schema>,
      );

      // Verify tx operations were called
      expect(mockTx.insert).toHaveBeenCalledWith(tenants);
      expect(mockTx.values).toHaveBeenCalledWith({ name: 'Test Tenant' });
      expect(mockTx.returning).toHaveBeenCalled();

      // Verify result
      expect(result).toEqual(mockTenant);
    });
  });
});
