import { IntegrationTestManager } from '@tests/utils/integration-test-manager.util';
import { faker } from '@faker-js/faker';
import type {
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  AssignRoleToUserDto,
} from '@domains/user/user.dto';
import type { RoleDto, CreateRoleDto as CreateRoleAPIDto } from '@domains/role/role.dto';
import { Container } from 'typedi';
import { usersTable } from '@domains/user/user.schema';
import { DatabaseService } from '@shared/services/database/database.service';
import { CognitoService } from '@shared/services/cognito/cognito.service';
import { createMockCognitoService } from '@tests/mocks/cognito.service.mock';

let manager: IntegrationTestManager;
let dbService: DatabaseService;
let mockCognitoService: jest.Mocked<CognitoService>;

const MOCK_COGNITO_SUB = 'mock-cognito-sub-integration-test';
const MOCK_COGNITO_SUB_USER_ASSOC = 'mock-cognito-sub-user-role-test';

// Helper to create a user for tests
async function createUser(payload?: Partial<CreateUserDto>): Promise<UserDto> {
  const defaultPayload: CreateUserDto = {
    email: faker.internet.email(),
    username: faker.internet.username(),
    password: 'ValidPassword123!',
    ...payload,
  };
  mockCognitoService.signUp.mockResolvedValueOnce({
    sub: MOCK_COGNITO_SUB_USER_ASSOC + faker.string.uuid(),
    userConfirmed: false,
  });
  const response = await manager.request.post('/api/v1/users').send(defaultPayload);
  expect(response.status).toBe(201);
  return response.body as UserDto;
}

// Helper to create a role for tests
async function createRole(name: string): Promise<RoleDto> {
  const payload: CreateRoleAPIDto = { name };
  const response = await manager.request.post('/api/v1/roles').send(payload);
  expect(response.status).toBe(201);
  return response.body as RoleDto;
}

beforeAll(async () => {
  mockCognitoService = createMockCognitoService();
  Container.set(CognitoService, mockCognitoService);

  manager = Container.get(IntegrationTestManager);
  dbService = Container.get(DatabaseService);
});

beforeEach(() => {
  mockCognitoService.signUp.mockReset();
});

afterAll(async () => {
  await manager.close();
});

