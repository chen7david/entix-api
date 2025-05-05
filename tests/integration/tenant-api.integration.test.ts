import 'reflect-metadata';
import { Container } from 'typedi';
// import { AppService } from '@shared/services/app/app.service';
// import { DatabaseService } from '@shared/services/database/database.service';
import { IntegrationTestManager } from '@tests/utils/integration-test-manager.util';
import { faker } from '@faker-js/faker';
import { CreateTenantDto } from '@domains/tenant/tenant.dto';
import { CognitoService } from '@shared/services/cognito/cognito.service';
// import { ConfigService } from '@shared/services/config/config.service';
// import { createMockLogger } from '@shared/utils/test-helpers/mocks/mock-logger.util';

// Mock CognitoService to avoid actual AWS calls during tests
// jest.mock('@shared/services/cognito/cognito.service', () => {
//   return {
//     CognitoService: jest.fn().mockImplementation(() => {
//       return {
//         signUp: jest.fn().mockResolvedValue({
//           sub: faker.string.uuid(),
//           userSub: faker.string.uuid(),
//           userConfirmed: false,
//         }),
//       };
//     }),
//   };
// });

describe('Tenant API', () => {
  //   let manager: IntegrationTestManager;

  // Helper to create tenant data with unique name for each test
  const createTenantData = (): CreateTenantDto => ({
    name: `Test Tenant ${faker.string.uuid()}`,
    user: {
      email: faker.internet.email(),
      username: faker.internet.username(),
      password: 'Password123!',
      confirmPassword: 'Password123!',
    },
  });

  let manager: IntegrationTestManager;

  beforeAll(async () => {
    Container.reset();
    Container.set(
      CognitoService,
      jest.fn().mockImplementation(() => {
        return {
          signUp: jest.fn().mockResolvedValue({
            sub: faker.string.uuid(),
            userSub: faker.string.uuid(),
            userConfirmed: false,
          }),
        };
      }),
    );
    manager = Container.get(IntegrationTestManager);
  });

  beforeEach(async () => {
    await manager.beginTransaction();
  });

  afterEach(async () => {
    await manager.rollbackTransaction();
  });

  afterAll(async () => {
    await manager.close();
  });

  //   beforeAll(async () => {
  //     // Reset container and initialize test manager before all tests
  //     Container.reset();

  //     // Register mock services
  //     const mockConfigService = {
  //       get: jest.fn(() => 'mock-value'),
  //     } as unknown as ConfigService;

  //     const mockLoggerService = createMockLogger();

  //     Container.set(CognitoService, new CognitoService(mockConfigService, mockLoggerService));

  //     // Initialize test manager
  //     manager = Container.get(IntegrationTestManager);
  //   });

  //   beforeEach(async () => {
  //     // Begin a new transaction for each test
  //     await manager.beginTransaction();
  //   });

  //   afterEach(async () => {
  //     // Rollback transaction after each test to keep the database clean
  //     await manager.rollbackTransaction();
  //   });

  //   afterAll(async () => {
  //     // Clean up resources after all tests
  //     await manager.close();
  //   });

  describe('POST /api/v1/tenants', () => {
    it('should create a new tenant successfully', async () => {
      // Arrange
      const validTenant = createTenantData();

      // Act
      const response = await manager.request.post('/api/v1/tenants').send(validTenant).expect(201);

      // Assert
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', validTenant.name);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 422 for invalid tenant data', async () => {
      // Arrange
      const invalidTenant = {
        name: '', // Empty name should be invalid
        user: {
          email: 'not-an-email',
          username: 'u', // Too short
          password: 'short',
          confirmPassword: 'different', // Doesn't match password
        },
      };

      // Act & Assert
      const response = await manager.request.post('/api/v1/tenants').send(invalidTenant);
      expect(response.status).toBe(422);
    });

    it('should return 409 when creating a tenant with an existing name', async () => {
      // Arrange - First create a tenant
      const tenantData = createTenantData();

      // Create first tenant
      const response = await manager.request.post('/api/v1/tenants').send(tenantData);
      expect(response.status).toBe(201);

      // Create a second tenant with the same name but different user details
      const duplicateTenant = {
        name: tenantData.name, // Same name as the first tenant
        user: {
          email: faker.internet.email(),
          username: faker.internet.username(),
          password: 'Password123!',
          confirmPassword: 'Password123!',
        },
      };

      // Act & Assert - Should return conflict error
      await manager.request.post('/api/v1/tenants').send(duplicateTenant).expect(409);
    });
  });

  describe('GET /api/v1/tenants', () => {
    it('should return a list of tenants', async () => {
      // Arrange - Create a tenant first
      await manager.request.post('/api/v1/tenants').send(createTenantData()).expect(201);

      // Act
      const response = await manager.request.get('/api/v1/tenants').expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });
  });

  describe('GET /api/v1/tenants/:id', () => {
    it('should return a specific tenant by ID', async () => {
      // Arrange - Create a tenant and get its ID
      const tenantData = createTenantData();
      const createResponse = await manager.request
        .post('/api/v1/tenants')
        .send(tenantData)
        .expect(201);

      const id = createResponse.body.id;

      // Act
      const response = await manager.request.get(`/api/v1/tenants/${id}`).expect(200);

      // Assert
      expect(response.body).toHaveProperty('id', id);
      expect(response.body).toHaveProperty('name', tenantData.name);
    });

    it('should return 404 for a non-existent tenant ID', async () => {
      // Act & Assert
      const response = await manager.request.get(`/api/v1/tenants/${faker.string.uuid()}`);
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/tenants/:id', () => {
    it('should update a tenant successfully', async () => {
      // Arrange - Create a tenant first
      const tenantData = createTenantData();
      const createResponse = await manager.request
        .post('/api/v1/tenants')
        .send(tenantData)
        .expect(201);

      const id = createResponse.body.id;
      const updateData = { name: `Updated Tenant ${faker.string.uuid()}` };

      // Act
      const response = await manager.request
        .put(`/api/v1/tenants/${id}`)
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('id', id);
      expect(response.body).toHaveProperty('name', updateData.name);
    });

    it('should return 404 when updating a non-existent tenant', async () => {
      // Act & Assert
      const response = await manager.request
        .put(`/api/v1/tenants/${faker.string.uuid()}`)
        .send({ name: 'Updated Name' });
      expect(response.status).toBe(404);
    });

    it('should return 409 when updating to a name that already exists', async () => {
      // Arrange - Create two tenants
      const tenant1Data = createTenantData();
      const tenant1 = await manager.request.post('/api/v1/tenants').send(tenant1Data);
      expect(tenant1.status).toBe(201);

      const tenant2Data = createTenantData();
      const tenant2 = await manager.request.post('/api/v1/tenants').send(tenant2Data);
      expect(tenant2.status).toBe(201);

      // Try to update tenant2 to use tenant1's name
      const response = await manager.request
        .put(`/api/v1/tenants/${tenant2.body.id}`)
        .send({ name: tenant1.body.name });
      expect(response.status).toBe(409);
    });
  });

  describe('DELETE /api/v1/tenants/:id', () => {
    it('should delete a tenant successfully', async () => {
      // Arrange - Create a tenant first
      const tenantData = createTenantData();
      const createResponse = await manager.request.post('/api/v1/tenants').send(tenantData);
      expect(createResponse.status).toBe(201);

      const id = createResponse.body.id;

      // Act & Assert - Delete should succeed
      const deleteResponse = await manager.request.delete(`/api/v1/tenants/${id}`);
      expect(deleteResponse.status).toBe(204);

      // Verify tenant is deleted
      const response = await manager.request.get(`/api/v1/tenants/${id}`);
      expect(response.status).toBe(404);
    });

    it('should return 404 when deleting a non-existent tenant', async () => {
      // Act & Assert
      const response = await manager.request.delete(`/api/v1/tenants/${faker.string.uuid()}`);
      expect(response.status).toBe(404);
    });
  });
});
