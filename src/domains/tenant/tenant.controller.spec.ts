import 'reflect-metadata';
import { Container } from 'typedi';
import { TenantsController } from '@domains/tenant/tenant.controller';
import { TenantService } from '@domains/tenant/tenant.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { Tenant } from '@domains/tenant/tenant.model';
import { CreateTenantDto, UpdateTenantDto } from '@domains/tenant/tenant.dto';
import { NotFoundError, ConflictError } from '@shared/utils/error/error.util';
import { faker } from '@faker-js/faker';

describe('TenantsController', () => {
  let tenantsController: TenantsController;
  let tenantService: TenantService;
  let loggerService: LoggerService;

  // Mock data
  const mockTenantId = faker.string.uuid();
  const mockTenant: Tenant = {
    id: mockTenantId,
    name: 'Test Tenant',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockCreateTenantDto: CreateTenantDto = {
    name: 'New Tenant',
    user: {
      email: 'user@example.com',
      username: 'testuser',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    },
  };

  const mockUpdateTenantDto: UpdateTenantDto = {
    name: 'Updated Tenant',
  };

  // Setup before each test
  beforeEach(() => {
    // Reset TypeDI container
    Container.reset();

    // Create mock tenant service
    tenantService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as TenantService;

    // Create mock logger service
    loggerService = {
      component: jest.fn().mockReturnValue({
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
      }),
    } as unknown as LoggerService;

    // Register mocks with TypeDI
    Container.set(TenantService, tenantService);
    Container.set(LoggerService, loggerService);

    // Get controller instance from container
    tenantsController = Container.get(TenantsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all tenants', async () => {
      const mockTenants = [mockTenant, { ...mockTenant, id: faker.string.uuid() }];
      (tenantService.findAll as jest.Mock).mockResolvedValue(mockTenants);

      const result = await tenantsController.getAll();

      expect(tenantService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockTenants);
    });
  });

  describe('getById', () => {
    it('should return a tenant when found', async () => {
      (tenantService.findById as jest.Mock).mockResolvedValue(mockTenant);

      const result = await tenantsController.getById(mockTenantId);

      expect(tenantService.findById).toHaveBeenCalledWith(mockTenantId);
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundError when tenant not found', async () => {
      (tenantService.findById as jest.Mock).mockRejectedValue(
        new NotFoundError('Tenant not found'),
      );

      await expect(tenantsController.getById('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('should create a tenant successfully', async () => {
      (tenantService.create as jest.Mock).mockResolvedValue(mockTenant);

      const result = await tenantsController.create(mockCreateTenantDto);

      expect(tenantService.create).toHaveBeenCalledWith(mockCreateTenantDto);
      expect(result).toEqual(mockTenant);
    });

    it('should throw ConflictError when tenant name already exists', async () => {
      (tenantService.create as jest.Mock).mockRejectedValue(
        new ConflictError('Tenant name already exists'),
      );

      await expect(tenantsController.create(mockCreateTenantDto)).rejects.toThrow(ConflictError);
    });
  });

  describe('update', () => {
    it('should update a tenant successfully', async () => {
      const updatedTenant = { ...mockTenant, name: 'Updated Tenant' };
      (tenantService.update as jest.Mock).mockResolvedValue(updatedTenant);

      const result = await tenantsController.update(mockTenantId, mockUpdateTenantDto);

      expect(tenantService.update).toHaveBeenCalledWith(mockTenantId, mockUpdateTenantDto);
      expect(result).toEqual(updatedTenant);
    });

    it('should throw NotFoundError when tenant not found', async () => {
      (tenantService.update as jest.Mock).mockRejectedValue(new NotFoundError('Tenant not found'));

      await expect(
        tenantsController.update('non-existent-id', mockUpdateTenantDto),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError when updated name already exists', async () => {
      (tenantService.update as jest.Mock).mockRejectedValue(
        new ConflictError('Tenant name already exists'),
      );

      await expect(tenantsController.update(mockTenantId, mockUpdateTenantDto)).rejects.toThrow(
        ConflictError,
      );
    });
  });

  describe('delete', () => {
    it('should delete a tenant successfully', async () => {
      (tenantService.delete as jest.Mock).mockResolvedValue(undefined);

      await tenantsController.delete(mockTenantId);

      expect(tenantService.delete).toHaveBeenCalledWith(mockTenantId);
    });

    it('should throw NotFoundError when tenant not found', async () => {
      (tenantService.delete as jest.Mock).mockRejectedValue(new NotFoundError('Tenant not found'));

      await expect(tenantsController.delete('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });
});
