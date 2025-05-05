import { Injectable } from '@shared/utils/ioc.util';
import { Logger } from '@shared/types/logger.type';
import { LoggerService } from '@shared/services/logger/logger.service';
import { validateBody, validateParams } from '@shared/middleware/validation.middleware';
import {
  CreateTenantDto,
  UpdateTenantDto,
  CreateTenantDtoSchema,
  UpdateTenantDtoSchema,
  TenantIdParamDtoSchema,
} from '@domains/tenant/tenant.dto';
import { Tenant } from '@domains/tenant/tenant.model';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { TenantService } from '@domains/tenant/tenant.service';
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

/**
 * TenantsController handles tenant-related endpoints.
 */
@JsonController('/api/v1/tenants')
@Injectable()
export class TenantsController {
  private readonly logger: Logger;

  constructor(
    private readonly loggerService: LoggerService,
    private readonly tenantService: TenantService,
  ) {
    this.logger = this.loggerService.component('TenantsController');
  }

  /**
   * Get all tenants.
   */
  @OpenAPI({
    summary: 'Get all tenants',
    description: 'Returns a list of all tenants in the system.',
    tags: ['Tenants'],
  })
  @ResponseSchema('TenantDto', { isArray: true })
  @Get('/')
  async getAll(): Promise<Tenant[]> {
    this.logger.info('Fetching all tenants');
    return this.tenantService.findAll();
  }

  /**
   * Get a tenant by ID.
   */
  @OpenAPI({
    summary: 'Get tenant by ID',
    description: 'Fetch a single tenant by their unique ID.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'The UUID of the tenant to retrieve',
      },
    ],
    responses: {
      '404': { description: 'Tenant not found' },
    },
    tags: ['Tenants'],
  })
  @ResponseSchema('TenantDto', { statusCode: 200, description: 'The tenant object' })
  @Get('/:id')
  @UseBefore(validateParams(TenantIdParamDtoSchema))
  async getById(@Param('id') id: string): Promise<Tenant> {
    this.logger.info('Fetching tenant by ID', { id });
    return this.tenantService.findById(id);
  }

  /**
   * Create a new tenant with an associated user.
   */
  @OpenAPI({
    summary: 'Create tenant',
    description: 'Create a new tenant with the provided details and initial admin user.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/CreateTenantDto' },
        },
      },
    },
    responses: {
      '400': { description: 'Invalid input' },
      '409': { description: 'Tenant with the same name already exists' },
    },
    tags: ['Tenants'],
  })
  @ResponseSchema('TenantDto', { statusCode: 201, description: 'The created tenant' })
  @Post('/')
  @HttpCode(201)
  @UseBefore(validateBody(CreateTenantDtoSchema))
  async create(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
    this.logger.info('Creating tenant', { name: createTenantDto.name });
    return this.tenantService.create(createTenantDto);
  }

  /**
   * Update a tenant by ID.
   */
  @OpenAPI({
    summary: 'Update tenant',
    description: 'Update an existing tenant by their unique ID.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'The UUID of the tenant to update',
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
      '404': { description: 'Tenant not found' },
      '409': { description: 'Tenant with the same name already exists' },
    },
    tags: ['Tenants'],
  })
  @ResponseSchema('TenantDto')
  @HttpCode(200)
  @Put('/:id')
  @UseBefore(validateParams(TenantIdParamDtoSchema))
  @UseBefore(validateBody(UpdateTenantDtoSchema))
  async update(@Param('id') id: string, @Body() data: UpdateTenantDto): Promise<Tenant> {
    this.logger.info('Updating tenant', { id });
    return this.tenantService.update(id, data);
  }

  /**
   * Delete a tenant by ID.
   */
  @OpenAPI({
    summary: 'Delete tenant',
    description: 'Delete a tenant by their unique ID. Returns 204 if successful.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'The UUID of the tenant to delete',
      },
    ],
    responses: {
      '204': { description: 'Tenant deleted successfully' },
      '404': { description: 'Tenant not found' },
    },
    tags: ['Tenants'],
  })
  @Delete('/:id')
  @UseBefore(validateParams(TenantIdParamDtoSchema))
  @OnUndefined(204)
  async delete(@Param('id') id: string): Promise<void> {
    this.logger.info('Deleting tenant', { id });
    await this.tenantService.delete(id);
  }
}
