import { IntegrationTestManager } from '@tests/utils/integration-test-manager.util';
import { faker } from '@faker-js/faker'; // Re-added faker import
import type { UserDto } from '@domains/user/user.dto';
import { Container } from 'typedi';
import { users } from '@domains/user/user.schema';
import { UserFactory } from '@tests/factories/user.factory';
import { DatabaseService } from '@shared/services/database/database.service'; // Import DatabaseService

let manager: IntegrationTestManager;
let userFactory: UserFactory;
let dbService: DatabaseService; // Declare DatabaseService instance

beforeAll(async () => {
  manager = Container.get(IntegrationTestManager);
  userFactory = new UserFactory(manager);
  dbService = Container.get(DatabaseService); // Get DatabaseService instance
});

afterAll(async () => {
  await manager.close();
});

describe('User API - Integration', () => {
  describe('POST /api/v1/users', () => {
    it('should create a new user and return 201', async () => {
      // Use factory to build payload
      const payload = userFactory.build({ isActive: true });

      const response = await manager.request.post('/api/v1/users').send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toMatchObject({
        email: payload.email,
        username: payload.username,
        isActive: payload.isActive,
      });
    });

    it('should return 422 for invalid request body', async () => {
      const response = await manager.request.post('/api/v1/users').send({ email: 'bad' });
      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('GET /api/v1/users', () => {
    beforeEach(async () => {
      // Clear users table using the injected dbService
      await dbService.db.delete(users);
    });

    it('should return empty array when no users exist', async () => {
      // Test remains the same, relies on beforeEach cleanup
      const response = await manager.request.get('/api/v1/users');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should return a list containing new users', async () => {
      // Use factory to create user via API
      const createdUser = await userFactory.create({ isActive: false });

      const getRes = await manager.request.get('/api/v1/users');
      expect(getRes.status).toBe(200);
      const userIds = getRes.body.map((u: UserDto) => u.id);
      expect(userIds).toContain(createdUser.id); // Use ID from factory result
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const nonExistentId = faker.string.uuid(); // Keep faker import if this is used
      const response = await manager.request.get(`/api/v1/users/${nonExistentId}`);
      expect(response.status).toBe(404);
    });

    it('should return 200 for an existing user', async () => {
      // Use factory to create user via API
      const createdUser = await userFactory.create({ isActive: true });

      const response = await manager.request.get(`/api/v1/users/${createdUser.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', createdUser.id);
      expect(response.body).toHaveProperty('email', createdUser.email); // Assert against factory result
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should update existing user and return 201', async () => {
      // Use factory to create user via API
      const createdUser = await userFactory.create({ isActive: true });

      const update = { username: 'UpdatedUsername' };
      const response = await manager.request.put(`/api/v1/users/${createdUser.id}`).send(update);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('username', update.username);
    });

    it('should return 422 for invalid email on update', async () => {
      // Use factory to create user via API
      const createdUser = await userFactory.create({ isActive: true });

      const response = await manager.request
        .put(`/api/v1/users/${createdUser.id}`)
        .send({ email: 'not-an-email' });
      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete an existing user and return 204', async () => {
      // Use factory to create user via API
      const createdUser = await userFactory.create({ isActive: true });

      // Verify record exists before delete
      const beforeRes = await manager.request.get(`/api/v1/users/${createdUser.id}`);
      expect(beforeRes.status).toBe(200);

      // Perform the delete operation
      const delRes = await manager.request.delete(`/api/v1/users/${createdUser.id}`);
      expect(delRes.status).toBe(204);

      // Optional: Verify record is marked as deleted in DB if needed
      // try {
      //   await dbService.db.select().from(users).where(eq(users.id, createdUser.id)).execute();
      //   // Should throw NotFoundError or return record with deletedAt set, depending on repo logic
      // } catch (error) {
      //    expect(error).toBeInstanceOf(NotFoundError) // Or check deletedAt
      // }
    });

    it('should return 404 when deleting non-existent user', async () => {
      const nonExistentId = faker.string.uuid(); // Keep faker import if this is used
      const response = await manager.request.delete(`/api/v1/users/${nonExistentId}`);
      expect(response.status).toBe(404);
    });
  });
});
