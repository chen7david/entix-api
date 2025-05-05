import { IntegrationTestManager } from '@tests/utils/integration-test-manager.util';
import { faker } from '@faker-js/faker';
import type { UserDto } from '@domains/user/user.dto';
import { Container } from 'typedi';
import { createUserFactory } from '@tests/factories/user.factory';
import { users } from '@domains/user/user.schema';
import { userTenants } from '@domains/tenant/user-tenant.schema'; // Import userTenants schema
import { sql } from 'drizzle-orm';

let manager: IntegrationTestManager;

beforeAll(async () => {
  manager = Container.get(IntegrationTestManager);
});

// Updated beforeEach: Delete from user_tenants first, then users
beforeEach(async () => {
  await manager.db.db.delete(userTenants).where(sql`true`); // Clear dependent table
  await manager.db.db.delete(users).where(sql`true`); // Clear users table
});

afterAll(async () => {
  await manager.close();
});

describe('User API - Integration', () => {
  describe('POST /api/v1/users', () => {
    it('should create a new user and return 201', async () => {
      const payload = createUserFactory();

      const response = await manager.request.post('/api/v1/users').send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toMatchObject({
        email: payload.email,
        username: payload.username,
        isActive: true,
      });
    });

    it('should return 422 for invalid request body', async () => {
      const response = await manager.request.post('/api/v1/users').send({ email: 'bad' });
      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('GET /api/v1/users', () => {
    it('should return empty array when no users exist', async () => {
      const response = await manager.request.get('/api/v1/users');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should return a list containing new users', async () => {
      const payload = createUserFactory({ isActive: false });
      const postRes = await manager.request.post('/api/v1/users').send(payload);
      expect(postRes.status).toBe(201);
      const createdUser = postRes.body as UserDto;

      const getRes = await manager.request.get('/api/v1/users');
      expect(getRes.status).toBe(200);
      expect(Array.isArray(getRes.body)).toBe(true);
      const usersInResponse = getRes.body as UserDto[];
      expect(usersInResponse.some((u) => u.id === createdUser.id)).toBe(true);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const nonExistentId = faker.string.uuid();
      const response = await manager.request.get(`/api/v1/users/${nonExistentId}`);
      expect(response.status).toBe(404);
    });

    it('should return 200 for an existing user', async () => {
      const payload = createUserFactory();
      const postRes = await manager.request.post('/api/v1/users').send(payload);
      expect(postRes.status).toBe(201);
      const createdUser = postRes.body as UserDto;

      const response = await manager.request.get(`/api/v1/users/${createdUser.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', createdUser.id);
      expect(response.body).toHaveProperty('email', payload.email);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should update existing user and return 201', async () => {
      const payload = createUserFactory();
      const postRes = await manager.request.post('/api/v1/users').send(payload);
      expect(postRes.status).toBe(201);
      const createdUser = postRes.body as UserDto;

      const update = { username: 'UpdatedUsernameTest' };
      const response = await manager.request.put(`/api/v1/users/${createdUser.id}`).send(update);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('username', update.username);

      const getRes = await manager.request.get(`/api/v1/users/${createdUser.id}`);
      expect(getRes.body.username).toBe(update.username);
    });

    it('should return 422 for invalid email on update', async () => {
      const payload = createUserFactory();
      const postRes = await manager.request.post('/api/v1/users').send(payload);
      expect(postRes.status).toBe(201);
      const createdUser = postRes.body as UserDto;

      const response = await manager.request
        .put(`/api/v1/users/${createdUser.id}`)
        .send({ email: 'not-an-email' });
      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete an existing user and return 204', async () => {
      const payload = createUserFactory();
      const postRes = await manager.request.post('/api/v1/users').send(payload);
      expect(postRes.status).toBe(201);
      const createdUser = postRes.body as UserDto;

      const beforeRes = await manager.request.get(`/api/v1/users/${createdUser.id}`);
      expect(beforeRes.status).toBe(200);

      const delRes = await manager.request.delete(`/api/v1/users/${createdUser.id}`);
      expect(delRes.status).toBe(204);

      const afterRes = await manager.request.get(`/api/v1/users/${createdUser.id}`);
      expect(afterRes.status).toBe(404);
    });

    it('should return 404 when deleting non-existent user', async () => {
      const nonExistentId = faker.string.uuid();
      const response = await manager.request.delete(`/api/v1/users/${nonExistentId}`);
      expect(response.status).toBe(404);
    });
  });
});
