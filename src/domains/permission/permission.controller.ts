import { Injectable } from '@shared/utils/ioc.util';
import { Logger } from '@shared/types/logger.type';
import { LoggerService } from '@shared/services/logger/logger.service';
import { validateBody, validateParams } from '@shared/middleware/validation.middleware';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionIdParamDto,
  PermissionDto,
} from '@domains/permission/permission.dto';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { PermissionService } from '@domains/permission/permission.service';
import { Permission } from '@domains/permission/permission.model';
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

/** Helper to map Permission entity to PermissionDto */
const toPermissionDto = (permission: Permission): PermissionDto => ({
  id: permission.id,
  name: permission.name,
  createdAt: permission.createdAt,
  updatedAt: permission.updatedAt,
  // deletedAt is omitted in PermissionDto
});

/**
 * Controller for managing permissions.
 */
@JsonController('/api/v1/permissions')
@Injectable()
export class PermissionsController {
  private readonly logger: Logger;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly permissionService: PermissionService,
  ) {
    this.logger = this.loggerService.component('PermissionsController');
  }

  @OpenAPI({ summary: 'Get all permissions', tags: ['Permissions'] })
  @ResponseSchema('PermissionDto', { isArray: true })
  @Get('/')
  async getAll(): Promise<PermissionDto[]> {
    this.logger.info('Fetching all permissions');
    const permissions = await this.permissionService.findAll();
    return permissions.map(toPermissionDto);
  }

  @OpenAPI({ summary: 'Get permission by ID', tags: ['Permissions'] })
  @ResponseSchema('PermissionDto')
  @Get('/:id')
  @UseBefore(validateParams(PermissionIdParamDto))
  async getById(@Param('id') id: number): Promise<PermissionDto> {
    this.logger.info('Fetching permission by ID', { id });
    const permission = await this.permissionService.findById(id);
    return toPermissionDto(permission);
  }

  @OpenAPI({ summary: 'Create permission', tags: ['Permissions'] })
  @ResponseSchema('PermissionDto', { statusCode: 201 })
  @Post('/')
  @HttpCode(201)
  @UseBefore(validateBody(CreatePermissionDto))
  async create(@Body() createDto: CreatePermissionDto): Promise<PermissionDto> {
    this.logger.info('Creating permission', { name: createDto.name });
    const permission = await this.permissionService.create(createDto);
    return toPermissionDto(permission);
  }

  @OpenAPI({ summary: 'Update permission', tags: ['Permissions'] })
  @ResponseSchema('PermissionDto')
  @Put('/:id')
  @HttpCode(200)
  @UseBefore(validateParams(PermissionIdParamDto))
  @UseBefore(validateBody(UpdatePermissionDto))
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdatePermissionDto,
  ): Promise<PermissionDto> {
    this.logger.info('Updating permission', { id, name: updateDto.name });
    const permission = await this.permissionService.update(id, updateDto);
    return toPermissionDto(permission);
  }

  @OpenAPI({ summary: 'Delete permission', tags: ['Permissions'] })
  @Delete('/:id')
  @UseBefore(validateParams(PermissionIdParamDto))
  @OnUndefined(204)
  async delete(@Param('id') id: number): Promise<void> {
    this.logger.info('Deleting permission', { id });
    await this.permissionService.delete(id);
  }
}
