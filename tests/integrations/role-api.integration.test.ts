import { IntegrationTestManager } from '@tests/utils/integration-test-manager.util';
import { faker } from '@faker-js/faker';
import type {
  RoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionToRoleDto,
} from '@domains/role/role.dto';
import type {
  PermissionDto,
  CreatePermissionDto as CreatePermissionAPIDto,
} from '@domains/permission/permission.dto';
import { Container } from 'typedi';
import { rolesTable, rolePermissionsTable } from '@domains/role/role.schema';
import { permissionsTable } from '@domains/permission/permission.schema';
import { DatabaseService } from '@shared/services/database/database.service';

let manager: IntegrationTestManager;
let dbService: DatabaseService;

// Helper function to create a role for tests
async function createRole(name: string): Promise<RoleDto> {
  const response = await manager.request.post('/api/v1/roles').send({ name });
  expect(response.status).toBe(201);
  return response.body as RoleDto;
}

// Helper function to create a permission for tests
async function createPermission(name: string): Promise<PermissionDto> {
  const payload: CreatePermissionAPIDto = { name };
  const response = await manager.request.post('/api/v1/permissions').send(payload);
  expect(response.status).toBe(201);
  return response.body as PermissionDto;
}

beforeAll(async () => {
  manager = Container.get(IntegrationTestManager);
  dbService = Container.get(DatabaseService);
});

beforeEach(async () => {
  // Clear relevant tables before each test to ensure isolation
  await dbService.db.delete(rolePermissionsTable);
  await dbService.db.delete(permissionsTable);
  await dbService.db.delete(rolesTable);
});

afterAll(async () => {
  await manager.close();
});

