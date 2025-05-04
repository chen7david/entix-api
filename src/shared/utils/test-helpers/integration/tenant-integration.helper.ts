import { IntegrationTestManager } from '@shared/utils/test-helpers/integration-test-manager.util';
import type { CreateTenantDto } from '@domains/tenant/tenant.dto';
import { TenantFactory } from '@shared/utils/test-helpers/factories/tenant.factory';

/**
 * Interface for createTestTenants options
 */
interface CreateTestTenantsOptions {
  count: number;
  overrides?: Partial<CreateTenantDto>;
}

/**
 * Helper functions for tenant-related integration tests
 */
export class TenantIntegrationHelper {
  /**
   * Helper function to create a tenant via API and return the response and created ID
   *
   * @param manager - Integration test manager instance
   * @param overrides - Optional properties to override in the tenant DTO
   * @returns Response and the ID of the created tenant along with the payload
   */
  static async createTestTenant(
    manager: IntegrationTestManager,
    overrides?: Partial<CreateTenantDto>,
  ) {
    const payload = TenantFactory.createTenantDto(overrides);
    const response = await manager.request.post('/api/v1/tenants').send(payload);
    const id = response.body.id;

    return { response, id, payload };
  }

  /**
   * Creates multiple test tenants via the API
   *
   * @param manager - Integration test manager instance
   * @param options - Options including count and property overrides
   * @returns Array of created tenant objects with id, payload, and response
   */
  static async createTestTenants(
    manager: IntegrationTestManager,
    options: CreateTestTenantsOptions,
  ) {
    const tenants = [];
    const { count, overrides } = options;

    for (let i = 0; i < count; i++) {
      const tenant = await this.createTestTenant(manager, overrides);
      tenants.push(tenant);
    }

    return tenants;
  }

  /**
   * Helper function to create a tenant that can be used for user tests
   * that require a tenantId reference
   *
   * @param manager - Integration test manager instance
   * @returns ID of the created tenant
   */
  static async createTestTenantForUser(manager: IntegrationTestManager) {
    const { id } = await this.createTestTenant(manager);
    return id;
  }
}