describe('User API - Integration', () => {
  describe('POST /api/v1/users', () => {
    it('should create a new user and return 201 with user data including cognito_sub', async () => {
      const payload: CreateUserDto = {
        email: faker.internet.email(),
        username: faker.internet.username(),
        password: 'ValidPassword123!',
      };

      mockCognitoService.signUp.mockResolvedValue({
        sub: MOCK_COGNITO_SUB,
        userConfirmed: false,
      });

      const response = await manager.request.post('/api/v1/users').send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(payload.email);
      expect(response.body.username).toBe(payload.username);
      expect(response.body.isActive).toBe(true);
      expect(response.body.cognito_sub).toBe(MOCK_COGNITO_SUB);
      expect(response.body).not.toHaveProperty('password');

      expect(mockCognitoService.signUp).toHaveBeenCalledWith({
        username: payload.username,
        email: payload.email,
        password: payload.password,
      });
    });

    it('should return 409 if CognitoService throws UsernameExistsException (mapped to ConflictError)', async () => {
      const payload: CreateUserDto = {
        email: faker.internet.email(),
        username: 'existinguser',
        password: 'ValidPassword123!',
      };

      const cognitoError = new Error('Username already exists.');
      cognitoError.name = 'UsernameExistsException';
      mockCognitoService.signUp.mockRejectedValue(cognitoError);

      const response = await manager.request.post('/api/v1/users').send(payload);
      expect(response.status).toBe(409);
    });

    it('should return 422 for invalid request body (e.g., missing password)', async () => {
      const response = await manager.request.post('/api/v1/users').send({
        email: faker.internet.email(),
        username: faker.internet.username(),
      });
      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('GET /api/v1/users', () => {
    beforeEach(async () => {
      await dbService.db.delete(usersTable);
      mockCognitoService.signUp.mockReset();
    });

    it('should return empty array when no users exist', async () => {
      const response = await manager.request.get('/api/v1/users');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return a list containing newly created users', async () => {
      const createPayload: CreateUserDto = {
        email: faker.internet.email(),
        username: faker.internet.username(),
        password: 'ValidPassword123!',
      };
      const mockSub = faker.string.uuid();
      mockCognitoService.signUp.mockResolvedValue({ sub: mockSub, userConfirmed: false });

      const createResponse = await manager.request.post('/api/v1/users').send(createPayload);
      expect(createResponse.status).toBe(201);
      const createdUser = createResponse.body as UserDto;

      const getRes = await manager.request.get('/api/v1/users');
      expect(getRes.status).toBe(200);
      expect(Array.isArray(getRes.body)).toBe(true);
      expect(getRes.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: createdUser.id,
            email: createdUser.email,
            username: createdUser.username,
            cognito_sub: mockSub,
            isActive: true,
          }),
        ]),
      );
    });
  });

  describe('GET /api/v1/users/:id', () => {
    beforeEach(async () => {
      await dbService.db.delete(usersTable);
      mockCognitoService.signUp.mockReset();
    });
    it('should return 404 for non-existent user', async () => {
      const nonExistentId = faker.string.uuid();
      const response = await manager.request.get(`/api/v1/users/${nonExistentId}`);
      expect(response.status).toBe(404);
    });

    it('should return 200 for an existing user', async () => {
      const createPayload: CreateUserDto = {
        email: faker.internet.email(),
        username: faker.internet.username(),
        password: 'ValidPassword123!',
      };
      const mockSub = faker.string.uuid();
      mockCognitoService.signUp.mockResolvedValue({ sub: mockSub, userConfirmed: false });
      const createResponse = await manager.request.post('/api/v1/users').send(createPayload);
      const createdUser = createResponse.body as UserDto;

      const response = await manager.request.get(`/api/v1/users/${createdUser.id}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdUser.id);
      expect(response.body.email).toBe(createdUser.email);
      expect(response.body.cognito_sub).toBe(mockSub);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    beforeEach(async () => {
      await dbService.db.delete(usersTable);
      mockCognitoService.signUp.mockReset();
    });
    it('should update existing user (e.g. isActive) and return 200', async () => {
      const createPayload: CreateUserDto = {
        email: faker.internet.email(),
        username: faker.internet.username(),
        password: 'ValidPassword123!',
      };
      mockCognitoService.signUp.mockResolvedValue({
        sub: faker.string.uuid(),
        userConfirmed: false,
      });
      const createResponse = await manager.request.post('/api/v1/users').send(createPayload);
      const createdUser = createResponse.body as UserDto;

      const updatePayload: UpdateUserDto = { isActive: false };
      const response = await manager.request
        .put(`/api/v1/users/${createdUser.id}`)
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body.isActive).toBe(false);
      expect(response.body.id).toBe(createdUser.id);
    });

    it('should return 422 for invalid update payload (e.g. trying to update username)', async () => {
      const createPayload: CreateUserDto = {
        email: faker.internet.email(),
        username: faker.internet.username(),
        password: 'ValidPassword123!',
      };
      mockCognitoService.signUp.mockResolvedValue({
        sub: faker.string.uuid(),
        userConfirmed: false,
      });
      const createResponse = await manager.request.post('/api/v1/users').send(createPayload);
      const createdUser = createResponse.body as UserDto;

      const response = await manager.request
        .put(`/api/v1/users/${createdUser.id}`)
        .send({ username: 'new-username-not-allowed' });
      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    beforeEach(async () => {
      await dbService.db.delete(usersTable);
      mockCognitoService.signUp.mockReset();
    });
    it('should soft delete an existing user and return 204', async () => {
      const createPayload: CreateUserDto = {
        email: faker.internet.email(),
        username: faker.internet.username(),
        password: 'ValidPassword123!',
      };
      mockCognitoService.signUp.mockResolvedValue({
        sub: faker.string.uuid(),
        userConfirmed: false,
      });
      const createResponse = await manager.request.post('/api/v1/users').send(createPayload);
      const createdUser = createResponse.body as UserDto;

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

  describe('User-Role Associations (/api/v1/users/:id/roles)', () => {
    let testUser: UserDto;
    let role1: RoleDto;
    let role2: RoleDto;

    beforeEach(async () => {
      testUser = await createUser();
      role1 = await createRole('RoleAssoc1_' + faker.string.alphanumeric(3));
      role2 = await createRole('RoleAssoc2_' + faker.string.alphanumeric(3));
    });

    it('should assign a role to a user and return 204', async () => {
      const assignPayload: AssignRoleToUserDto = { roleId: role1.id };
      const response = await manager.request
        .post(`/api/v1/users/${testUser.id}/roles`)
        .send(assignPayload);
      expect(response.status).toBe(204);

      // Verify by fetching roles for the user
      const getRolesResponse = await manager.request.get(`/api/v1/users/${testUser.id}/roles`);
      expect(getRolesResponse.status).toBe(200);
      expect(getRolesResponse.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: role1.id })]),
      );
    });

    it('should return 404 when assigning role to non-existent user', async () => {
      const assignPayload: AssignRoleToUserDto = { roleId: role1.id };
      const nonExistentUserId = faker.string.uuid();
      const response = await manager.request
        .post(`/api/v1/users/${nonExistentUserId}/roles`)
        .send(assignPayload);
      expect(response.status).toBe(404);
    });

    it('should return 404 when assigning non-existent role to a user', async () => {
      const nonExistentRoleId = 88888;
      const assignPayload: AssignRoleToUserDto = { roleId: nonExistentRoleId };
      const response = await manager.request
        .post(`/api/v1/users/${testUser.id}/roles`)
        .send(assignPayload);
      expect(response.status).toBe(404);
    });

    it('should get all roles for a user', async () => {
      await manager.request.post(`/api/v1/users/${testUser.id}/roles`).send({ roleId: role1.id });
      await manager.request.post(`/api/v1/users/${testUser.id}/roles`).send({ roleId: role2.id });

      const response = await manager.request.get(`/api/v1/users/${testUser.id}/roles`);
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: role1.id, name: role1.name }),
          expect.objectContaining({ id: role2.id, name: role2.name }),
        ]),
      );
    });

    it('should return empty array if user has no roles', async () => {
      const response = await manager.request.get(`/api/v1/users/${testUser.id}/roles`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should remove a role from a user and return 204', async () => {
      await manager.request.post(`/api/v1/users/${testUser.id}/roles`).send({ roleId: role1.id });

      const deleteResponse = await manager.request.delete(
        `/api/v1/users/${testUser.id}/roles/${role1.id}`,
      );
      expect(deleteResponse.status).toBe(204);

      const getRolesResponse = await manager.request.get(`/api/v1/users/${testUser.id}/roles`);
      expect(getRolesResponse.status).toBe(200);
      expect(getRolesResponse.body).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ id: role1.id })]),
      );
    });

    it('should return 204 even if trying to remove a role not assigned to user', async () => {
      const unassignedRoleId = role2.id;
      const response = await manager.request.delete(
        `/api/v1/users/${testUser.id}/roles/${unassignedRoleId}`,
      );
      expect(response.status).toBe(204);
    });

    it('should return 404 when removing role from a non-existent user', async () => {
      const nonExistentUserId = faker.string.uuid();
      const response = await manager.request.delete(
        `/api/v1/users/${nonExistentUserId}/roles/${role1.id}`,
      );
      expect(response.status).toBe(404);
    });
  });
});
