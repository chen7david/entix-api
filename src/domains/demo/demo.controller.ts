import { JsonController, Get, Authorized, CurrentUser, Param } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Injectable } from '@shared/utils/ioc.util';
import { LoggerService } from '@shared/services/logger/logger.service';
import { Logger } from '@shared/types/logger.type';
import { AuthUser } from '@shared/services/auth/auth-verification.service';
import { ForbiddenError } from '@shared/utils/error/error.util';

/**
 * Demo controller to showcase authentication and authorization
 */
@Injectable()
@JsonController('/api/v1/demo')
@OpenAPI({ summary: 'Demo endpoints for auth testing' })
export class DemoController {
  private readonly logger: Logger;

  /**
   * Creates an instance of DemoController
   * @param loggerService - The logger service for logging events
   */
  constructor(private readonly loggerService: LoggerService) {
    this.logger = this.loggerService.component('DemoController');
  }

  /**
   * Public endpoint that doesn't require authentication
   * @returns Public endpoint message with timestamp
   */
  @Get('/public')
  @OpenAPI({ summary: 'Public endpoint - no auth required' })
  getPublic() {
    return {
      message: 'This is a public endpoint',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Authenticated endpoint - any valid token works
   * @param user - The authenticated user
   * @returns Authentication confirmation with user details
   */
  @Get('/authenticated')
  @Authorized()
  @OpenAPI({ summary: 'Authenticated endpoint - any valid token works' })
  getAuthenticated(@CurrentUser() user: AuthUser) {
    return {
      message: 'You are authenticated!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Permission-based endpoint using @Authorized
   * @param user - The authenticated user
   * @returns Message confirming user has admin permission
   */
  @Get('/admin')
  @Authorized(['admin'])
  @OpenAPI({ summary: 'Admin endpoint - requires admin permission' })
  getAdminOnly(@CurrentUser() user: AuthUser) {
    return {
      message: 'You have admin permission!',
      roles: user.roles,
      permissions: user.permissions,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Permission-based endpoint using @Authorized
   * @param user - The authenticated user
   * @returns Message with user's permissions
   */
  @Get('/users')
  @Authorized(['users:read'])
  @OpenAPI({ summary: 'Permission-based endpoint - requires users:read permission' })
  getUsers(@CurrentUser() user: AuthUser) {
    return {
      message: 'You have permission to read users!',
      permissions: user.permissions,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Demo of manual permission checking
   * @param id - Resource ID to access
   * @param user - The authenticated user
   * @returns Message confirming resource access
   */
  @Get('/resource/:id')
  @Authorized()
  @OpenAPI({ summary: 'Manual permission check demo' })
  getResource(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    // Example of manually checking permissions in the controller
    if (id === 'admin' && !user.permissions.includes('admin')) {
      throw new ForbiddenError('Admin permission required');
    }

    if (!user.permissions.includes('read:resources')) {
      this.logger.warn('User attempted to access resource without permission', {
        userId: user.id,
        resourceId: id,
      });
      throw new ForbiddenError('You need the read:resources permission');
    }

    return {
      message: `Accessed resource ${id}`,
      timestamp: new Date().toISOString(),
    };
  }
}
