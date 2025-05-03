import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Injectable } from '@shared/utils/ioc.util';
import { DatabaseService } from '@shared/services/database/database.service';
import { tenants } from '@domains/tenant/tenant.schema';
import { userTenantRoles } from '@domains/join-tables/user-tenant-roles.schema';
import { permissions } from '@domains/permission/permission.schema';
import { rolePermissions } from '@domains/join-tables/role-permissions.schema';
import { eq, and } from 'drizzle-orm';
import type { Request, Response } from 'express';

// Extend Express Request to include userId
interface AuthenticatedRequest extends Request {
  userId: string;
}

/**
 * Tenant selection middleware for routing-controllers.
 * Looks up tenant and user-tenant-role from the database.
 */
@Middleware({ type: 'before' })
@Injectable()
export class TenantContextMiddleware implements ExpressMiddlewareInterface {
  constructor(private readonly dbService: DatabaseService) {}

  async use(request: Request, response: Response): Promise<void> {
    const req = request as AuthenticatedRequest;
    try {
      const tenantSlug =
        (req.params as Record<string, string>).tenantSlug || req.headers['x-tenant-slug'];
      if (!tenantSlug || typeof tenantSlug !== 'string') {
        response.status(400).json({ message: 'Tenant not specified' });
        return;
      }
      // Get tenant from database
      const tenant = await this.dbService.db
        .select()
        .from(tenants)
        .where(eq(tenants.name, tenantSlug))
        .then((rows) => rows[0]);
      if (!tenant) {
        response.status(404).json({ message: 'Tenant not found' });
        return;
      }
      // Get user's role in this tenant
      const userTenantRole = await this.dbService.db
        .select()
        .from(userTenantRoles)
        .where(and(eq(userTenantRoles.userId, req.userId), eq(userTenantRoles.tenantId, tenant.id)))
        .then((rows) => rows[0]);
      if (!userTenantRole) {
        response.status(403).json({ message: 'Access denied to this tenant' });
        return;
      }
      // Store context for later middleware/controllers (example: response.locals)
      response.locals.tenantId = tenant.id;
      response.locals.userId = req.userId;
      // Call next middleware (routing-controllers will handle this)
    } catch (error) {
      console.error('Tenant selection error:', error);
      response.status(500).json({ message: 'Failed to select tenant' });
    }
  }
}

/**
 * Permission check helper (to be used in services/controllers).
 * Checks if a user has a permission in a tenant, no caching.
 * Accepts a context object with dbService, userId, tenantId.
 */
export async function hasPermission(
  context: { dbService: DatabaseService; userId: string; tenantId: string },
  permissionName: string,
): Promise<boolean> {
  const { dbService, userId, tenantId } = context;
  // Get the user's role in the tenant
  const userRole = await dbService.db
    .select()
    .from(userTenantRoles)
    .where(and(eq(userTenantRoles.userId, userId), eq(userTenantRoles.tenantId, tenantId)))
    .then((rows) => rows[0]);
  if (!userRole) return false;
  // Get the permission
  const permission = await dbService.db
    .select()
    .from(permissions)
    .where(eq(permissions.name, permissionName))
    .then((rows) => rows[0]);
  if (!permission) return false;
  // Check if the role has the permission
  const rolePermission = await dbService.db
    .select()
    .from(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, userRole.roleId),
        eq(rolePermissions.permissionId, permission.id),
      ),
    )
    .then((rows) => rows[0]);
  return !!rolePermission;
}
