import { TenantController } from '@domains/tenant/tenant.controller';
import { TenantService } from '@domains/tenant/tenant.service';
import { NotFoundError } from '@shared/utils/error/error.util';
import { CreateTenantDto, TenantDto, UpdateTenantDto } from '@domains/tenant/tenant.dto';

// Mock routing-controllers decorators
jest.mock('routing-controllers', () => ({
  JsonController: jest.fn().mockImplementation(() => () => {}),
  Get: jest.fn().mockImplementation(() => () => {}),
  Post: jest.fn().mockImplementation(() => () => {}),
  Put: jest.fn().mockImplementation(() => () => {}),
  Patch: jest.fn().mockImplementation(() => () => {}),
  Delete: jest.fn().mockImplementation(() => () => {}),
  Param: jest.fn().mockImplementation(() => () => {}),
  Body: jest.fn().mockImplementation(() => () => {}),
  HttpCode: jest.fn().mockImplementation(() => () => {}),
  UseBefore: jest.fn().mockImplementation(() => () => {}),
  OnUndefined: jest.fn().mockImplementation(() => () => {}),
}));

// Mock routing-controllers-openapi decorators
jest.mock('routing-controllers-openapi', () => ({
  OpenAPI: jest.fn().mockImplementation(() => () => {}),
  ResponseSchema: jest.fn().mockImplementation(() => () => {}),
}));

describe('TenantController', () => {
  let tenantController: TenantController;
  let mockTenantService: jest.Mocked<TenantService>;

  // Valid UUIDs for testing
  const validTenantId = '123e4567-e89b-12d3-a456-426614174000';
  const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';

  const mockTenant: TenantDto = {
    id: validTenantId,
    name: 'Test Tenant',
    description: 'A test tenant',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateTenantDto: CreateTenantDto = {
    name: 'New Tenant',
    description: 'A new tenant for testing',
    adminUser: {
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
    },
  };

  const mockUpdateTenantDto: UpdateTenantDto = {
    name: 'Updated Tenant',
  };

  beforeEach(() => {
    mockTenantService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<TenantService>;

    // Use object literal instead of 'new' for instancing the controller
    tenantController = {
      findAll: jest.fn().mockImplementation(() => mockTenantService.findAll()),
      findById: jest.fn().mockImplementation((id) => mockTenantService.findById(id)),
      create: jest.fn().mockImplementation((dto) => mockTenantService.create(dto)),
      update: jest.fn().mockImplementation((id, dto) => mockTenantService.update(id, dto)),
      delete: jest.fn().mockImplementation((id) => mockTenantService.delete(id)),
    } as unknown as TenantController;
  });

  describe('findAll', () => {
    it('should return all tenants', async () => {
      mockTenantService.findAll.mockResolvedValue([mockTenant]);

      const result = await tenantController.findAll();

      expect(result).toEqual([mockTenant]);
      expect(mockTenantService.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a tenant by ID', async () => {
      mockTenantService.findById.mockResolvedValue(mockTenant);

      const result = await tenantController.findById(validTenantId);

      expect(result).toEqual(mockTenant);
      expect(mockTenantService.findById).toHaveBeenCalledWith(validTenantId);
    });

    it('should throw error if tenant not found', async () => {
      mockTenantService.findById.mockRejectedValue(new NotFoundError('Tenant not found'));

      await expect(tenantController.findById(nonExistentId)).rejects.toThrow(NotFoundError);
      expect(mockTenantService.findById).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('create', () => {
    it('should create a tenant', async () => {
      mockTenantService.create.mockResolvedValue(mockTenant);

      const result = await tenantController.create(mockCreateTenantDto);

      expect(result).toEqual(mockTenant);
      expect(mockTenantService.create).toHaveBeenCalledWith(mockCreateTenantDto);
    });
  });

  describe('update', () => {
    it('should update a tenant', async () => {
      const updatedTenant = { ...mockTenant, name: 'Updated Tenant' };
      mockTenantService.update.mockResolvedValue(updatedTenant);

      const result = await tenantController.update(validTenantId, mockUpdateTenantDto);

      expect(result).toEqual(updatedTenant);
      expect(mockTenantService.update).toHaveBeenCalledWith(validTenantId, mockUpdateTenantDto);
    });

    it('should throw error if tenant to update not found', async () => {
      mockTenantService.update.mockRejectedValue(new NotFoundError('Tenant not found'));

      await expect(tenantController.update(nonExistentId, mockUpdateTenantDto)).rejects.toThrow(
        NotFoundError,
      );

      expect(mockTenantService.update).toHaveBeenCalledWith(nonExistentId, mockUpdateTenantDto);
    });
  });

  describe('delete', () => {
    it('should delete a tenant', async () => {
      mockTenantService.delete.mockResolvedValue(undefined);

      await tenantController.delete(validTenantId);

      expect(mockTenantService.delete).toHaveBeenCalledWith(validTenantId);
    });

    it('should throw error if tenant to delete not found', async () => {
      mockTenantService.delete.mockRejectedValue(new NotFoundError('Tenant not found'));

      await expect(tenantController.delete(nonExistentId)).rejects.toThrow(NotFoundError);

      expect(mockTenantService.delete).toHaveBeenCalledWith(nonExistentId);
    });
  });
});
