import { Injectable } from '@shared/utils/ioc.util';
import { Logger } from '@shared/types/logger.type';
import { LoggerService } from '@shared/services/logger/logger.service';
import { TenantRepository } from '@domains/tenant/tenant.repository';
import { Tenant, TenantId } from '@domains/tenant/tenant.model';
import { CreateTenantDto, UpdateTenantDto } from '@domains/tenant/tenant.dto';
import { NotFoundError, ConflictError } from '@shared/utils/error/error.util';
import { CognitoService } from '@shared/services/cognito/cognito.service';
import { userTenants } from '@domains/tenant/user-tenant.schema';
import { UserRepository } from '@domains/user/user.repository';
import { DatabaseService } from '@shared/services/database/database.service';

/**
 * Service responsible for tenant-related business logic.
 * Acts as an intermediary between controllers and the repository.
 */
@Injectable()
export class TenantService {
  private readonly logger: Logger;

  /**
   * Creates an instance of TenantService.
   * @param loggerService - Logger service for creating child loggers
   * @param tenantRepository - Repository for tenant data access
   * @param userRepository - Repository for user data access
   * @param cognitoService - Service for Cognito operations
   * @param dbService - Database service for transactions
   */
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly loggerService: LoggerService,
    private readonly tenantRepository: TenantRepository,
    private readonly userRepository: UserRepository,
    private readonly cognitoService: CognitoService,
    private readonly dbService: DatabaseService,
  ) {
    this.logger = this.loggerService.component('TenantService');
  }

  /**
   * Retrieves all tenants.
   * @returns Promise resolving to an array of Tenant objects
   */
  async findAll(): Promise<Tenant[]> {
    this.logger.info('Finding all tenants');
    return this.tenantRepository.findAll();
  }

  /**
   * Retrieves a tenant by their ID.
   * @param id - The ID of the tenant to retrieve
   * @returns Promise resolving to the Tenant object
   * @throws NotFoundError if tenant doesn't exist
   */
  async findById(id: TenantId): Promise<Tenant> {
    this.logger.info('Finding tenant by ID', { id });
    const tenant = await this.tenantRepository.findById(id);

    if (!tenant) {
      throw new NotFoundError(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  /**
   * Creates a new tenant with an associated user in Cognito.
   * Uses a transaction to ensure data consistency.
   *
   * @param data - Data for creating the tenant
   * @returns Promise resolving to the created Tenant object
   * @throws ConflictError if tenant with the same name already exists
   */
  async create(data: CreateTenantDto): Promise<Tenant> {
    this.logger.info('Creating tenant', { name: data.name });

    // Check if tenant with the same name already exists
    const existingTenant = await this.tenantRepository.findByName(data.name);
    if (existingTenant) {
      throw new ConflictError(`Tenant with name "${data.name}" already exists`);
    }

    return await this.dbService.db.transaction(async (tx) => {
      // Create the tenant
      const createdTenant = await this.tenantRepository.createWithTx({ name: data.name }, tx);

      try {
        // Create user in Cognito
        const signUpResult = await this.cognitoService.signUp({
          username: data.user.username,
          email: data.user.email,
          password: data.user.password,
          attributes: {
            'custom:tenant_id': createdTenant.id,
          },
        });

        // Create user in the database
        const user = await this.userRepository.createWithTx(
          {
            email: data.user.email,
            username: data.user.username,
            cognito_sub: signUpResult.sub,
            isActive: true,
          },
          tx,
        );

        // Create user-tenant association
        await tx.insert(userTenants).values({
          userId: user.id,
          tenantId: createdTenant.id,
          cognitoSub: signUpResult.sub,
          isActive: true,
        });

        return createdTenant;
      } catch (error) {
        // If there's an error with Cognito or user creation, the transaction will roll back
        this.logger.error('Error creating tenant with user', {
          error,
          tenantId: createdTenant.id,
        });
        throw error; // Re-throw to trigger transaction rollback
      }
    });
  }

  /**
   * Updates an existing tenant.
   * @param id - ID of the tenant to update
   * @param data - Data for updating the tenant
   * @returns Promise resolving to the updated Tenant object
   * @throws NotFoundError if tenant doesn't exist
   * @throws ConflictError if new name already exists
   */
  async update(id: TenantId, data: UpdateTenantDto): Promise<Tenant> {
    this.logger.info('Updating tenant', { id });

    // Verify tenant exists before update
    await this.findById(id);

    // If name is being updated, check for duplicates
    if (data.name) {
      const existingTenant = await this.tenantRepository.findByName(data.name);
      if (existingTenant && existingTenant.id !== id) {
        throw new ConflictError(`Tenant with name "${data.name}" already exists`);
      }
    }

    return this.tenantRepository.update(id, data);
  }

  /**
   * Deletes a tenant by their ID.
   * @param id - ID of the tenant to delete
   * @throws NotFoundError if tenant doesn't exist
   */
  async delete(id: TenantId): Promise<void> {
    this.logger.info('Deleting tenant', { id });

    // Verify tenant exists before deletion
    await this.findById(id);

    await this.tenantRepository.delete(id);
  }
}
