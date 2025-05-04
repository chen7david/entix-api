import { faker } from '@faker-js/faker';
import { Tenant } from '@domains/tenant/tenant.model';
import { CreateTenantDto, UpdateTenantDto } from '@domains/tenant/tenant.dto';

/**
 * Tenant factory for generating test data.
 * Provides standardized methods to create Tenant objects and DTOs.
 */
export class TenantFactory {
  /**
   * Create a mock tenant with randomized data.
   * @param overrides - Optional properties to override in the created tenant
   * @returns A complete Tenant object
   */
  static createMockTenant(overrides?: Partial<Tenant>): Tenant {
    const defaultTenant: Tenant = {
      id: faker.string.uuid(),
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
      deletedAt: null,
    };

    return { ...defaultTenant, ...overrides };
  }

  /**
   * Create a tenant creation DTO with randomized data.
   * @param overrides - Optional properties to override in the DTO
   * @returns A complete CreateTenantDto object
   */
  static createTenantDto(overrides?: Partial<CreateTenantDto>): CreateTenantDto {
    const defaultDto: CreateTenantDto = {
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      adminUser: {
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: 'Password123!',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      },
    };

    return { ...defaultDto, ...overrides };
  }

  /**
   * Create a tenant update DTO with partial properties.
   * @param overrides - Properties to include in the update DTO
   * @returns A partial UpdateTenantDto object
   */
  static updateTenantDto(overrides: Partial<UpdateTenantDto> = {}): UpdateTenantDto {
    return overrides;
  }

  /**
   * Create multiple mock tenants with randomized data.
   * @param count - Number of tenants to create
   * @param overrides - Optional properties to override in all created tenants
   * @returns An array of Tenant objects
   */
  static createMockTenants(count: number, overrides?: Partial<Tenant>): Tenant[] {
    return Array.from({ length: count }, () => this.createMockTenant(overrides));
  }
}
