import { Injectable } from '@shared/utils/ioc.util';
import { Logger } from '@shared/types/logger.type';
import { LoggerService } from '@shared/services/logger/logger.service';
import { validateBody, validateParams } from '@shared/middleware/validation.middleware';
import {
  CreateRoleDto,
  UpdateRoleDto,
  RoleIdParamDto,
  RoleDto,
  AssignPermissionToRoleDto,
  DeleteRolePermissionParamsDto,
} from '@domains/role/role.dto';
import { PermissionDto } from '@domains/permission/permission.dto';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { RoleService } from '@domains/role/role.service';
import { Role } from '@domains/role/role.model';
import {
  JsonController,
  Get,
  UseBefore,
  Post,
  Body,
  Param,
  Put,
  Delete,
  OnUndefined,
  HttpCode,
} from 'routing-controllers';

/** Helper to map Role entity to RoleDto */
const toRoleDto = (role: Role): RoleDto => ({
  id: role.id,
  name: role.name,
  createdAt: role.createdAt,
  updatedAt: role.updatedAt,
  // deletedAt is omitted in RoleDto
});

/**
 * Controller for managing roles.
 */
@JsonController('/api/v1/roles')
@Injectable()
export class RolesController {
  private readonly logger: Logger;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly roleService: RoleService,
  ) {
    this.logger = this.loggerService.component('RolesController');
  }

  /**
   * Get all roles.
   */
  @OpenAPI({
    summary: 'Get all roles',
    description: 'Returns a list of all roles.',
    tags: ['Roles'],
  })
  @ResponseSchema('RoleDto', { isArray: true, description: 'List of roles' })
  @Get('/')
  async getAll(): Promise<RoleDto[]> {
    this.logger.info('Fetching all roles');
    const roles = await this.roleService.findAll();
    return roles.map(toRoleDto);
  }

  /**
   * Get a role by its ID.
   */
  @OpenAPI({
    summary: 'Get role by ID',
    description: 'Fetch a single role by its unique ID.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', format: 'int32' }, // Role ID is number
        description: 'The ID of the role to retrieve',
      },
    ],
    responses: {
      '404': { description: 'Role not found' },
    },
    tags: ['Roles'],
  })
  @ResponseSchema('RoleDto', { description: 'The role object' })
  @Get('/:id')
  @UseBefore(validateParams(RoleIdParamDto))
  async getById(@Param('id') id: number): Promise<RoleDto> {
    this.logger.info('Fetching role by ID', { id });
    const role = await this.roleService.findById(id);
    return toRoleDto(role);
  }

  /**
   * Create a new role.
   */
  @OpenAPI({
    summary: 'Create role',
    description: 'Create a new role with the provided name.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/CreateRoleDto' },
        },
      },
    },
    responses: {
      '400': { description: 'Invalid input (e.g., validation error)' },
      '409': { description: 'Role with this name already exists' },
      '422': { description: 'Validation error' },
    },
    tags: ['Roles'],
  })
  @ResponseSchema('RoleDto', { statusCode: 201, description: 'The created role' })
  @Post('/')
  @HttpCode(201)
  @UseBefore(validateBody(CreateRoleDto))
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleDto> {
    this.logger.info('Creating role', { name: createRoleDto.name });
    const role = await this.roleService.create(createRoleDto);
    return toRoleDto(role);
  }

  /**
   * Update an existing role by its ID.
   */
  @OpenAPI({
    summary: 'Update role',
    description: 'Update an existing role by its unique ID.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', format: 'int32' },
        description: 'The ID of the role to update',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/UpdateRoleDto' },
        },
      },
    },
    responses: {
      '404': { description: 'Role not found' },
      '409': { description: 'Role with this name already exists' },
      '422': { description: 'Validation error' },
    },
    tags: ['Roles'],
  })
  @ResponseSchema('RoleDto', { description: 'The updated role' })
  @HttpCode(200) // PUT for update usually returns 200
  @Put('/:id')
  @UseBefore(validateParams(RoleIdParamDto))
  @UseBefore(validateBody(UpdateRoleDto))
  async update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto): Promise<RoleDto> {
    this.logger.info('Updating role', { id, name: updateRoleDto.name });
    const role = await this.roleService.update(id, updateRoleDto);
    return toRoleDto(role);
  }

  /**
   * Delete a role by its ID.
   */
  @OpenAPI({
    summary: 'Delete role',
    description: 'Delete a role by its unique ID (soft delete). Returns 204 if successful.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer', format: 'int32' },
        description: 'The ID of the role to delete',
      },
    ],
    responses: {
      '204': { description: 'Role deleted successfully' },
      '404': { description: 'Role not found' },
    },
    tags: ['Roles'],
  })
  @Delete('/:id')
  @UseBefore(validateParams(RoleIdParamDto))
  @OnUndefined(204) // Return 204 No Content on successful deletion
  async delete(@Param('id') id: number): Promise<void> {
    this.logger.info('Deleting role', { id });
    await this.roleService.delete(id);
  }

  /**
   * Get all permissions for a specific role.
   */
  @OpenAPI({
    summary: 'Get permissions for a role',
    description: 'Returns a list of all permissions assigned to a specific role.',
    tags: ['Roles', 'Permissions'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
        description: 'The ID of the role',
      },
    ],
  })
  @ResponseSchema('PermissionDto', {
    isArray: true,
    description: 'List of permissions for the role',
  })
  @Get('/:id/permissions')
  @UseBefore(validateParams(RoleIdParamDto))
  async getPermissionsForRole(@Param('id') roleId: number): Promise<PermissionDto[]> {
    this.logger.info('Fetching permissions for role', { roleId });
    return this.roleService.getPermissionsForRole(roleId);
  }

  /**
   * Assign a permission to a role.
   */
  @OpenAPI({
    summary: 'Assign permission to role',
    description: 'Assigns a specific permission to a role.',
    tags: ['Roles', 'Permissions'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
        description: 'The ID of the role',
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/AssignPermissionToRoleDto' },
        },
      },
    },
    responses: {
      '204': { description: 'Permission assigned successfully' },
      '404': { description: 'Role or Permission not found' },
    },
  })
  @Post('/:id/permissions')
  @UseBefore(validateParams(RoleIdParamDto))
  @UseBefore(validateBody(AssignPermissionToRoleDto))
  @OnUndefined(204) // Return 204 No Content on success
  async assignPermission(
    @Param('id') roleId: number,
    @Body() assignDto: AssignPermissionToRoleDto,
  ): Promise<void> {
    this.logger.info('Assigning permission to role', {
      roleId,
      permissionId: assignDto.permissionId,
    });
    await this.roleService.assignPermissionToRole(roleId, assignDto.permissionId);
  }

  /**
   * Remove a permission from a role.
   */
  @OpenAPI({
    summary: 'Remove permission from role',
    description: 'Removes a specific permission from a role.',
    tags: ['Roles', 'Permissions'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
        description: 'The ID of the role',
      },
      {
        name: 'permissionId',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
        description: 'The ID of the permission to remove',
      },
    ],
    responses: {
      '204': { description: 'Permission removed successfully' },
      '404': { description: 'Role not found' },
    },
  })
  @Delete('/:id/permissions/:permissionId')
  @UseBefore(validateParams(DeleteRolePermissionParamsDto))
  @OnUndefined(204)
  async removePermission(
    @Param('id') roleId: number,
    @Param('permissionId') permissionId: number,
  ): Promise<void> {
    this.logger.info('Removing permission from role', { roleId, permissionId });
    await this.roleService.removePermissionFromRole(roleId, permissionId);
  }
}
