import { Injectable } from '@shared/utils/ioc.util';
import { Logger } from '@shared/types/logger.type';
import { LoggerService } from '@shared/services/logger/logger.service';
import { validateBody, validateParams } from '@shared/middleware/validation.middleware';
import { TenantService } from '@domains/tenant/tenant.service';
import {
  CreateTenantDto,
  TenantDto,
  TenantIdParamDto,
  UpdateTenantDto,
} from '@domains/tenant/tenant.dto';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import {
  JsonController,
  Get,
  UseBefore,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  OnUndefined,
  HttpCode,
} from 'routing-controllers';

/**
 * TenantController handles tenant-related endpoints.
 */
@JsonController('/api/v1/tenants')
@Injectable()
export class TenantController {
  private readonly logger: Logger;

  /**
   * Creates an instance of TenantController.
   * @param loggerService - Logger service for creating child loggers
   * @param tenantService - Service for tenant-related business logic
   */
  constructor(
    private readonly loggerService: LoggerService,
    private readonly tenantService: TenantService,
  ) {
    this.logger = this.loggerService.component('TenantController');
  }

  /**
   * Get all tenants.
   */
  @Get('/')
  @OpenAPI({
    summary: 'List all tenants',
    description: 'Returns a list of all tenants in the system',
    tags: ['Tenants'],
  })
  @ResponseSchema('TenantDto', { isArray: true })
  async findAll(): Promise<TenantDto[]> {
    this.logger.debug('List tenants request received');
    return this.tenantService.findAll();
  }

  /**
   * Get a tenant by ID.
   */
  @Get('/:id')
  @UseBefore(validateParams(TenantIdParamDto))
  @OpenAPI({
    summary: 'Get a tenant by ID',
    description: 'Returns a single tenant by its ID',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    responses: {
      '404': { description: 'Tenant not found' },
    },
    tags: ['Tenants'],
  })
  @ResponseSchema('TenantDto')
  async findById(@Param('id') id: string): Promise<TenantDto> {
    this.logger.debug('Get tenant request received', { id });
    return this.tenantService.findById(id);
  }

  /**
   * Create a new tenant with admin user.
   */
  @Post('/')
  @HttpCode(201)
  @UseBefore(validateBody(CreateTenantDto))
  @OpenAPI({
    summary: 'Create a new tenant',
    description: 'Creates a new tenant with an admin user',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/CreateTenantDto' },
        },
      },
    },
    responses: {
      '201': { description: 'The created tenant' },
      '400': { description: 'Invalid input' },
    },
    tags: ['Tenants'],
  })
  @ResponseSchema('TenantDto')
  async create(@Body() createTenantDto: CreateTenantDto): Promise<TenantDto> {
    this.logger.debug('Create tenant request received', { name: createTenantDto.name });
    return this.tenantService.create(createTenantDto);
  }

  /**
   * Update a tenant by ID.
   */
  @Patch('/:id')
  @UseBefore(validateParams(TenantIdParamDto))
  @UseBefore(validateBody(UpdateTenantDto))
  @OpenAPI({
    summary: 'Update a tenant',
    description: 'Updates an existing tenant by its ID',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/UpdateTenantDto' },
        },
      },
    },
    responses: {
      '200': { description: 'The updated tenant' },
      '404': { description: 'Tenant not found' },
    },
    tags: ['Tenants'],
  })
  @ResponseSchema('TenantDto')
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<TenantDto> {
    this.logger.debug('Update tenant request received', { id });
    return this.tenantService.update(id, updateTenantDto);
  }

  /**
   * Delete a tenant by ID.
   */
  @Delete('/:id')
  @UseBefore(validateParams(TenantIdParamDto))
  @OnUndefined(204)
  @OpenAPI({
    summary: 'Delete a tenant',
    description: 'Deletes a tenant by its ID (soft delete)',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    ],
    responses: {
      '204': { description: 'Tenant deleted successfully' },
      '404': { description: 'Tenant not found' },
    },
    tags: ['Tenants'],
  })
  async delete(@Param('id') id: string): Promise<void> {
    this.logger.debug('Delete tenant request received', { id });
    await this.tenantService.delete(id);
  }
}
