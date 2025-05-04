import { Injectable } from '@shared/utils/ioc.util';
import { Logger } from '@shared/types/logger.type';
import { LoggerService } from '@shared/services/logger/logger.service';
import { TenantRepository } from '@domains/tenant/tenant.repository';
import { CognitoService } from '@shared/services/cognito/cognito.service';
import { UserService } from '@domains/user/user.service';
import { NotFoundError } from '@shared/utils/error/error.util';
import { Tenant } from '@domains/tenant/tenant.model';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from '@domains/user/user.dto';
import { CreateTenantDto, TenantDto, UpdateTenantDto } from '@domains/tenant/tenant.dto';
import { Inject } from 'typedi';

/**
 * Service responsible for tenant-related business logic.
 * Manages tenant creation, updates, and integration with Cognito.
 */
@Injectable()
export class TenantService {
  private readonly logger: Logger;

  @Inject()
  private readonly tenantRepository!: TenantRepository;

  @Inject()
  private readonly cognitoService!: CognitoService;

  @Inject()
  private readonly userService!: UserService;

  /**
   * Creates an instance of TenantService.
   */
  constructor(private readonly loggerService: LoggerService) {
    this.logger = this.loggerService.component('TenantService');
  }

  /**
   * Maps a Tenant entity to a TenantDto
   * @param tenant - The Tenant entity to map
   * @returns A TenantDto object
   */
  private mapToTenantDto(tenant: Tenant): TenantDto {
    return {
      id: tenant.id,
      name: tenant.name,
      description: tenant.description,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }

  /**
   * Retrieves all tenants.
   * @returns Promise resolving to an array of TenantDto objects
   */
  async findAll(): Promise<TenantDto[]> {
    this.logger.info('Finding all tenants');
    const tenants = await this.tenantRepository.findAll();
    return tenants.map((tenant) => this.mapToTenantDto(tenant));
  }

  /**
   * Retrieves a tenant by its ID.
   * @param id - The ID of the tenant to retrieve
   * @returns Promise resolving to the TenantDto object
   * @throws NotFoundError if tenant doesn't exist
   */
  async findById(id: string): Promise<TenantDto> {
    this.logger.info('Finding tenant by ID', { id });
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundError(`Tenant with ID ${id} not found`);
    }
    return this.mapToTenantDto(tenant);
  }

  /**
   * Retrieves a tenant by its name.
   * @param name - The name of the tenant to retrieve
   * @returns Promise resolving to the TenantDto object
   * @throws NotFoundError if tenant doesn't exist
   */
  async findByName(name: string): Promise<TenantDto> {
    this.logger.info('Finding tenant by name', { name });
    const tenant = await this.tenantRepository.findByName(name);
    return this.mapToTenantDto(tenant);
  }

  /**
   * Creates a new tenant with an admin user.
   * This method:
   * 1. Creates a Cognito user for the tenant admin
   * 2. Creates the tenant in the database
   * 3. Creates a user record linked to the Cognito user and tenant
   *
   * @param data - Data for creating the tenant and admin user
   * @returns Promise resolving to the created TenantDto object
   */
  async create(data: CreateTenantDto): Promise<TenantDto> {
    this.logger.info('Creating tenant with admin user', {
      tenantName: data.name,
      adminUsername: data.adminUser.username,
    });

    // Step 1: Create Cognito user
    const signUpResult = await this.cognitoService.signUp({
      username: data.adminUser.username,
      email: data.adminUser.email,
      password: data.adminUser.password,
      attributes: {
        given_name: data.adminUser.firstName || '',
        family_name: data.adminUser.lastName || '',
        'custom:tenant_name': data.name,
      },
    });

    if (!signUpResult.sub) {
      throw new Error('Failed to get Cognito user sub from sign-up response');
    }

    // Step 2: Create tenant in database
    const tenantId = uuidv4();
    const tenant = await this.tenantRepository.create({
      id: tenantId,
      name: data.name,
      description: data.description || null,
    });

    // Step 3: Create user in database linked to tenant and Cognito
    const userDto: CreateUserDto = {
      username: data.adminUser.username,
      email: data.adminUser.email,
      cognitoSub: signUpResult.sub,
      isAdmin: true,
      tenantId: tenantId,
      preferredLanguage: 'en-US', // Default preferred language
    };

    // Add optional fields if provided
    if (data.adminUser.firstName) {
      userDto.firstName = data.adminUser.firstName;
    }

    if (data.adminUser.lastName) {
      userDto.lastName = data.adminUser.lastName;
    }

    await this.userService.create(userDto);

    return this.mapToTenantDto(tenant);
  }

  /**
   * Updates an existing tenant.
   * @param id - ID of the tenant to update
   * @param data - Data for updating the tenant
   * @returns Promise resolving to the updated TenantDto object
   * @throws NotFoundError if tenant doesn't exist
   */
  async update(id: string, data: UpdateTenantDto): Promise<TenantDto> {
    this.logger.info('Updating tenant', { id });

    // Verify tenant exists before update
    await this.findById(id);

    const tenant = await this.tenantRepository.update(id, data);
    return this.mapToTenantDto(tenant);
  }

  /**
   * Deletes a tenant by its ID.
   * Note: This is a soft delete operation.
   *
   * @param id - ID of the tenant to delete
   * @throws NotFoundError if tenant doesn't exist
   */
  async delete(id: string): Promise<void> {
    this.logger.info('Deleting tenant', { id });

    // Verify tenant exists before deletion
    await this.findById(id);

    await this.tenantRepository.delete(id);
  }
}
