import 'reflect-metadata';
import { Container } from 'typedi';
import { TenantService } from '@domains/tenant/tenant.service';
import { TenantRepository } from '@domains/tenant/tenant.repository';
import { UserRepository } from '@domains/user/user.repository';
import { CognitoService } from '@shared/services/cognito/cognito.service';
import { DatabaseService } from '@shared/services/database/database.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { CreateTenantDto } from '@domains/tenant/tenant.dto';
import { Tenant } from '@domains/tenant/tenant.model';
import { ConflictError, NotFoundError } from '@shared/utils/error/error.util';
import { faker } from '@faker-js/faker';

describe('TenantService', () => {
  let tenantService: TenantService;
  let tenantRepository: TenantRepository;
  let userRepository: UserRepository;
  let cognitoService: CognitoService;
  let dbService: DatabaseService;
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

  // Setup before each test
  beforeEach(() => {
    // Reset TypeDI container
    Container.reset();

    // Create mock repositories and services
    tenantRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      createWithTx: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as TenantRepository;

    userRepository = {
      createWithTx: jest.fn(),
    } as unknown as UserRepository;

    cognitoService = {
      signUp: jest.fn(),
    } as unknown as CognitoService;

    // Mock transaction
    const mockTx = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
    };

    dbService = {
      db: {
        transaction: jest.fn((callback) => callback(mockTx)),
      },
    } as unknown as DatabaseService;

    // Create mock logger
    loggerService = {
      component: jest.fn().mockReturnValue({
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
      }),
    } as unknown as LoggerService;

    // Register mocks with TypeDI
    Container.set(TenantRepository, tenantRepository);
    Container.set(UserRepository, userRepository);
    Container.set(CognitoService, cognitoService);
    Container.set(DatabaseService, dbService);
    Container.set(LoggerService, loggerService);

    // Get service instance from container
    tenantService = Container.get(TenantService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all tenants', async () => {
      const mockTenants = [mockTenant, { ...mockTenant, id: faker.string.uuid() }];
      (tenantRepository.findAll as jest.Mock).mockResolvedValue(mockTenants);

      const result = await tenantService.findAll();

      expect(tenantRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockTenants);
    });
  });

  describe('findById', () => {
    it('should return a tenant when found', async () => {
      (tenantRepository.findById as jest.Mock).mockResolvedValue(mockTenant);

      const result = await tenantService.findById(mockTenantId);

      expect(tenantRepository.findById).toHaveBeenCalledWith(mockTenantId);
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundError when tenant not found', async () => {
      (tenantRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(tenantService.findById('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('should create a tenant with user successfully', async () => {
      // Mock tenant not already existing
      (tenantRepository.findByName as jest.Mock).mockResolvedValue(null);

      // Mock tenant creation
      (tenantRepository.createWithTx as jest.Mock).mockResolvedValue(mockTenant);

      // Mock Cognito user creation
      (cognitoService.signUp as jest.Mock).mockResolvedValue({
        sub: 'cognito-sub',
      });

      // Mock database user creation
      const mockUser = {
        id: faker.string.uuid(),
        email: mockCreateTenantDto.user.email,
        username: mockCreateTenantDto.user.username,
      };
      (userRepository.createWithTx as jest.Mock).mockResolvedValue(mockUser);

      // Call create method
      const result = await tenantService.create(mockCreateTenantDto);

      // Verify findByName was called to check for existing tenant
      expect(tenantRepository.findByName).toHaveBeenCalledWith(mockCreateTenantDto.name);

      // Verify tenant was created
      expect(tenantRepository.createWithTx).toHaveBeenCalled();

      // Verify Cognito user was created
      expect(cognitoService.signUp).toHaveBeenCalledWith({
        username: mockCreateTenantDto.user.username,
        email: mockCreateTenantDto.user.email,
        password: mockCreateTenantDto.user.password,
        attributes: {
          'custom:tenant_id': mockTenant.id,
        },
      });

      // Verify database user was created
      expect(userRepository.createWithTx).toHaveBeenCalled();

      // Verify transaction was used
      expect(dbService.db.transaction).toHaveBeenCalled();

      // Verify the correct tenant was returned
      expect(result).toEqual(mockTenant);
    });

    it('should throw ConflictError if tenant name already exists', async () => {
      // Mock tenant already existing
      (tenantRepository.findByName as jest.Mock).mockResolvedValue(mockTenant);

      // Call create method and expect error
      await expect(tenantService.create(mockCreateTenantDto)).rejects.toThrow(ConflictError);

      // Verify transaction was not started
      expect(dbService.db.transaction).not.toHaveBeenCalled();
    });

    it('should propagate Cognito errors', async () => {
      // Mock tenant not already existing
      (tenantRepository.findByName as jest.Mock).mockResolvedValue(null);

      // Mock tenant creation
      (tenantRepository.createWithTx as jest.Mock).mockResolvedValue(mockTenant);

      // Mock Cognito error
      const cognitoError = new Error('Cognito error');
      (cognitoService.signUp as jest.Mock).mockRejectedValue(cognitoError);

      // Call create method and expect error
      await expect(tenantService.create(mockCreateTenantDto)).rejects.toThrow('Cognito error');
    });
  });

  describe('update', () => {
    it('should update a tenant successfully', async () => {
      // Mock tenant existing
      (tenantRepository.findById as jest.Mock).mockResolvedValue(mockTenant);

      // Mock no duplicate name
      (tenantRepository.findByName as jest.Mock).mockResolvedValue(null);

      // Mock update
      const updatedTenant = { ...mockTenant, name: 'Updated Name' };
      (tenantRepository.update as jest.Mock).mockResolvedValue(updatedTenant);

      // Call update method
      const result = await tenantService.update(mockTenantId, { name: 'Updated Name' });

      // Verify checks were performed
      expect(tenantRepository.findById).toHaveBeenCalledWith(mockTenantId);
      expect(tenantRepository.findByName).toHaveBeenCalledWith('Updated Name');

      // Verify update was called
      expect(tenantRepository.update).toHaveBeenCalledWith(mockTenantId, { name: 'Updated Name' });

      // Verify result
      expect(result).toEqual(updatedTenant);
    });

    it('should throw NotFoundError if tenant not found', async () => {
      // Mock tenant not existing
      (tenantRepository.findById as jest.Mock).mockResolvedValue(null);

      // Call update method and expect error
      await expect(
        tenantService.update('non-existent-id', { name: 'Updated Name' }),
      ).rejects.toThrow(NotFoundError);

      // Verify update was not called
      expect(tenantRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError if new name already exists for another tenant', async () => {
      // Mock tenant existing
      (tenantRepository.findById as jest.Mock).mockResolvedValue(mockTenant);

      // Mock duplicate name
      const existingTenant = { ...mockTenant, id: 'different-id' };
      (tenantRepository.findByName as jest.Mock).mockResolvedValue(existingTenant);

      // Call update method and expect error
      await expect(tenantService.update(mockTenantId, { name: 'Duplicate Name' })).rejects.toThrow(
        ConflictError,
      );

      // Verify update was not called
      expect(tenantRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a tenant successfully', async () => {
      // Mock tenant existing
      (tenantRepository.findById as jest.Mock).mockResolvedValue(mockTenant);

      // Call delete method
      await tenantService.delete(mockTenantId);

      // Verify checks were performed
      expect(tenantRepository.findById).toHaveBeenCalledWith(mockTenantId);

      // Verify delete was called
      expect(tenantRepository.delete).toHaveBeenCalledWith(mockTenantId);
    });

    it('should throw NotFoundError if tenant not found', async () => {
      // Mock tenant not existing
      (tenantRepository.findById as jest.Mock).mockResolvedValue(null);

      // Call delete method and expect error
      await expect(tenantService.delete('non-existent-id')).rejects.toThrow(NotFoundError);

      // Verify delete was not called
      expect(tenantRepository.delete).not.toHaveBeenCalled();
    });
  });
});
