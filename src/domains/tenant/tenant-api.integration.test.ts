import 'reflect-metadata';
import { Container } from 'typedi';
import { faker } from '@faker-js/faker';
import { TenantRepository } from '@domains/tenant/tenant.repository';
import { NotFoundError } from '@shared/utils/error/error.util';
import { DatabaseService } from '@shared/services/database/database.service';
import { ConfigService } from '@shared/services/config/config.service';
import { LoggerService } from '@shared/services/logger/logger.service';

/**
 * Integration tests for the Tenant API and Repository.
 * These tests verify that the tenant functionality properly interacts with the database.
 */
describe('Tenant Repository - Integration', () => {
  let tenantRepository: TenantRepository;
  let dbService: DatabaseService;

  beforeAll(() => {
    // Ensure dependencies are available in the container
    if (!Container.has(ConfigService)) {
      Container.set(ConfigService, new ConfigService());
    }

    if (!Container.has(LoggerService)) {
      const loggerService = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
        component: jest.fn().mockReturnThis(),
        child: jest.fn().mockReturnThis(),
      };
      Container.set(LoggerService, loggerService);
    }

    // Get database service and tenant repository
    dbService = Container.get(DatabaseService);
    tenantRepository = Container.get(TenantRepository);
  });

  beforeEach(async () => {
    await dbService.beginTransaction();
  });

  afterEach(async () => {
    await dbService.rollbackTransaction();
  });

  afterAll(async () => {
    await dbService.cleanup();
  });

  describe('CRUD operations', () => {
    it('should create, read, update, and delete tenants', async () => {
      // Create a tenant
      const tenantName = faker.company.name();
      const newTenant = {
        name: tenantName,
        description: faker.company.catchPhrase(),
      };

      const createdTenant = await tenantRepository.create(newTenant);
      expect(createdTenant).toBeDefined();
      expect(createdTenant.id).toBeDefined();
      expect(createdTenant.name).toBe(tenantName);

      // Read the tenant by ID
      const foundTenant = await tenantRepository.findById(createdTenant.id);
      expect(foundTenant).toEqual(createdTenant);

      // Update the tenant
      const updatedName = faker.company.name();
      const updatedTenant = await tenantRepository.update(createdTenant.id, {
        name: updatedName,
      });
      expect(updatedTenant.name).toBe(updatedName);

      // Delete the tenant (soft delete)
      await tenantRepository.delete(createdTenant.id);

      // Verify the tenant is soft deleted
      await expect(tenantRepository.findById(createdTenant.id)).rejects.toThrow(NotFoundError);

      // Should be able to find it when including deleted
      const deletedTenant = await tenantRepository.findById(createdTenant.id, true);
      expect(deletedTenant).toBeDefined();
      expect(deletedTenant.id).toBe(createdTenant.id);
      expect(deletedTenant.deletedAt).toBeDefined();
    });

    it('should find all tenants while respecting soft-delete', async () => {
      // Create two tenants
      const tenant1 = await tenantRepository.create({
        name: faker.company.name(),
        description: faker.company.catchPhrase(),
      });

      const tenant2 = await tenantRepository.create({
        name: faker.company.name(),
        description: faker.company.catchPhrase(),
      });

      // Soft delete one tenant
      await tenantRepository.delete(tenant1.id);

      // Get all non-deleted tenants
      const allTenants = await tenantRepository.findAll();
      expect(allTenants.some((t) => t.id === tenant1.id)).toBe(false);
      expect(allTenants.some((t) => t.id === tenant2.id)).toBe(true);

      // Get all tenants including deleted
      const allTenantsWithDeleted = await tenantRepository.findAll(true);
      expect(allTenantsWithDeleted.some((t) => t.id === tenant1.id)).toBe(true);
      expect(allTenantsWithDeleted.some((t) => t.id === tenant2.id)).toBe(true);
    });
  });

  describe('Tenant-specific operations', () => {
    it('should throw NotFoundError for non-existent tenant name', async () => {
      await expect(tenantRepository.findByName('non-existent-tenant')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should find tenant by name case-sensitively', async () => {
      const tenantName = `Test-${faker.string.uuid()}`;

      await tenantRepository.create({
        name: tenantName,
        description: faker.company.catchPhrase(),
      });

      // Should find exact match
      const foundTenant = await tenantRepository.findByName(tenantName);
      expect(foundTenant).toBeDefined();
      expect(foundTenant.name).toBe(tenantName);

      // Different case should not match
      await expect(tenantRepository.findByName(tenantName.toLowerCase())).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should respect soft delete in findByName', async () => {
      const tenantName = `Delete-${faker.string.uuid()}`;

      const tenant = await tenantRepository.create({
        name: tenantName,
        description: faker.company.catchPhrase(),
      });

      // Soft delete the tenant
      await tenantRepository.delete(tenant.id);

      // Should not find by default
      await expect(tenantRepository.findByName(tenantName)).rejects.toThrow(NotFoundError);

      // Should find when includeDeleted is true
      const foundTenant = await tenantRepository.findByName(tenantName, true);
      expect(foundTenant).toBeDefined();
      expect(foundTenant.deletedAt).toBeDefined();
    });
  });
});