describe('Role API - Integration', () => {
  describe('POST /api/v1/roles', () => {
    it('should create a new role and return 201 with role data', async () => {
      const payload: CreateRoleDto = {
        name: 'TestRole_' + faker.string.alphanumeric(5),
      };

      const response = await manager.request.post('/api/v1/roles').send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(payload.name);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body).not.toHaveProperty('deletedAt');
    });

    it('should return 409 if role name already exists', async () => {
      const roleName = 'UniqueRole_' + faker.string.alphanumeric(5);
      const payload: CreateRoleDto = { name: roleName };
      await manager.request.post('/api/v1/roles').send(payload); // Create first role

      const response = await manager.request.post('/api/v1/roles').send(payload); // Attempt to create again
      expect(response.status).toBe(409); // ConflictError
    });

    it('should return 422 for invalid request body (e.g., name too short)', async () => {
      const response = await manager.request.post('/api/v1/roles').send({ name: 'a' });
      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('GET /api/v1/roles', () => {
    it('should return empty array when no roles exist', async () => {
      const response = await manager.request.get('/api/v1/roles');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return a list containing created roles', async () => {
      const role1Payload: CreateRoleDto = { name: 'RoleA_' + faker.string.alphanumeric(3) };
      const role2Payload: CreateRoleDto = { name: 'RoleB_' + faker.string.alphanumeric(3) };
      await manager.request.post('/api/v1/roles').send(role1Payload);
      await manager.request.post('/api/v1/roles').send(role2Payload);

      const getRes = await manager.request.get('/api/v1/roles');
      expect(getRes.status).toBe(200);
      expect(Array.isArray(getRes.body)).toBe(true);
      expect(getRes.body.length).toBe(2);
      expect(getRes.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: role1Payload.name }),
          expect.objectContaining({ name: role2Payload.name }),
        ]),
      );
    });
  });

  describe('GET /api/v1/roles/:id', () => {
    it('should return 404 for non-existent role', async () => {
      const nonExistentId = 999999;
      const response = await manager.request.get(`/api/v1/roles/${nonExistentId}`);
      expect(response.status).toBe(404);
    });

    it('should return 200 and the role for an existing role ID', async () => {
      const createPayload: CreateRoleDto = { name: 'SpecificRole_' + faker.string.alphanumeric(4) };
      const createResponse = await manager.request.post('/api/v1/roles').send(createPayload);
      const createdRole = createResponse.body as RoleDto;

      const response = await manager.request.get(`/api/v1/roles/${createdRole.id}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdRole.id);
      expect(response.body.name).toBe(createdRole.name);
    });
  });

  describe('PUT /api/v1/roles/:id', () => {
    it('should update an existing role and return 200 with updated data', async () => {
      const createPayload: CreateRoleDto = { name: 'RoleToUpdate_' + faker.string.alphanumeric(4) };
      const createResponse = await manager.request.post('/api/v1/roles').send(createPayload);
      const createdRole = createResponse.body as RoleDto;

      const updatePayload: UpdateRoleDto = { name: 'Updated_' + createdRole.name };
      const response = await manager.request
        .put(`/api/v1/roles/${createdRole.id}`)
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updatePayload.name);
      expect(response.body.id).toBe(createdRole.id);
      // Ensure updatedAt is different from createdAt or the original updatedAt
      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(response.body.createdAt).getTime(),
      );
    });

    it('should return 409 if updated name conflicts with another existing role', async () => {
      const role1Payload: CreateRoleDto = {
        name: 'Role1ForConflict_' + faker.string.alphanumeric(3),
      };
      const role2Payload: CreateRoleDto = {
        name: 'Role2ForConflict_' + faker.string.alphanumeric(3),
      };
      await manager.request.post('/api/v1/roles').send(role1Payload);
      const role2Response = await manager.request.post('/api/v1/roles').send(role2Payload);
      const role2 = role2Response.body as RoleDto;

      const updatePayload: UpdateRoleDto = { name: role1Payload.name }; // Try to update role2 to role1's name
      const response = await manager.request.put(`/api/v1/roles/${role2.id}`).send(updatePayload);
      expect(response.status).toBe(409);
    });
  });

  describe('DELETE /api/v1/roles/:id', () => {
    it('should soft delete an existing role and return 204', async () => {
      const createPayload: CreateRoleDto = { name: 'RoleToDelete_' + faker.string.alphanumeric(4) };
      const createResponse = await manager.request.post('/api/v1/roles').send(createPayload);
      const createdRole = createResponse.body as RoleDto;

      const delRes = await manager.request.delete(`/api/v1/roles/${createdRole.id}`);
      expect(delRes.status).toBe(204);

      // Verify role is not returned by GET /:id (due to soft delete)
      const afterRes = await manager.request.get(`/api/v1/roles/${createdRole.id}`);
      expect(afterRes.status).toBe(404);

      // Also verify it's not in GET / (list)
      const listRes = await manager.request.get('/api/v1/roles');
      expect(listRes.body.find((r: RoleDto) => r.id === createdRole.id)).toBeUndefined();
    });

    it('should return 404 when deleting non-existent role', async () => {
      const nonExistentId = 888888;
      const response = await manager.request.delete(`/api/v1/roles/${nonExistentId}`);
      expect(response.status).toBe(404);
    });
  });

  describe('Role-Permission Associations (/api/v1/roles/:id/permissions)', () => {
    let testRole: RoleDto;
    let perm1: PermissionDto;
    let perm2: PermissionDto;

    beforeEach(async () => {
      testRole = await createRole('RoleForPermissionTests_' + faker.string.alphanumeric(3));
      perm1 = await createPermission('permAssoc1:' + faker.string.alphanumeric(3));
      perm2 = await createPermission('permAssoc2:' + faker.string.alphanumeric(3));
    });

    it('should assign a permission to a role and return 204', async () => {
      const assignPayload: AssignPermissionToRoleDto = { permissionId: perm1.id };
      const response = await manager.request
        .post(`/api/v1/roles/${testRole.id}/permissions`)
        .send(assignPayload);
      expect(response.status).toBe(204);

      // Verify by fetching permissions for the role
      const getPermsResponse = await manager.request.get(
        `/api/v1/roles/${testRole.id}/permissions`,
      );
      expect(getPermsResponse.status).toBe(200);
      expect(getPermsResponse.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: perm1.id })]),
      );
    });

    it('should return 404 when assigning permission to non-existent role', async () => {
      const assignPayload: AssignPermissionToRoleDto = { permissionId: perm1.id };
      const nonExistentRoleId = 99999;
      const response = await manager.request
        .post(`/api/v1/roles/${nonExistentRoleId}/permissions`)
        .send(assignPayload);
      expect(response.status).toBe(404);
    });

    it('should return 404 when assigning non-existent permission to a role', async () => {
      const nonExistentPermissionId = 88888;
      const assignPayload: AssignPermissionToRoleDto = { permissionId: nonExistentPermissionId };
      const response = await manager.request
        .post(`/api/v1/roles/${testRole.id}/permissions`)
        .send(assignPayload);
      expect(response.status).toBe(404);
    });

    it('should get all permissions for a role', async () => {
      // Assign perm1 and perm2 to testRole
      await manager.request
        .post(`/api/v1/roles/${testRole.id}/permissions`)
        .send({ permissionId: perm1.id });
      await manager.request
        .post(`/api/v1/roles/${testRole.id}/permissions`)
        .send({ permissionId: perm2.id });

      const response = await manager.request.get(`/api/v1/roles/${testRole.id}/permissions`);
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: perm1.id, name: perm1.name }),
          expect.objectContaining({ id: perm2.id, name: perm2.name }),
        ]),
      );
    });

    it('should return empty array if role has no permissions', async () => {
      const response = await manager.request.get(`/api/v1/roles/${testRole.id}/permissions`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should remove a permission from a role and return 204', async () => {
      // Assign perm1 first
      await manager.request
        .post(`/api/v1/roles/${testRole.id}/permissions`)
        .send({ permissionId: perm1.id });

      const deleteResponse = await manager.request.delete(
        `/api/v1/roles/${testRole.id}/permissions/${perm1.id}`,
      );
      expect(deleteResponse.status).toBe(204);

      // Verify perm1 is no longer associated
      const getPermsResponse = await manager.request.get(
        `/api/v1/roles/${testRole.id}/permissions`,
      );
      expect(getPermsResponse.status).toBe(200);
      expect(getPermsResponse.body).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ id: perm1.id })]),
      );
    });

    it('should return 204 even if trying to remove a permission not assigned to role', async () => {
      const unassignedPermissionId = perm2.id; // perm2 was not assigned in this specific test path before delete
      const response = await manager.request.delete(
        `/api/v1/roles/${testRole.id}/permissions/${unassignedPermissionId}`,
      );
      expect(response.status).toBe(204); // Should be idempotent for removal of non-existent link
    });

    it('should return 404 when removing permission from a non-existent role', async () => {
      const nonExistentRoleId = 99999;
      const response = await manager.request.delete(
        `/api/v1/roles/${nonExistentRoleId}/permissions/${perm1.id}`,
      );
      expect(response.status).toBe(404);
    });
  });
});
