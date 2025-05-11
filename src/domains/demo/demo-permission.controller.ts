import { JsonController, Get, Authorized, CurrentUser, Param } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Injectable } from '@shared/utils/ioc.util';
import { LoggerService } from '@shared/services/logger/logger.service';
import { Logger } from '@shared/types/logger.type';
import { AuthUser } from '@shared/services/auth/auth-verification.service';

/**
 * Demo controller to showcase permission-based authorization using the built-in @Authorized decorator
 * This controller demonstrates how to use the @Authorized decorator for permission-based access control
 */
@Injectable()
@JsonController('/api/v1/demo-permissions')
@OpenAPI({ summary: 'Demo endpoints for permission-based auth testing' })
export class DemoPermissionController {
  private readonly logger: Logger;

  /**
   * Creates an instance of DemoPermissionController
   * @param loggerService - The logger service for logging events
   */
  constructor(private readonly loggerService: LoggerService) {
    this.logger = this.loggerService.component('DemoPermissionController');
  }

  /**
   * Public endpoint that doesn't require authentication
   * @returns A message indicating this is a public endpoint with timestamp
   */
  @Get('/public')
  @OpenAPI({ summary: 'Public endpoint - no auth required' })
  getPublic() {
    this.logger.debug('Public endpoint accessed');
    return {
      message: 'This is a public endpoint',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Permission-based endpoint using the prefix syntax
   * @param user - The authenticated user requesting access
   * @returns Information about the authenticated user and their permissions
   */
  @Get('/users')
  @Authorized(['perm:users:read'])
  @OpenAPI({ summary: 'Permission-based endpoint - requires users:read permission' })
  getUsersWithPermission(@CurrentUser() user: AuthUser) {
    this.logger.info('Users endpoint accessed with permission', { username: user.username });
    return {
      message: 'You have permission to read users!',
      permissions: user.permissions,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Permission-based endpoint for admin resource access
   * @param user - The authenticated user requesting access
   * @returns Information about the authenticated user accessing admin resources
   */
  @Get('/admin-resource')
  @Authorized(['perm:admin:resource:read'])
  @OpenAPI({
    summary: 'Admin permission endpoint - requires admin:resource:read permission',
  })
  getAdminResource(@CurrentUser() user: AuthUser) {
    this.logger.info('Admin resource accessed', {
      username: user.username,
      hasPermission: user.permissions.includes('admin:resource:read'),
    });

    return {
      message: 'You accessed an admin resource!',
      user: {
        id: user.id,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Multiple permission options endpoint
   * @param id - The resource ID being accessed
   * @param user - The authenticated user requesting access
   * @returns Information about the resource access with access type
   */
  @Get('/resources/:id')
  @Authorized(['perm:resources:read', 'perm:resources:admin'])
  @OpenAPI({
    summary:
      'Multiple permission options - requires either resources:read OR resources:admin permission',
  })
  getResource(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const accessType = user.permissions.includes('resources:admin') ? 'admin' : 'read-only';

    this.logger.info('Resource accessed', {
      resourceId: id,
      username: user.username,
      accessType,
    });

    return {
      message: `Access granted to resource ${id}`,
      accessType,
      timestamp: new Date().toISOString(),
    };
  }
}
