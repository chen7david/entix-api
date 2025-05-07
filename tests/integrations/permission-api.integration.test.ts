import { IntegrationTestManager } from '@tests/utils/integration-test-manager.util';
import { faker } from '@faker-js/faker';
import type {
  PermissionDto,
  CreatePermissionDto,
  UpdatePermissionDto,
} from '@domains/permission/permission.dto';
import { Container } from 'typedi';
import { permissionsTable } from '@domains/permission/permission.schema';
import { DatabaseService } from '@shared/services/database/database.service';

let manager: IntegrationTestManager;
let dbService: DatabaseService;

beforeAll(async () => {
  manager = Container.get(IntegrationTestManager);
  dbService = Container.get(DatabaseService);
});

beforeEach(async () => {
  await dbService.db.delete(permissionsTable);
});
afterAll(async () => {
  await manager.close();
});

describe('Permission API - Integration', () => {
  describe('POST /api/v1/permissions', () => {
    it('should create a new permission and return 201', async () => {
      const payload: CreatePermissionDto = { name: 'res:' + faker.string.alphanumeric(5) };
      const response = await manager.request.post('/api/v1/permissions').send(payload);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ name: payload.name });
      expect(response.body).toHaveProperty('id');
    });
    it('should return 409 if name already exists', async () => {
      const name = 'res:' + faker.string.alphanumeric(5);
      await manager.request.post('/api/v1/permissions').send({ name });
      const response = await manager.request.post('/api/v1/permissions').send({ name });
      expect(response.status).toBe(409);
    });
    it('should return 422 for invalid name format', async () => {
      const response = await manager.request
        .post('/api/v1/permissions')
        .send({ name: 'invalid name with spaces' });
      expect(response.status).toBe(422);
    });
  });

  describe('GET /api/v1/permissions', () => {
    it('should return empty array initially', async () => {
      const response = await manager.request.get('/api/v1/permissions');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
    it('should return created permissions', async () => {
      const p1 = { name: 'resA:' + faker.string.alphanumeric(3) };
      await manager.request.post('/api/v1/permissions').send(p1);
      const getRes = await manager.request.get('/api/v1/permissions');
      expect(getRes.body.length).toBe(1);
      expect(getRes.body[0].name).toBe(p1.name);
    });
  });

  describe('GET /api/v1/permissions/:id', () => {
    it('should return 404 for non-existent ID', async () => {
      const response = await manager.request.get('/api/v1/permissions/9999');
      expect(response.status).toBe(404);
    });
    it('should return existing permission', async () => {
      const p = { name: 'resX:' + faker.string.alphanumeric(4) };
      const createRes = await manager.request.post('/api/v1/permissions').send(p);
      const created = createRes.body as PermissionDto;
      const response = await manager.request.get(`/api/v1/permissions/${created.id}`);
      expect(response.status).toBe(200);
      expect(response.body.name).toBe(p.name);
    });
  });

  describe('PUT /api/v1/permissions/:id', () => {
    it('should update existing permission', async () => {
      const p = { name: 'resOld:' + faker.string.alphanumeric(4) };
      const createRes = await manager.request.post('/api/v1/permissions').send(p);
      const created = createRes.body as PermissionDto;
      const updatePayload: UpdatePermissionDto = { name: 'resNew:' + faker.string.alphanumeric(4) };
      const response = await manager.request
        .put(`/api/v1/permissions/${created.id}`)
        .send(updatePayload);
      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updatePayload.name);
    });
    it('should return 409 on conflicting update name', async () => {
      const p1 = { name: 'pConflict1:' + faker.string.alphanumeric(3) };
      const p2 = { name: 'pConflict2:' + faker.string.alphanumeric(3) };
      await manager.request.post('/api/v1/permissions').send(p1);
      const p2Res = await manager.request.post('/api/v1/permissions').send(p2);
      const p2Created = p2Res.body as PermissionDto;
      const response = await manager.request
        .put(`/api/v1/permissions/${p2Created.id}`)
        .send({ name: p1.name });
      expect(response.status).toBe(409);
    });
  });

  describe('DELETE /api/v1/permissions/:id', () => {
    it('should soft delete and return 204', async () => {
      const p = { name: 'resDel:' + faker.string.alphanumeric(4) };
      const createRes = await manager.request.post('/api/v1/permissions').send(p);
      const created = createRes.body as PermissionDto;
      const delRes = await manager.request.delete(`/api/v1/permissions/${created.id}`);
      expect(delRes.status).toBe(204);
      const getRes = await manager.request.get(`/api/v1/permissions/${created.id}`);
      expect(getRes.status).toBe(404);
    });
  });
});
